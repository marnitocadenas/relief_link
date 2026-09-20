<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Donation extends Model
{
    use HasFactory;

    protected $fillable = [
        'donor_id',
        'donation_type',
        'item_name',
        'category',
        'quantity',
        'amount',
        'currency',
        'condition_notes',
        'availability_window',
        'pickup_location',
        'preferred_handoff_slots',
        'image_path',
        'status',
        'storage_location',
        'condition_grade',
        'intake_notes',
        'expiry_date',
    ];

    protected $casts = [
        'expiry_date' => 'date',
        'amount' => 'decimal:2',
        'quantity' => 'integer',
    ];

    public function donor()
    {
        return $this->belongsTo(User::class, 'donor_id');
    }

    public function matches()
    {
        return $this->hasMany(DonationMatch::class);
    }

    public function getActiveMatchedQuantity(): int
    {
        return (int) $this->matches()
            ->whereIn('status', ['proposed', 'confirmed', 'fulfilled'])
            ->sum('matched_quantity');
    }

    public function getRemainingQuantity(): int
    {
        return max(0, (int) $this->quantity - $this->getActiveMatchedQuantity());
    }

    public function getActiveMatchedAmount(): float
    {
        return (float) $this->matches()
            ->whereIn('status', ['proposed', 'confirmed', 'fulfilled'])
            ->sum('matched_amount');
    }

    public function getRemainingAmount(): float
    {
        $total = (float) ($this->amount ?? 0);
        return max(0.0, round($total - $this->getActiveMatchedAmount(), 2));
    }

    public function scopeFilter($q, $f)
    {
        return $q->when($f['category'] ?? null, fn($q, $v) => $q->where('category', $v))
            ->when($f['status'] ?? null, fn($q, $v) => $q->where('status', $v))
            ->when($f['donation_type'] ?? null, fn($q, $v) => $q->where('donation_type', $v))
            ->when($f['q'] ?? null, fn($q, $v) => $q->where(function ($sub) use ($v) {
                $sub->where('item_name', 'like', "%$v%")
                    ->orWhere('category', 'like', "%$v%")
                    ->orWhere('condition_notes', 'like', "%$v%");
            }));
    }
}
