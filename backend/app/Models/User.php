<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    /** @use HasFactory<UserFactory> */
    use HasApiTokens, HasFactory, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'first_name',
        'middle_name',
        'last_name',
        'email',
        'password',
        'role',
        'account_type',
        'contact_number',
        'campus_id',
        'address',
        'address_line_1',
        'state_province_region',
        'city_municipality',
        'district_local_area',
        'postal_zip_code',
        'valid_id_type',
        'valid_id_number',
        'student_id_number',
        'beneficiary_type',
        'school_email',
        'department',
        'course',
        'year_level',
        'country',
        'country_code',
        'profile_photo_path',
        'email_verified_at',
        'is_active',
        'remember_token',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'is_active' => 'boolean',
        ];
    }

    protected static function booted(): void
    {
        static::saving(function (User $user) {
            if (empty($user->role) && !empty($user->account_type)) {
                $user->role = $user->account_type;
            } elseif (!empty($user->role) && empty($user->account_type)) {
                $user->account_type = $user->role;
            }

            if (empty($user->name) && (!empty($user->first_name) || !empty($user->last_name))) {
                $user->name = trim(
                    ($user->first_name ?? '') .
                    ($user->middle_name ? ' ' . $user->middle_name : '') .
                    ($user->last_name ? ' ' . $user->last_name : '')
                );
            }

            if ($user->role === 'beneficiary') {
                if (empty($user->school_email) && !empty($user->email)) {
                    $user->school_email = $user->email;
                } elseif (empty($user->email) && !empty($user->school_email)) {
                    $user->email = $user->school_email;
                }
            }

            if ($user->role === 'donor') {
                if (empty($user->campus_id) && !empty($user->valid_id_number)) {
                    $user->campus_id = $user->valid_id_number;
                } elseif (empty($user->valid_id_number) && !empty($user->campus_id)) {
                    $user->valid_id_number = $user->campus_id;
                }
            }
        });
    }

    public function donations() { return $this->hasMany(Donation::class, 'donor_id'); }
    public function aidRequests() { return $this->hasMany(AidRequest::class, 'beneficiary_id'); }
    public function reliefNotifications() { return $this->hasMany(ReliefNotification::class); }
}
