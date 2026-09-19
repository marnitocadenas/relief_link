<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\{AidRequestResource, DonationMatchResource, DonationResource, UserResource};
use App\Models\{ActivityLog, AidRequest, Donation, DonationMatch, InventoryMovement, User};
use App\Services\{ActivityService, AlertService, MatchingService, SystemSettings};
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Response;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class AdminController extends Controller
{
    public function stats()
    {
        $t = DonationMatch::count();
        return [
            'total_donations' => Donation::count(),
            'total_requests' => AidRequest::count(),
            'total_matches' => $t,
            'fulfillment_rate' => $t ? round(DonationMatch::where('status', 'fulfilled')->count() / $t * 100) : 0,
            'pending_reviews' => AidRequest::where('status', 'pending_review')->count(),
            'proposed_matches' => DonationMatch::where('status', 'proposed')->count(),
            'role_counts' => User::selectRaw('role,count(*) as total')->groupBy('role')->get(),
            'priority_queue' => AidRequest::where('status', 'approved')
                ->orderByRaw("CASE urgency WHEN 'high' THEN 1 WHEN 'medium' THEN 2 ELSE 3 END")
                ->oldest()
                ->limit(5)
                ->get(),
            'low_stock_categories' => Donation::selectRaw('category, sum(quantity) as stock')->where('status', 'pending_match')->groupBy('category')->havingRaw('sum(quantity) < 5')->get(),
            'donation_trends' => Donation::selectRaw('DATE(created_at) as date, count(*) as total')
                ->where('created_at', '>=', now()->subDays(6)->startOfDay())
                ->groupBy('date')->orderBy('date')->get(),
            'request_statuses' => AidRequest::selectRaw('status, count(*) as total')->groupBy('status')->get(),
            'match_statuses' => DonationMatch::selectRaw('status, count(*) as total')->groupBy('status')->get(),
        ];
    }

    public function report()
    {
        return [
            'approval_rate' => AidRequest::count() ? round(AidRequest::where('status', '!=', 'pending_review')->count() / AidRequest::count() * 100) : 0,
            'confirmation_rate' => DonationMatch::count() ? round(DonationMatch::whereIn('status', ['confirmed', 'fulfilled'])->count() / DonationMatch::count() * 100) : 0,
            'coverage' => [
                'active_donors' => User::where('role', 'donor')->count(),
                'active_beneficiaries' => User::where('role', 'beneficiary')->count(),
                'fulfilled_donations' => Donation::where('status', 'fulfilled')->count(),
                'fulfilled_requests' => AidRequest::where('status', 'fulfilled')->count(),
            ],
            'category_balance' => Donation::selectRaw('category,sum(quantity) as donated_quantity')->groupBy('category')->get()->map(fn($d) => [
                'category' => $d->category,
                'donated_quantity' => $d->donated_quantity,
                'requested_quantity' => AidRequest::where('category', $d->category)->sum('quantity_needed')
            ]),
        ];
    }

    public function activities()
    {
        $query = ActivityLog::with('user:id,name')->latest();
        if (request()->user()->role === 'staff') {
            $query->whereIn('subject_type', [AidRequest::class, Donation::class, DonationMatch::class]);
        }
        return $query->paginate(50);
    }

    public function users()
    {
        return UserResource::collection(User::latest()->paginate(30));
    }

    public function storeUser(Request $r)
    {
        $d = $r->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'password' => 'required|min:8',
            'role' => 'required|in:donor,beneficiary,staff,admin',
            'campus_role' => 'nullable|string|max:50',
            'contact_number' => 'nullable|string|max:30',
            'campus_id' => 'nullable|string|max:50',
            'organization_name' => 'nullable|string|max:255',
            'other_role_specify' => 'nullable|string|max:100',
            'country' => 'nullable|string|max:100',
            'country_code' => 'nullable|string|size:2',
        ]);
        $d['password'] = Hash::make($d['password']);
        $u = User::create($d);
        ActivityService::log($r->user(), 'created user', $u);
        return new UserResource($u);
    }

    public function updateUser(Request $r, User $user)
    {
        $d = $r->validate([
            'name' => 'sometimes|required|string|max:255',
            'email' => 'sometimes|required|email|unique:users,email,' . $user->id,
            'password' => 'nullable|min:8',
            'role' => 'sometimes|required|in:donor,beneficiary,staff,admin',
            'campus_role' => 'nullable|string|max:50',
            'contact_number' => 'nullable|string|max:30',
            'campus_id' => 'nullable|string|max:50',
            'organization_name' => 'nullable|string|max:255',
            'other_role_specify' => 'nullable|string|max:100',
            'country' => 'nullable|string|max:100',
            'country_code' => 'nullable|string|size:2',
        ]);
        if (!empty($d['password'])) {
            $d['password'] = Hash::make($d['password']);
        } else {
            unset($d['password']);
        }
        $user->update($d);
        ActivityService::log($r->user(), 'updated user', $user);
        return new UserResource($user);
    }

    public function destroyUser(Request $r, User $user)
    {
        abort_if($user->role === 'admin' && User::where('role', 'admin')->count() === 1, 422, 'Keep at least one administrator.');
        ActivityService::log($r->user(), 'deleted user', $user);
        $user->delete();
        return response()->noContent();
    }

    public function donations(Request $r)
    {
        return DonationResource::collection(Donation::with(['donor', 'matches'])->filter($r->all())->latest()->paginate(50));
    }

    public function inventoryMovements(Request $r)
    {
        return InventoryMovement::with(['staff:id,name', 'donation:id,item_name,category'])
            ->when($r->integer('donation_id'), fn ($query, $id) => $query->where('donation_id', $id))
            ->latest()
            ->paginate(50);
    }

    public function requests(Request $r)
    {
        return AidRequestResource::collection(AidRequest::with(['beneficiary', 'verifiedBy'])->filter($r->all())->latest()->paginate(50));
    }

    public function updateRequest(Request $r, AidRequest $aidRequest)
    {
        // Anti-Fraud Self Approval Check
        if ($r->user()->id === $aidRequest->beneficiary_id) {
            return response()->json(['message' => 'Anti-Fraud Guard: Staff members cannot approve or reject their own aid requests.'], 403);
        }

        $d = $r->validate([
            'status' => 'required|in:approved,rejected,pending_review',
            'verification_tier' => 'nullable|in:unverified,identity_verified,financial_hardship,emergency',
            'verification_state' => 'nullable|in:pending,under_review,needs_revision,approved,rejected',
            'verification_checklist' => 'nullable|array',
            'verification_notes' => 'nullable|string|max:1000',
            'verification_decision_reason' => 'nullable|string|max:1000',
            'student_id_number' => 'nullable|string|max:100',
        ]);

        // The verification decision is authoritative. Keeping status in sync prevents
        // an "approved" message from being sent for a rejected/revision decision.
        if (($d['verification_state'] ?? null) === 'approved') {
            $d['status'] = 'approved';
        } elseif (($d['verification_state'] ?? null) === 'rejected') {
            $d['status'] = 'rejected';
        } elseif (in_array($d['verification_state'] ?? null, ['needs_revision', 'under_review'], true)) {
            $d['status'] = 'pending_review';
        }

        $d['verified_by_user_id'] = $r->user()->id;
        $d['verification_state'] = $d['verification_state'] ?? ($d['status'] === 'approved' ? 'approved' : ($d['status'] === 'rejected' ? 'rejected' : 'needs_revision'));
        if (in_array($d['verification_state'], ['rejected', 'needs_revision'], true) && blank($d['verification_decision_reason'] ?? null)) {
            throw ValidationException::withMessages([
                'verification_decision_reason' => 'A reason is required when rejecting a request or requesting a revision.',
            ]);
        }
        if (in_array($d['verification_state'], ['approved', 'rejected', 'needs_revision'], true)) {
            $d['verification_decided_at'] = now();
        }
        $aidRequest->update($d);

        if ($d['verification_state'] !== 'under_review') {
            $message = match ($d['verification_state']) {
                'needs_revision' => 'Your help request needs additional information before it can be verified.',
                'rejected' => 'Your help request was rejected.',
                'approved' => 'Your help request was approved and is ready for matching.',
                default => 'Your help request was updated.',
            };
            AlertService::send($aidRequest->beneficiary, $message, 'request', $d['verification_state'] === 'rejected' ? 'high' : 'normal', $aidRequest, '/requests');
        }
        ActivityService::log($r->user(), $d['verification_state'] . ' support request', $aidRequest, ['checklist' => $d['verification_checklist'] ?? []]);

        return new AidRequestResource($aidRequest->load(['beneficiary', 'verifiedBy']));
    }

    public function storeWalkInRequest(Request $r, MatchingService $s)
    {
        $d = $r->validate([
            'student_name' => 'required|string|max:255',
            'student_email' => 'required|email',
            'student_id_number' => 'required|string|max:100',
            'category' => 'required|string',
            'quantity_needed' => 'required|integer|min:1',
            'urgency' => 'required|in:low,medium,high',
            'justification' => 'required|string|max:2000',
            'verification_tier' => 'nullable|in:unverified,identity_verified,financial_hardship,emergency',
            'instant_donation_id' => 'nullable|exists:donations,id',
            'staff_internal_notes' => 'nullable|string|max:1000',
            'referral_destination' => 'nullable|string|max:255',
        ]);

        $instantDonation = null;
        if (!empty($d['instant_donation_id'])) {
            $instantDonation = Donation::with('matches')->findOrFail($d['instant_donation_id']);
            $reservedQuantity = (int) $instantDonation->matches
                ->whereIn('status', ['proposed', 'confirmed', 'fulfilled'])
                ->sum('matched_quantity');
            $availableQuantity = $instantDonation->quantity - $reservedQuantity;

            if ($instantDonation->status !== 'pending_match'
                || $instantDonation->category !== $d['category']
                || $instantDonation->condition_grade === 'damaged'
                || ($instantDonation->expiry_date && $instantDonation->expiry_date->isPast())
                || $availableQuantity < $d['quantity_needed']) {
                throw ValidationException::withMessages([
                    'instant_donation_id' => 'The selected item is not an eligible, available match for this walk-in request.',
                ]);
            }
        }

        // Find or register beneficiary
        $user = User::where('email', $d['student_email'])->first();
        if (!$user) {
            $user = User::create([
                'name' => $d['student_name'],
                'email' => $d['student_email'],
                'password' => Hash::make(Str::password(32)),
                'role' => 'beneficiary',
            ]);
        } elseif ($user->role !== 'beneficiary') {
            throw ValidationException::withMessages([
                'student_email' => 'This email belongs to a non-beneficiary account and cannot be used for a walk-in student request.',
            ]);
        }

        $duplicate = AidRequest::where('beneficiary_id', $user->id)
            ->where('category', $d['category'])
            ->whereIn('status', ['pending_review', 'approved', 'proposed', 'matched'])
            ->latest()
            ->first();
        if ($duplicate) {
            return response()->json(['message' => 'A current ' . $d['category'] . ' request already exists for this student (Request #' . $duplicate->id . '). Review that record before opening another walk-in request.'], 422);
        }

        $request = AidRequest::create([
            'beneficiary_id' => $user->id,
            'category' => $d['category'],
            'quantity_needed' => $d['quantity_needed'],
            'urgency' => $d['urgency'],
            'justification' => "[Walk-In Desk] " . $d['justification'],
            'status' => 'approved',
            'is_walk_in' => true,
            'walk_in_status' => !empty($d['referral_destination']) ? 'referred' : (!empty($d['instant_donation_id']) ? 'allocated' : 'waiting'),
            'created_by_staff_id' => $r->user()->id,
            'student_id_number' => $d['student_id_number'],
            'verification_tier' => $d['verification_tier'] ?? 'identity_verified',
            'verified_by_user_id' => $r->user()->id,
            'verification_notes' => 'Walk-in on-site request verified by staff desk.',
            'staff_internal_notes' => $d['staff_internal_notes'] ?? null,
            'referral_destination' => $d['referral_destination'] ?? null,
        ]);

        ActivityService::log($r->user(), 'logged walk-in aid request', $request);

        // Optional Instant Allocation
        if ($instantDonation) {
            DB::transaction(function () use ($instantDonation, $request, $s, $r) {
                $donation = Donation::lockForUpdate()->findOrFail($instantDonation->id);
                $reservedQuantity = (int) $donation->matches()
                    ->whereIn('status', ['proposed', 'confirmed', 'fulfilled'])
                    ->sum('matched_quantity');
                if ($donation->status !== 'pending_match' || ($donation->quantity - $reservedQuantity) < $request->quantity_needed) {
                    throw ValidationException::withMessages([
                        'instant_donation_id' => 'The selected item is no longer available. Refresh inventory and try again.',
                    ]);
                }
                $match = DonationMatch::create([
                    'donation_id' => $donation->id,
                    'request_id' => $request->id,
                    'matched_quantity' => $request->quantity_needed,
                    'status' => 'confirmed',
                    'pickup_hub' => 'Main Relief Desk Hub',
                    'handoff_notes' => 'Instant Walk-in Allocation',
                ]);
                $s->refreshStatuses($match);
                ActivityService::log($r->user(), 'instantly allocated walk-in match', $match);
            });
        }

        return new AidRequestResource($request->load(['beneficiary', 'verifiedBy']));
    }

    public function storeStaffIntake(Request $r)
    {
        $d = $r->validate([
            'donor_id' => 'nullable|exists:users,id',
            'donor_name' => 'required_without:donor_id|string|max:255',
            'item_name' => 'required|string|max:255',
            'category' => 'required|string',
            'quantity' => 'required|integer|min:1',
            'condition_notes' => 'nullable|string',
            'storage_location' => 'required|string|max:255',
            'condition_grade' => 'required|in:new,like_new,good,fair,damaged',
            'intake_notes' => 'nullable|string',
            'expiry_date' => 'nullable|date',
        ]);

        $donorId = $d['donor_id'] ?? null;
        if (!$donorId) {
            $donor = User::where('role', 'donor')->first() ?: $r->user();
            $donorId = $donor->id;
        }

        $donation = Donation::create([
            'donor_id' => $donorId,
            'item_name' => $d['item_name'],
            'category' => $d['category'],
            'quantity' => $d['quantity'],
            'condition_notes' => $d['condition_notes'] ?? null,
            'storage_location' => $d['storage_location'],
            'condition_grade' => $d['condition_grade'],
            'intake_notes' => $d['intake_notes'] ?? 'Physical intake processed by staff desk.',
            'expiry_date' => $d['expiry_date'] ?? null,
            'status' => 'pending_match',
            'availability_window' => 'Immediate Campus Warehouse Stock',
            'pickup_location' => $d['storage_location'],
        ]);

        ActivityService::log($r->user(), 'processed physical item intake', $donation);
        InventoryMovement::create([
            'donation_id' => $donation->id,
            'staff_user_id' => $r->user()->id,
            'movement_type' => 'intake',
            'quantity_delta' => $donation->quantity,
            'quantity_after' => $donation->quantity,
            'reason' => 'Physical warehouse intake',
        ]);

        return new DonationResource($donation->load('donor'));
    }

    public function updateDonationStock(Request $r, Donation $donation)
    {
        $quantityBefore = $donation->quantity;
        $d = $r->validate([
            'storage_location' => 'sometimes|required|string|max:255',
            'condition_grade' => 'sometimes|required|in:new,like_new,good,fair,damaged',
            'quantity' => 'sometimes|required|integer|min:0',
            'intake_notes' => 'nullable|string',
            'expiry_date' => 'nullable|date',
            'status' => 'sometimes|required|in:pending_match,proposed,matched,fulfilled',
        ]);

        if (array_key_exists('quantity', $d)) {
            $reservedQuantity = (int) $donation->matches()
                ->whereIn('status', ['proposed', 'confirmed', 'fulfilled'])
                ->sum('matched_quantity');
            if ($d['quantity'] < $reservedQuantity) {
                throw ValidationException::withMessages([
                    'quantity' => "Stock cannot be reduced below the {$reservedQuantity} unit(s) already reserved or distributed.",
                ]);
            }
        }

        $donation->update($d);
        if (array_key_exists('quantity', $d) && $quantityBefore !== $donation->quantity) {
            InventoryMovement::create([
                'donation_id' => $donation->id,
                'staff_user_id' => $r->user()->id,
                'movement_type' => 'adjustment',
                'quantity_delta' => $donation->quantity - $quantityBefore,
                'quantity_after' => $donation->quantity,
                'reason' => $d['intake_notes'] ?? 'Staff stock adjustment',
            ]);
        }
        ActivityService::log($r->user(), 'updated inventory stock item', $donation);

        return new DonationResource($donation->load('donor'));
    }

    public function matches()
    {
        return DonationMatchResource::collection(DonationMatch::with(['donation.donor', 'request.beneficiary', 'handedOffBy'])->latest()->paginate(50));
    }

    public function run(MatchingService $s)
    {
        if (!SystemSettings::get('auto_matching')) return ['created' => 0, 'message' => 'Automated matching is disabled in system settings.'];
        return ['created' => $s->run()];
    }

    public function updateMatch(Request $r, DonationMatch $match, MatchingService $s)
    {
        $d = $r->validate([
            'status' => 'required|in:confirmed,rejected',
            'pickup_hub' => 'nullable|string|max:255',
            'handoff_scheduled_at' => 'nullable|date',
            'handoff_notes' => 'nullable|string',
        ]);

        $previousStatus = $match->status;
        $match->update($d);

        if ($d['status'] === 'confirmed' && $previousStatus !== 'confirmed') {
            AlertService::send($match->donation->donor, 'Your donation match was confirmed.', 'match', 'normal', $match, '/matches');
            AlertService::send($match->request->beneficiary, 'Your donation match was confirmed.', 'match', 'normal', $match, '/matches');
        }

        if ($d['status'] === 'rejected' && $previousStatus !== 'rejected') {
            AlertService::send($match->donation->donor, 'A donation match was cancelled by the operations team.', 'match', 'normal', $match, '/matches');
            AlertService::send($match->request->beneficiary, 'A proposed support match was cancelled. Your request remains eligible for matching.', 'match', 'normal', $match, '/matches');
        }

        $s->refreshStatuses($match);
        ActivityService::log($r->user(), $d['status'] . ' match', $match);

        return new DonationMatchResource($match->load(['donation.donor', 'request.beneficiary', 'handedOffBy']));
    }

    public function verifyHandoffPin(Request $r, DonationMatch $match, MatchingService $s)
    {
        $d = $r->validate([
            'pin' => 'required|digits:6',
            'pickup_notes' => 'nullable|string',
        ]);

        abort_if($match->status === 'fulfilled', 422, 'This handoff has already been completed.');
        abort_if($match->pin_locked_at, 422, 'PIN verification is locked after too many invalid attempts. Escalate to a supervisor.');
        abort_if($match->pin_expires_at && $match->pin_expires_at->isPast(), 422, 'This pickup PIN has expired. Reschedule the pickup before releasing the item.');
        if (trim($d['pin']) !== trim($match->verification_pin)) {
            $attempts = $match->pin_attempt_count + 1;
            $match->update(['pin_attempt_count' => $attempts, 'pin_locked_at' => $attempts >= 5 ? now() : null]);
            ActivityService::log($r->user(), 'failed handoff PIN attempt', $match, ['attempt' => $attempts]);
            if ($attempts === 1 || $attempts >= 5) {
                $message = $attempts >= 5
                    ? 'A handoff PIN has been locked after five invalid attempts and requires supervisor attention.'
                    : 'A handoff PIN verification failed. Further attempts will be monitored.';
                AlertService::sendToRoles(['staff', 'admin'], $message, 'handoff', $attempts >= 5 ? 'high' : 'normal', $match, '/staff/handoffs');
            }
            return response()->json(['message' => 'Invalid 6-digit verification PIN entered.'], 422);
        }

        $match->update([
            'status' => 'fulfilled',
            'handed_off_by_user_id' => $r->user()->id,
            'handed_off_at' => now(),
            'pin_verified_at' => now(),
            'donor_completed_at' => now(),
            'beneficiary_completed_at' => now(),
            'handoff_notes' => ($match->handoff_notes ? $match->handoff_notes . " | " : "") . "Handoff verified by staff PIN clearance." . (!empty($d['pickup_notes']) ? " Staff remarks: " . $d['pickup_notes'] : ''),
        ]);

        $remainingStock = max(0, $match->donation->quantity - DonationMatch::where('donation_id', $match->donation_id)
            ->whereIn('status', ['proposed', 'confirmed', 'fulfilled'])
            ->sum('matched_quantity'));
        InventoryMovement::create([
            'donation_id' => $match->donation_id,
            'staff_user_id' => $r->user()->id,
            'movement_type' => 'allocation',
            'quantity_delta' => -$match->matched_quantity,
            'quantity_after' => $remainingStock,
            'reason' => 'Distributed through verified recipient handoff #' . $match->id,
        ]);

        $s->refreshStatuses($match);
        AlertService::send($match->donation->donor, 'Your donation has been physically collected and handed off!', 'handoff', 'normal', $match, '/donor/fulfillment');
        AlertService::send($match->request->beneficiary, 'Your aid request item has been successfully handed off to you!', 'handoff', 'normal', $match, '/beneficiary/fulfillment');

        ActivityService::log($r->user(), 'completed handoff with PIN clearance', $match);

        return new DonationMatchResource($match->load(['donation.donor', 'request.beneficiary', 'handedOffBy']));
    }

    public function exportReportCsv()
    {
        $requests = AidRequest::with(['beneficiary', 'verifiedBy'])->get();
        $csvHeader = "ID,Beneficiary Name,Category,Quantity Needed,Urgency,Status,Verification Tier,Verified By,Created At\n";
        $csvData = "";

        foreach ($requests as $req) {
            $csvData .= sprintf(
                "%d,\"%s\",\"%s\",%d,\"%s\",\"%s\",\"%s\",\"%s\",\"%s\"\n",
                $req->id,
                addslashes($req->beneficiary->name ?? 'N/A'),
                addslashes($req->category),
                $req->quantity_needed,
                $req->urgency,
                $req->status,
                $req->verification_tier ?? 'unverified',
                addslashes($req->verifiedBy->name ?? 'N/A'),
                $req->created_at
            );
        }

        return Response::make($csvHeader . $csvData, 200, [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => 'attachment; filename="relieflink_staff_report_' . date('Y-m-d') . '.csv"',
        ]);
    }
}
