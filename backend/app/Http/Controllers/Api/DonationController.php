<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\StoreDonationRequest;
use App\Http\Resources\DonationResource;
use App\Models\{AidRequest, Donation};
use App\Services\{ActivityService, AlertService};
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\ValidationException;

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

    public function store(StoreDonationRequest $r)
    {
        $this->authorize('create', Donation::class);

        $data = $this->data($r);
        $requestId = $data['request_id'] ?? null;
        unset($data['request_id']);
        // Donor submissions are pledges until campus staff receives and checks the item.
        $data['status'] = 'pending_intake';
        $data['preferred_request_id'] = $requestId;

        $donation = DB::transaction(function () use ($r, $data, $requestId) {
            if ($requestId) {
                $targetRequest = AidRequest::lockForUpdate()->find($requestId);
                $donationType = $data['donation_type'] ?? 'physical';
                if (!$targetRequest || !in_array($targetRequest->status, ['approved', 'partially_fulfilled'], true)
                    || ($targetRequest->request_type ?? 'physical') !== $donationType
                    || $targetRequest->category !== $data['category']) {
                    throw ValidationException::withMessages([
                        'request_id' => 'Choose an approved request that matches this donation type and category.',
                    ]);
                }
            }
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

            if ($requestId) {
                AlertService::send(
                    $targetRequest->beneficiary,
                    "A donor pledged support for your request (#REQ-" . str_pad($targetRequest->id, 3, '0', STR_PAD_LEFT) . "). Campus staff will verify it before matching.",
                    'donation',
                    'normal',
                    $d,
                    '/matches'
                );
            }

            return $d;
        });

        return new DonationResource($donation->load(['donor', 'matches']));
    }

    public function update(StoreDonationRequest $r, Donation $donation)
    {
        abort_unless($donation->donor_id === $r->user()->id && in_array($donation->status, ['pending_intake', 'pending_match'], true), 403);
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

        abort_unless($donation->donor_id === $r->user()->id && in_array($donation->status, ['pending_intake', 'pending_match'], true), 403);
        if ($donation->image_path) {
            Storage::disk('public')->delete($donation->image_path);
        }
        ActivityService::log($r->user(), 'deleted donation', $donation);
        $donation->delete();
        return response()->noContent();
    }
}
