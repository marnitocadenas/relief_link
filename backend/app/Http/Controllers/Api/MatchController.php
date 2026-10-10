<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\DonationMatchResource;
use App\Models\DonationMatch;
use App\Services\{ActivityService, AlertService, MatchingService};
use Illuminate\Http\Request;

class MatchController extends Controller
{
    public function index(Request $r)
    {
        $q = DonationMatch::with(['donation.donor', 'request.beneficiary']);
        if (!in_array($r->user()->role, ['admin', 'staff'], true)) {
            $q->where(function ($q) use ($r) {
                $q->whereHas('donation', fn ($x) => $x->where('donor_id', $r->user()->id))
                    ->orWhereHas('request', fn ($x) => $x->where('beneficiary_id', $r->user()->id));
            });
        }

        return DonationMatchResource::collection($q->latest()->paginate(30));
    }

    public function schedule(Request $r, DonationMatch $match)
    {
        $this->authorize('manageHandoff', $match);
        $d = $r->validate([
            'handoff_scheduled_at' => 'required|date|after:now',
            'handoff_notes' => 'nullable|string|max:2000',
        ]);
        if ($match->status === 'proposed') $d['status'] = 'confirmed';
        $d['verification_pin'] = str_pad((string) random_int(100000, 999999), 6, '0', STR_PAD_LEFT);
        $d['pin_expires_at'] = now()->addDays(7);
        $d['pin_attempt_count'] = 0;
        $d['pin_locked_at'] = null;
        $d['pin_verified_at'] = null;
        $match->update($d);

        $this->notifyParticipants($match, 'A handoff has been scheduled for ' . $match->handoff_scheduled_at->format('M j, Y g:i A') . '.');
        ActivityService::log($r->user(), 'scheduled handoff', $match);

        return new DonationMatchResource($match->load(['donation', 'request']));
    }

    public function complete(Request $r, DonationMatch $match, MatchingService $service)
    {
        abort(403, 'A handoff can only be completed by staff after identity and PIN verification.');
    }

    public function cancel(Request $r, DonationMatch $match, MatchingService $service)
    {
        $this->authorize('manageHandoff', $match);
        $d = $r->validate(['reason' => 'required|string|max:1000']);
        $match->update(['status' => 'rejected', 'handoff_notes' => 'Cancelled: ' . $d['reason']]);
        $service->refreshStatuses($match->fresh());
        $this->notifyParticipants($match, 'A scheduled handoff was cancelled. Reason: ' . $d['reason']);
        ActivityService::log($r->user(), 'cancelled handoff', $match, ['reason' => $d['reason']]);

        return new DonationMatchResource($match->load(['donation', 'request']));
    }

    private function notifyParticipants(DonationMatch $match, string $message): void
    {
        if ($match->donation?->donor) {
            AlertService::send($match->donation->donor, $message, 'handoff', 'normal', $match, '/donor/fulfillment');
        }
        if ($match->request?->beneficiary) {
            AlertService::send($match->request->beneficiary, $message, 'handoff', 'normal', $match, '/beneficiary/fulfillment');
        }
    }
}
