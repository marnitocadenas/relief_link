<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class InventoryMovement extends Model
{
    protected $fillable = [
        'donation_id', 'staff_user_id', 'movement_type', 'quantity_delta',
        'quantity_after', 'reason',
    ];

    public function donation()
    {
        return $this->belongsTo(Donation::class);
    }

    public function staff()
    {
        return $this->belongsTo(User::class, 'staff_user_id');
    }
}
