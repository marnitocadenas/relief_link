<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Facades\Storage;

class DonationResource extends JsonResource
{
    public function toArray($r): array
    {
        $viewer = $r->user();
        $operations = $viewer && in_array($viewer->role, ['admin', 'staff'], true);
        $owner = $viewer && $viewer->id === $this->donor_id;

        $reservedQty = (int) ($this->relationLoaded('matches')
            ? $this->matches->whereIn('status', ['proposed', 'confirmed'])->sum('matched_quantity')
            : $this->matches()->whereIn('status', ['proposed', 'confirmed'])->sum('matched_quantity'));
        $fulfilledQty = (int) ($this->relationLoaded('matches')
            ? $this->matches->where('status', 'fulfilled')->sum('matched_quantity')
            : $this->matches()->where('status', 'fulfilled')->sum('matched_quantity'));

        $reservedAmt = (float) ($this->relationLoaded('matches')
            ? $this->matches->whereIn('status', ['proposed', 'confirmed'])->sum('matched_amount')
            : $this->matches()->whereIn('status', ['proposed', 'confirmed'])->sum('matched_amount'));
        $fulfilledAmt = (float) ($this->relationLoaded('matches')
            ? $this->matches->where('status', 'fulfilled')->sum('matched_amount')
            : $this->matches()->where('status', 'fulfilled')->sum('matched_amount'));

        $data = [
            'id' => $this->id,
            'donation_type' => $this->donation_type ?? 'physical',
            'item_name' => $this->item_name,
            'category' => $this->category,
            'quantity' => (int) $this->quantity,
            'reserved_quantity' => $reservedQty,
            'fulfilled_quantity' => $fulfilledQty,
            'on_hand_quantity' => max(0, (int) $this->quantity - $fulfilledQty),
            'available_quantity' => $this->status === 'pending_intake' ? 0 : max(0, (int) $this->quantity - $reservedQty - $fulfilledQty),
            'amount' => $this->amount ? (float) $this->amount : null,
            'currency' => $this->currency ?? 'PHP',
            'reserved_amount' => $reservedAmt,
            'fulfilled_amount' => $fulfilledAmt,
            'available_amount' => $this->status === 'pending_intake' ? 0.0 : max(0.0, round((float) ($this->amount ?? 0) - $reservedAmt - $fulfilledAmt, 2)),
            'condition_notes' => $this->condition_notes,
            'availability_window' => $this->availability_window,
            'pickup_location' => $this->pickup_location,
            'preferred_handoff_slots' => $this->preferred_handoff_slots,
            // Generate the URL from the same disk used by the upload handler. This
            // keeps image URLs aligned with the configured public storage disk.
            'image_url' => $this->image_path ? Storage::disk('public')->url(ltrim(str_replace('storage/', '', $this->image_path), '/')) : null,
            'status' => $this->status,
            'created_at' => $this->created_at,
        ];

        if ($operations || $owner) {
            $data['donor'] = new UserResource($this->whenLoaded('donor'));
        }

        if ($operations) {
            $data += [
                'external_donor_name' => $this->external_donor_name,
                'preferred_request_id' => $this->preferred_request_id,
                'storage_location' => $this->storage_location,
                'condition_grade' => $this->condition_grade,
                'intake_notes' => $this->intake_notes,
                'expiry_date' => $this->expiry_date,
            ];
        }

        return $data;
    }
}
