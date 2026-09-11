<?php

namespace App\Policies;

use App\Models\AidRequest;
use App\Models\User;
use Illuminate\Auth\Access\Response;

class AidRequestPolicy
{
    public function create(User $user): bool { return $user->role === 'beneficiary'; }
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
    public function view(User $user, AidRequest $aidRequest): bool
    {
        return false;
    }

    /**
     * Determine whether the user can create models.
     */

    /**
     * Determine whether the user can update the model.
     */
    public function update(User $user, AidRequest $aidRequest): bool
    {
        return false;
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(User $user, AidRequest $aidRequest): bool
    {
        return false;
    }

    /**
     * Determine whether the user can restore the model.
     */
    public function restore(User $user, AidRequest $aidRequest): bool
    {
        return false;
    }

    /**
     * Determine whether the user can permanently delete the model.
     */
    public function forceDelete(User $user, AidRequest $aidRequest): bool
    {
        return false;
    }
}
