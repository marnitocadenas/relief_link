<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AidRequest extends Model
{
    use HasFactory;

    protected $table = 'requests';

    protected $fillable = [
        'beneficiary_id',
        'request_type',
        'category',
        'quantity_needed',
        'unit',
        'amount_requested',
        'currency',
        'purpose_of_funds',
        'urgency',
        'justification',
        'preferred_assistance_date',
        'item_details',
        'additional_info',
        'alternative_categories',
        'pickup_location',
        'availability_window',
        'supporting_document_path',
        'cancellation_reason',
        'cancelled_at',
        'status',
        'is_walk_in',
        'walk_in_status',
        'created_by_staff_id',
        'verified_by_user_id',
        'verification_tier',
        'verification_state',
        'verification_checklist',
        'verification_notes',
        'staff_internal_notes',
        'referral_destination',
        'verification_decision_reason',
        'verification_decided_at',
        'student_id_number',
    ];

    protected $casts = [
        'cancelled_at' => 'datetime',
        'verification_decided_at' => 'datetime',
        'verification_checklist' => 'array',
        'is_walk_in' => 'boolean',
        'amount_requested' => 'decimal:2',
        'quantity_needed' => 'integer',
    ];

    public function beneficiary()
    {
        return $this->belongsTo(User::class, 'beneficiary_id');
    }

    public function verifiedBy()
    {
        return $this->belongsTo(User::class, 'verified_by_user_id');
    }

    public function matches()
    {
        return $this->hasMany(DonationMatch::class, 'request_id');
    }

    public function getActiveMatchedQuantity(): int
    {
        return (int) $this->matches()
            ->whereIn('status', ['proposed', 'confirmed', 'fulfilled'])
            ->sum('matched_quantity');
    }

    public function getFulfilledQuantity(): int
    {
        return (int) $this->matches()
            ->where('status', 'fulfilled')
            ->sum('matched_quantity');
    }

    public function getRemainingQuantity(): int
    {
        return max(0, (int) $this->quantity_needed - $this->getActiveMatchedQuantity());
    }

    public function getActiveMatchedAmount(): float
    {
        return (float) $this->matches()
            ->whereIn('status', ['proposed', 'confirmed', 'fulfilled'])
            ->sum('matched_amount');
    }

    public function getFulfilledAmount(): float
    {
        return (float) $this->matches()
            ->where('status', 'fulfilled')
            ->sum('matched_amount');
    }

    public function getRemainingAmount(): float
    {
        $requested = (float) ($this->amount_requested ?? 0);
        return max(0.0, round($requested - $this->getActiveMatchedAmount(), 2));
    }

    public function scopeFilter($q, $f)
    {
        return $q->when($f['category'] ?? null, fn($q, $v) => $q->where('category', $v))
            ->when($f['status'] ?? null, fn($q, $v) => $q->where('status', $v))
            ->when($f['request_type'] ?? null, fn($q, $v) => $q->where('request_type', $v))
            ->when($f['urgency'] ?? null, fn($q, $v) => $q->where('urgency', $v))
            ->when($f['q'] ?? null, function ($q, $v) {
                $q->where(function ($sub) use ($v) {
                    $sub->where('justification', 'like', "%$v%")
                        ->orWhere('item_details', 'like', "%$v%")
                        ->orWhere('category', 'like', "%$v%")
                        ->orWhere('purpose_of_funds', 'like', "%$v%");
                });
            });
    }
}
