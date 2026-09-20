<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class DonationMatchResource extends JsonResource
{
    public function toArray($r): array
    {
        return [
            'id' => $this->id,
            'matched_quantity' => (int) $this->matched_quantity,
            'matched_amount' => $this->matched_amount ? (float) $this->matched_amount : null,
            'status' => $this->status,
            'pickup_hub' => $this->pickup_hub,
            'handoff_scheduled_at' => $this->handoff_scheduled_at,
            'handoff_notes' => $this->handoff_notes,
            'pin_attempt_count' => $this->pin_attempt_count,
            'pin_locked_at' => $this->pin_locked_at,
            'pin_verified_at' => $this->pin_verified_at,
            'pin_expires_at' => $this->pin_expires_at,
            'handed_off_at' => $this->handed_off_at,
            'donor_completed_at' => $this->donor_completed_at,
            'beneficiary_completed_at' => $this->beneficiary_completed_at,
            'created_at' => $this->created_at,
            'donation' => new DonationResource($this->whenLoaded('donation')),
            'request' => new AidRequestResource($this->whenLoaded('request')),
        ];
    }
}
