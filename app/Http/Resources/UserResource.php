<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class UserResource extends JsonResource
{
    public function toArray($r): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'email' => $this->email,
            'role' => $this->role,
            'campus_role' => $this->campus_role,
            'contact_number' => $this->contact_number,
            'campus_id' => $this->campus_id,
            'organization_name' => $this->organization_name,
            'other_role_specify' => $this->other_role_specify,
            'country' => $this->country,
            'country_code' => $this->country_code,
            'profile_photo_path' => $this->profile_photo_path,
            'profile_photo_url' => $this->profile_photo_path ? url('storage/' . $this->profile_photo_path) : null,
            'email_verified_at' => $this->email_verified_at,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
