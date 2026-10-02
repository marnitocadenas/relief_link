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
            'first_name' => $this->first_name,
            'middle_name' => $this->middle_name,
            'last_name' => $this->last_name,
            'email' => $this->email,
            'role' => $this->role,
            'is_active' => (bool) $this->is_active,
            'account_type' => $this->account_type ?: $this->role,
            'contact_number' => $this->contact_number,
            'campus_id' => $this->campus_id,
            'address' => $this->address,
            'address_line_1' => $this->address_line_1,
            'state_province_region' => $this->state_province_region,
            'city_municipality' => $this->city_municipality,
            'district_local_area' => $this->district_local_area,
            'postal_zip_code' => $this->postal_zip_code,
            'valid_id_type' => $this->valid_id_type,
            'valid_id_number' => $this->valid_id_number,
            'student_id_number' => $this->student_id_number,
            'school_email' => $this->school_email,
            'department' => $this->department,
            'course' => $this->course,
            'year_level' => $this->year_level,
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
