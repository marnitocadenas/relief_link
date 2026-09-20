<?php

namespace App\Services;

use App\Models\{AidRequest, Donation, DonationMatch};
use Illuminate\Support\Facades\DB;

class MatchingService
{
    public function run(): int
    {
        return DB::transaction(function () {
            $created = 0;

            // 1. Physical Donations Matching
            Donation::where('status', 'pending_match')
                ->where(function ($q) {
                    $q->whereNull('donation_type')->orWhere('donation_type', 'physical');
                })
                ->lockForUpdate()
                ->get()
                ->each(function ($donation) use (&$created) {
                    $available = $donation->quantity - $this->activeQuantity($donation->matches());
                    if ($available < 1) return;

                    $made = false;
                    $requests = AidRequest::where('category', $donation->category)
                        ->where(function ($q) {
                            $q->whereNull('request_type')->orWhere('request_type', 'physical');
                        })
                        ->whereIn('status', ['approved', 'partially_fulfilled'])
                        ->orderByRaw("CASE urgency WHEN 'high' THEN 1 WHEN 'medium' THEN 2 ELSE 3 END")
                        ->oldest()
                        ->lockForUpdate()
                        ->get();

                    foreach ($requests as $request) {
                        if ($available < 1) break;
                        $remaining = $request->quantity_needed - $this->activeQuantity($request->matches());
                        if ($remaining < 1) continue;

                        $qty = min($available, $remaining);
                        $match = DonationMatch::create([
                            'donation_id' => $donation->id,
                            'request_id' => $request->id,
                            'matched_quantity' => $qty,
                            'status' => 'proposed',
                        ]);

                        AlertService::send(
                            $request->beneficiary,
                            "A {$qty}-unit {$donation->category} donation has been proposed for your request.",
                            'match',
                            'normal',
                            $match,
                            '/matches'
                        );
                        AlertService::send(
                            $donation->donor,
                            "Your {$qty}-unit donation has been proposed for a verified request.",
                            'match',
                            'normal',
                            $match,
                            '/matches'
                        );

                        $available -= $qty;
                        $created++;
                        $made = true;
                        $this->refreshStatuses($match);
                    }

                    if (!$made) {
                        $this->refreshDonation($donation);
                    }
                });

            // 2. Financial Donations Matching
            Donation::where('status', 'pending_match')
                ->where('donation_type', 'financial')
                ->lockForUpdate()
                ->get()
                ->each(function ($donation) use (&$created) {
                    $availableAmt = (float) $donation->amount - $this->activeAmount($donation->matches());
                    if ($availableAmt <= 0) return;

                    $made = false;
                    $requests = AidRequest::where('request_type', 'financial')
                        ->where('category', $donation->category)
                        ->whereIn('status', ['approved', 'partially_fulfilled'])
                        ->orderByRaw("CASE urgency WHEN 'high' THEN 1 WHEN 'medium' THEN 2 ELSE 3 END")
                        ->oldest()
                        ->lockForUpdate()
                        ->get();

                    foreach ($requests as $request) {
                        if ($availableAmt <= 0) break;
                        $remainingAmt = (float) $request->amount_requested - $this->activeAmount($request->matches());
                        if ($remainingAmt <= 0) continue;

                        $amt = min($availableAmt, $remainingAmt);
                        $match = DonationMatch::create([
                            'donation_id' => $donation->id,
                            'request_id' => $request->id,
                            'matched_quantity' => 1,
                            'matched_amount' => $amt,
                            'status' => 'proposed',
                        ]);

                        AlertService::send(
                            $request->beneficiary,
                            "A {$request->currency} " . number_format($amt, 2) . " financial donation has been proposed for your request.",
                            'match',
                            'normal',
                            $match,
                            '/matches'
                        );
                        AlertService::send(
                            $donation->donor,
                            "Your {$donation->currency} " . number_format($amt, 2) . " donation has been proposed for a verified request.",
                            'match',
                            'normal',
                            $match,
                            '/matches'
                        );

                        $availableAmt -= $amt;
                        $created++;
                        $made = true;
                        $this->refreshStatuses($match);
                    }

                    if (!$made) {
                        $this->refreshDonation($donation);
                    }
                });

            return $created;
        });
    }

    public function refreshStatuses(DonationMatch $m): void
    {
        if ($m->donation) {
            $this->refreshDonation($m->donation);
        }
        if ($m->request) {
            $this->refreshRequest($m->request);
        }
    }

    private function activeQuantity($relation): int
    {
        return (int) $relation->whereIn('status', ['proposed', 'confirmed', 'fulfilled'])->sum('matched_quantity');
    }

    private function activeAmount($relation): float
    {
        return (float) $relation->whereIn('status', ['proposed', 'confirmed', 'fulfilled'])->sum('matched_amount');
    }

    public function refreshDonation(Donation $d): void
    {
        if ($d->donation_type === 'financial') {
            $matches = $d->matches()->whereIn('status', ['proposed', 'confirmed', 'fulfilled'])->get();
            $sum = (float) $matches->sum('matched_amount');
            $total = (float) ($d->amount ?? 0);
            $s = $sum < $total
                ? 'pending_match'
                : ($matches->every(fn($x) => $x->status === 'fulfilled')
                    ? 'fulfilled'
                    : ($matches->contains(fn($x) => in_array($x->status, ['confirmed', 'fulfilled'], true)) ? 'matched' : 'proposed'));
            $d->update(['status' => $s]);
        } else {
            $matches = $d->matches()->whereIn('status', ['proposed', 'confirmed', 'fulfilled'])->get();
            $sum = (int) $matches->sum('matched_quantity');
            $s = $sum < (int) $d->quantity
                ? 'pending_match'
                : ($matches->every(fn($x) => $x->status === 'fulfilled')
                    ? 'fulfilled'
                    : ($matches->contains(fn($x) => in_array($x->status, ['confirmed', 'fulfilled'], true)) ? 'matched' : 'proposed'));
            $d->update(['status' => $s]);
        }
    }

    public function refreshRequest(AidRequest $r): void
    {
        if ($r->request_type === 'financial') {
            $matches = $r->matches()->whereIn('status', ['proposed', 'confirmed', 'fulfilled'])->get();
            $fulfilledSum = (float) $r->matches()->where('status', 'fulfilled')->sum('matched_amount');
            $activeSum = (float) $matches->sum('matched_amount');
            $reqAmt = (float) ($r->amount_requested ?? 0);

            if ($fulfilledSum >= $reqAmt && $reqAmt > 0) {
                $status = 'fulfilled';
            } elseif ($activeSum >= $reqAmt && $reqAmt > 0) {
                $status = $matches->every(fn($x) => $x->status === 'fulfilled')
                    ? 'fulfilled'
                    : ($matches->contains(fn($x) => in_array($x->status, ['confirmed', 'fulfilled'], true)) ? 'matched' : 'proposed');
            } elseif ($activeSum > 0 || $fulfilledSum > 0) {
                $status = 'partially_fulfilled';
            } else {
                $status = in_array($r->status, ['rejected', 'cancelled'], true)
                    ? $r->status
                    : ($r->verification_state === 'rejected' ? 'rejected' : ($r->verification_state === 'approved' || $r->status === 'approved' || $r->status === 'proposed' || $r->status === 'matched' ? 'approved' : 'pending_review'));
            }
            $r->update(['status' => $status]);
        } else {
            $matches = $r->matches()->whereIn('status', ['proposed', 'confirmed', 'fulfilled'])->get();
            $fulfilledSum = (int) $r->matches()->where('status', 'fulfilled')->sum('matched_quantity');
            $activeSum = (int) $matches->sum('matched_quantity');
            $reqQty = (int) $r->quantity_needed;

            if ($fulfilledSum >= $reqQty && $reqQty > 0) {
                $status = 'fulfilled';
            } elseif ($activeSum >= $reqQty && $reqQty > 0) {
                $status = $matches->every(fn($x) => $x->status === 'fulfilled')
                    ? 'fulfilled'
                    : ($matches->contains(fn($x) => in_array($x->status, ['confirmed', 'fulfilled'], true)) ? 'matched' : 'proposed');
            } elseif ($activeSum > 0 || $fulfilledSum > 0) {
                $status = 'partially_fulfilled';
            } else {
                $status = in_array($r->status, ['rejected', 'cancelled'], true)
                    ? $r->status
                    : ($r->verification_state === 'rejected' ? 'rejected' : ($r->verification_state === 'approved' || $r->status === 'approved' || $r->status === 'proposed' || $r->status === 'matched' ? 'approved' : 'pending_review'));
            }
            $r->update(['status' => $status]);
        }
    }
}
