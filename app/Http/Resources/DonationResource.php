<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class DonationResource extends JsonResource
{
    public function toArray($r): array
    {
        $viewer = $r->user();
        $operations = $viewer && in_array($viewer->role, ['admin', 'staff'], true);
        $owner = $viewer && $viewer->id === $this->donor_id;

        $reservedQty = (int) ($this->relationLoaded('matches')
            ? $this->matches->whereIn('status', ['proposed', 'confirmed', 'fulfilled'])->sum('matched_quantity')
            : $this->matches()->whereIn('status', ['proposed', 'confirmed', 'fulfilled'])->sum('matched_quantity'));

        $reservedAmt = (float) ($this->relationLoaded('matches')
            ? $this->matches->whereIn('status', ['proposed', 'confirmed', 'fulfilled'])->sum('matched_amount')
            : $this->matches()->whereIn('status', ['proposed', 'confirmed', 'fulfilled'])->sum('matched_amount'));

        $data = [
            'id' => $this->id,
            'donation_type' => $this->donation_type ?? 'physical',
            'item_name' => $this->item_name,
            'category' => $this->category,
            'quantity' => (int) $this->quantity,
            'reserved_quantity' => $reservedQty,
            'available_quantity' => max(0, (int) $this->quantity - $reservedQty),
            'amount' => $this->amount ? (float) $this->amount : null,
            'currency' => $this->currency ?? 'PHP',
            'reserved_amount' => $reservedAmt,
            'available_amount' => max(0.0, round((float) ($this->amount ?? 0) - $reservedAmt, 2)),
            'condition_notes' => $this->condition_notes,
            'availability_window' => $this->availability_window,
            'pickup_location' => $this->pickup_location,
            'preferred_handoff_slots' => $this->preferred_handoff_slots,
            'image_url' => $this->image_path ? url('storage/' . $this->image_path) : null,
            'status' => $this->status,
            'created_at' => $this->created_at,
        ];

        if ($operations || $owner) {
            $data['donor'] = new UserResource($this->whenLoaded('donor'));
        }

        if ($operations) {
            $data += [
                'storage_location' => $this->storage_location,
                'condition_grade' => $this->condition_grade,
                'intake_notes' => $this->intake_notes,
                'expiry_date' => $this->expiry_date,
            ];
        }

        return $data;
    }
}
