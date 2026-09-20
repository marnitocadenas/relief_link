<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class AidRequestResource extends JsonResource
{
    public function toArray($r): array
    {
        $viewer = $r->user();
        $operations = $viewer && in_array($viewer->role, ['admin', 'staff'], true);
        $owner = $viewer && $viewer->id === $this->beneficiary_id;

        $matchedQty = (int) $this->matches()
            ->whereIn('status', ['proposed', 'confirmed', 'fulfilled'])
            ->sum('matched_quantity');
        $fulfilledQty = (int) $this->matches()
            ->where('status', 'fulfilled')
            ->sum('matched_quantity');
        $remainingQty = max(0, (int) $this->quantity_needed - $matchedQty);

        $matchedAmt = (float) $this->matches()
            ->whereIn('status', ['proposed', 'confirmed', 'fulfilled'])
            ->sum('matched_amount');
        $fulfilledAmt = (float) $this->matches()
            ->where('status', 'fulfilled')
            ->sum('matched_amount');
        $requestedAmt = (float) ($this->amount_requested ?? 0);
        $remainingAmt = max(0.0, round($requestedAmt - $matchedAmt, 2));

        $data = [
            'id' => $this->id,
            'request_type' => $this->request_type ?? 'physical',
            'category' => $this->category,
            'item_details' => $this->item_details,
            'quantity_needed' => (int) $this->quantity_needed,
            'unit' => $this->unit,
            'amount_requested' => $this->amount_requested ? (float) $this->amount_requested : null,
            'currency' => $this->currency ?? 'PHP',
            'purpose_of_funds' => $this->purpose_of_funds,
            'urgency' => $this->urgency,
            'justification' => $this->justification,
            'preferred_assistance_date' => $this->preferred_assistance_date,
            'additional_info' => $this->additional_info,
            'alternative_categories' => $this->alternative_categories,
            'status' => $this->status,
            'matched_quantity' => $matchedQty,
            'fulfilled_quantity' => $fulfilledQty,
            'remaining_quantity' => $remainingQty,
            'matched_amount' => $matchedAmt,
            'fulfilled_amount' => $fulfilledAmt,
            'remaining_amount' => $remainingAmt,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];

        // Owner or Operations can see full details and supporting doc
        if ($operations || $owner) {
            $data += [
                'beneficiary_id' => $this->beneficiary_id,
                'pickup_location' => $this->pickup_location,
                'availability_window' => $this->availability_window,
                'supporting_document_url' => $this->supporting_document_path ? url('/api/requests/' . $this->id . '/document') : null,
                'cancellation_reason' => $this->cancellation_reason,
                'cancelled_at' => $this->cancelled_at,
                'is_walk_in' => (bool) $this->is_walk_in,
                'walk_in_status' => $this->walk_in_status,
                'verification_tier' => $this->verification_tier,
                'verification_state' => $this->verification_state,
                'verification_decision_reason' => $this->verification_decision_reason,
                'verification_decided_at' => $this->verification_decided_at,
                'student_id_number' => $this->student_id_number,
                'verified_at' => $this->updated_at,
                'beneficiary' => new UserResource($this->whenLoaded('beneficiary')),
            ];
        } else {
            // Safe view for donors: role & student course/department if loaded, without sensitive contact
            if ($this->relationLoaded('beneficiary') && $this->beneficiary) {
                $data['beneficiary'] = [
                    'id' => $this->beneficiary->id,
                    'name' => $this->beneficiary->name,
                    'department' => $this->beneficiary->department,
                    'course' => $this->beneficiary->course,
                    'year_level' => $this->beneficiary->year_level,
                ];
            }
        }

        if ($operations) {
            $data += [
                'staff_internal_notes' => $this->staff_internal_notes,
                'referral_destination' => $this->referral_destination,
                'verification_checklist' => $this->verification_checklist,
                'verification_notes' => $this->verification_notes,
                'verified_by_user_id' => $this->verified_by_user_id,
                'verified_by' => new UserResource($this->whenLoaded('verifiedBy')),
            ];
        }

        return $data;
    }
}
