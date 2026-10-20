<?php

namespace App\Policies;

use App\Models\DonationMatch;
use App\Models\User;
use Illuminate\Auth\Access\Response;

class DonationMatchPolicy
{
    public function scheduleHandoff(User $user, DonationMatch $match): bool
    {
        return in_array($user->role, ['admin', 'staff'], true)
            && $match->status === 'confirmed';
    }

    public function manageHandoff(User $user, DonationMatch $match): bool
    {
        if (!in_array($match->status, ['proposed', 'confirmed'], true)) {
            return false;
        }

        return in_array($user->role, ['admin', 'staff'], true)
            || in_array($user->id, [$match->donation->donor_id, $match->request->beneficiary_id], true);
    }
    /**
     * Determine whether the user can view any models.
     */
    public function viewAny(User $user): bool
    {
        return false;
    }

    /**
     * Determine whether the user can view the model.
     */
    public function view(User $user, DonationMatch $donationMatch): bool
    {
        return false;
    }

    /**
     * Determine whether the user can create models.
     */
    public function create(User $user): bool
    {
        return false;
    }

    /**
     * Determine whether the user can update the model.
     */
    public function update(User $user, DonationMatch $donationMatch): bool
    {
        return false;
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(User $user, DonationMatch $donationMatch): bool
    {
        return false;
    }

    /**
     * Determine whether the user can restore the model.
     */
    public function restore(User $user, DonationMatch $donationMatch): bool
    {
        return false;
    }

    /**
     * Determine whether the user can permanently delete the model.
     */
    public function forceDelete(User $user, DonationMatch $donationMatch): bool
    {
        return false;
    }
}
