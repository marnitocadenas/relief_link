<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\StoreDonationRequest;
use App\Http\Resources\DonationResource;
use App\Models\{AidRequest, Donation, DonationMatch};
use App\Services\{ActivityService, AlertService, MatchingService};
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

class DonationController extends Controller
{
    public function index(Request $r)
    {
        $q = Donation::with(['donor', 'matches.request.beneficiary'])->filter($r->all());
        $role = $r->user()->role;
        if ($role === 'donor') {
            $q->where('donor_id', $r->user()->id);
        } elseif (!in_array($role, ['admin', 'staff', 'beneficiary'], true)) {
            abort(403);
        }
        return DonationResource::collection($q->latest()->paginate(20));
    }

    private function data(StoreDonationRequest $r): array
    {
        $d = $r->validated();
        if (($d['donation_type'] ?? 'physical') === 'financial') {
            $d['quantity'] = $d['quantity'] ?? 1;
        }
        if ($r->hasFile('image')) {
            $d['image_path'] = $r->file('image')->store('donations', 'public');
        }
        unset($d['image']);
        return $d;
    }

    public function store(StoreDonationRequest $r, MatchingService $matchingService)
    {
        $this->authorize('create', Donation::class);

        $data = $this->data($r);
        $requestId = $data['request_id'] ?? null;
        unset($data['request_id']);

        $donation = DB::transaction(function () use ($r, $data, $requestId, $matchingService) {
            $d = $r->user()->donations()->create($data);
            ActivityService::log($r->user(), 'created donation', $d);

            AlertService::send(
                $r->user(),
                'Your donation was submitted and is ready for staff intake.',
                'donation',
                'normal',
                $d,
                '/donations'
            );
            AlertService::sendToRoles(
                ['staff', 'admin'],
                'A new donation requires warehouse processing.',
                'donation',
                'normal',
                $d,
                '/staff/inventory'
            );

            // If donor is donating towards a specific request
            if ($requestId) {
                $targetRequest = AidRequest::lockForUpdate()->find($requestId);
                if ($targetRequest && in_array($targetRequest->status, ['pending_review', 'under_review', 'approved', 'proposed', 'matched', 'partially_fulfilled'], true)) {
                    $isFinancial = ($d->donation_type === 'financial' || $targetRequest->request_type === 'financial');

                    if ($isFinancial) {
                        $remAmt = $targetRequest->getRemainingAmount();
                        $matchAmt = min((float) $d->amount, $remAmt > 0 ? $remAmt : (float) $d->amount);
                        $match = DonationMatch::create([
                            'donation_id' => $d->id,
                            'request_id' => $targetRequest->id,
                            'matched_quantity' => 1,
                            'matched_amount' => $matchAmt,
                            'status' => 'proposed',
                        ]);
                    } else {
                        $remQty = $targetRequest->getRemainingQuantity();
                        $matchQty = min((int) $d->quantity, $remQty > 0 ? $remQty : (int) $d->quantity);
                        $match = DonationMatch::create([
                            'donation_id' => $d->id,
                            'request_id' => $targetRequest->id,
                            'matched_quantity' => $matchQty,
                            'status' => 'proposed',
                        ]);
                    }

                    $matchingService->refreshStatuses($match);

                    AlertService::send(
                        $targetRequest->beneficiary,
                        "A donor submitted assistance towards your request (#REQ-" . str_pad($targetRequest->id, 3, '0', STR_PAD_LEFT) . ").",
                        'match',
                        'normal',
                        $match,
                        '/matches'
                    );
                    ActivityService::log($r->user(), 'matched donation to request', $match);
                }
            }

            return $d;
        });

        return new DonationResource($donation->load(['donor', 'matches']));
    }

    public function update(StoreDonationRequest $r, Donation $donation)
    {
        abort_unless($donation->donor_id === $r->user()->id && $donation->status === 'pending_match', 403);
        $data = $this->data($r);
        unset($data['request_id']);

        if ($r->hasFile('image') && $donation->image_path) {
            Storage::disk('public')->delete($donation->image_path);
        }

        $donation->update($data);
        ActivityService::log($r->user(), 'updated donation', $donation);
        return new DonationResource($donation->load(['donor', 'matches']));
    }

    public function destroy(Request $r, Donation $donation)
    {
        if (in_array($r->user()->role, ['admin', 'staff'], true)) {
            if ($donation->image_path) {
                Storage::disk('public')->delete($donation->image_path);
            }
            ActivityService::log($r->user(), 'deleted donation', $donation);
            $donation->delete();
            return response()->noContent();
        }

        abort_unless($donation->donor_id === $r->user()->id && $donation->status === 'pending_match', 403);
        if ($donation->image_path) {
            Storage::disk('public')->delete($donation->image_path);
        }
        ActivityService::log($r->user(), 'deleted donation', $donation);
        $donation->delete();
        return response()->noContent();
    }
}
