<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\RegisterRequest;
use App\Http\Resources\UserResource;
use App\Models\User;
use App\Models\PasswordOtp;
use App\Mail\OtpMail;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;
use Illuminate\Database\QueryException;
use Illuminate\Support\Arr;
use App\Services\SystemSettings;
use libphonenumber\PhoneNumberUtil;
use libphonenumber\PhoneNumberFormat;
use libphonenumber\NumberParseException;

class AuthController extends Controller
{
    public function register(RegisterRequest $r)
    {
        abort_unless(SystemSettings::get('allow_self_registration'), 403, 'Self-registration is currently disabled. Please contact an administrator.');
        try {
            $u = DB::transaction(function () use ($r) {
                return User::create([
                    ...Arr::except($r->validated(), ['password', 'password_confirmation']),
                    'password' => Hash::make($r->password),
                    'email_verified_at' => now(),
                    'remember_token' => \Illuminate\Support\Str::random(10),
                ]);
            });
        } catch (QueryException $exception) {
            // Unique indexes remain the final authority if two requests pass
            // validation at the same time.
            $message = strtolower($exception->getMessage());
            $field = str_contains($message, 'student_id_number') ? 'student_id_number'
                : (str_contains($message, 'valid_id_number') ? 'valid_id_number'
                : (str_contains($message, 'campus_id') ? 'campus_id'
                : (str_contains($message, 'contact_number') ? 'contact_number' : 'email')));
            $messages = [
                'email' => 'This email address is already taken. Please use a different email address.',
                'contact_number' => 'This Contact Number is already registered.',
                'campus_id' => 'This ID number is already taken.',
                'valid_id_number' => 'This Valid ID Number is already taken.',
                'student_id_number' => 'This Student ID Number is already registered.',
            ];
            throw ValidationException::withMessages([$field => $messages[$field] ?? 'This value is already taken.']);
        }
        return response()->json([
            'user' => new UserResource($u),
            'token' => $u->createToken('react-spa')->plainTextToken
        ], 201);
    }

    /** Return database-backed availability for one registration identity field. */
    public function checkRegistrationAvailability(Request $r)
    {
        $data = $r->validate([
            'field' => ['required', 'in:name,email,contact_number,campus_id,student_id_number,valid_id_number'],
            'value' => ['required', 'string', 'max:255'],
            'country' => ['nullable', 'string', 'max:100'],
            'country_code' => ['nullable', 'string', 'max:10'],
            'account_type' => ['nullable', 'string', 'max:50'],
        ]);

        $field = $data['field'];
        $value = $data['value'];
        $accountType = $data['account_type'] ?? '';

        if ($field === 'name') {
            $value = RegisterRequest::normalizeName($value);
            $exists = User::query()->whereRaw('LOWER(name) = ?', [strtolower($value)])->exists();
            $message = 'This name is already taken.';
        } elseif ($field === 'email') {
            $value = RegisterRequest::normalizeEmail($value);
            if (!preg_match('/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/', $value) || str_contains($value, '..')) {
                return response()->json([
                    'field' => $field,
                    'available' => false,
                    'message' => 'Please enter a valid email address.',
                ]);
            }
            $exists = User::query()->where('email', $value)->exists();
            $message = 'This email address is already taken. Please use a different email address.';
        } elseif ($field === 'campus_id') {
            $value = RegisterRequest::normalizeId($value);
            $exists = User::query()->where('campus_id', $value)->exists();
            $message = 'This ID number is already taken.';
        } elseif ($field === 'valid_id_number') {
            $value = RegisterRequest::normalizeId($value);
            $exists = User::query()->where('valid_id_number', $value)->orWhere('campus_id', $value)->exists();
            $message = 'This Valid ID Number is already taken.';
        } elseif ($field === 'student_id_number') {
            $value = RegisterRequest::normalizeId($value);
            if (!preg_match('/^\d{2}-\d{6}$/', $value)) {
                return response()->json([
                    'field' => $field,
                    'available' => false,
                    'message' => 'Please enter a valid Student ID Number in the format YY-###### (e.g., 21-010956).',
                ]);
            }
            $exists = User::query()->where('student_id_number', $value)->exists();
            $message = 'This Student ID Number is already registered.';
        } else {
            // contact_number
            if ($accountType === 'beneficiary' || preg_match('/^09[0-9]{9}$/', trim($value))) {
                $localNum = trim($value);
                $e164Num = '+63' . substr($localNum, 1);
                $exists = User::query()->where('contact_number', $localNum)->orWhere('contact_number', $e164Num)->exists();
            } else {
                $country = $data['country'] ?? '';
                $countryCode = $r->input('country_code');
                $region = RegisterRequest::resolveCountryIso($country, $countryCode);
                if ($accountType === 'donor' && $region !== 'PH') {
                    return response()->json([
                        'field' => $field,
                        'available' => false,
                        'message' => 'Donor registration is limited to the Philippines.',
                    ]);
                }
                $phoneUtil = PhoneNumberUtil::getInstance();
                try {
                    $proto = str_starts_with($value, '+')
                        ? $phoneUtil->parse($value, null)
                        : $phoneUtil->parse($value, $region);
                    if (!$phoneUtil->isValidNumber($proto)) {
                        return response()->json([
                            'field' => $field,
                            'available' => false,
                            'message' => 'Please enter a valid contact number for the selected Country / Region.',
                        ]);
                    }
                    $normalizedValue = $phoneUtil->format($proto, PhoneNumberFormat::E164);
                } catch (\Throwable) {
                    return response()->json([
                        'field' => $field,
                        'available' => false,
                        'message' => 'Please enter a valid contact number for the selected Country / Region.',
                    ]);
                }
                $exists = User::query()->where('contact_number', $normalizedValue)->orWhere('contact_number', $value)->exists();
            }
            $message = 'This contact number is already taken. Please use a different contact number.';
        }

        $successMessages = [
            'email' => 'Email address is available.',
            'student_id_number' => 'Student ID Number is available.',
            'valid_id_number' => 'Valid ID Number is available.',
            'contact_number' => 'Contact Number is available.',
        ];

        return response()->json([
            'field' => $field,
            'available' => ! $exists,
            'message' => $exists ? $message : ($successMessages[$field] ?? null),
        ]);
    }

    public function login(Request $r)
    {
        $d = $r->validate([
            'email' => 'required|email',
            'password' => 'required',
            'remember' => 'nullable|boolean',
        ]);
        $u = User::where('email', $d['email'])->first();
        abort_unless($u && $u->is_active && Hash::check($d['password'], $u->password), 422, 'Invalid credentials.');

        if (is_null($u->email_verified_at)) {
            $u->email_verified_at = now();
        }
        if ($r->boolean('remember') || is_null($u->remember_token)) {
            $u->remember_token = \Illuminate\Support\Str::random(10);
        }
        $u->save();

        return [
            'user' => new UserResource($u),
            'token' => $u->createToken('react-spa')->plainTextToken
        ];
    }

    public function sendOtp(Request $r)
    {
        $d = $r->validate([
            'email' => 'required|email|exists:users,email'
        ], [
            'email.exists' => 'No registered user account was found matching this email address.'
        ]);

        // Rate limiting check: 60 seconds cooldown
        $recent = PasswordOtp::where('email', $d['email'])
            ->where('created_at', '>=', now()->subSeconds(60))
            ->first();

        if ($recent) {
            abort(429, 'Please wait 60 seconds before requesting another OTP code.');
        }

        // Generate 6-digit OTP code
        $otpCode = (string) rand(100000, 999999);

        // Store OTP in database
        PasswordOtp::create([
            'email' => $d['email'],
            'otp' => Hash::make($otpCode),
            'expires_at' => now()->addMinutes(10),
            'attempts' => 0,
            'used' => false,
        ]);

        // Dispatch real email via Brevo SMTP / Laravel Mailer
        try {
            Mail::to($d['email'])->send(new OtpMail($otpCode));
        } catch (\Exception $e) {
            Log::error('Failed to send OTP email: ' . $e->getMessage());
        }

        return response()->json([
            'message' => 'Verification OTP has been sent to your registered email address.'
        ]);
    }

    public function verifyOtp(Request $r)
    {
        $d = $r->validate([
            'email' => 'required|email',
            'otp' => 'required|string|size:6',
        ]);

        $otpRecord = PasswordOtp::where('email', $d['email'])
            ->where('used', false)
            ->where('expires_at', '>', now())
            ->latest()
            ->first();

        if (!$otpRecord) {
            abort(422, 'Verification OTP has expired or is invalid. Please request a new code.');
        }

        if ($otpRecord->attempts >= 5) {
            abort(422, 'Maximum OTP verification attempts exceeded. Please request a new code.');
        }

        $otpRecord->increment('attempts');

        // STRICT HASH CHECK ONLY (No fallback code)
        if (!Hash::check($d['otp'], $otpRecord->otp)) {
            abort(422, 'Incorrect OTP verification code. Please check and try again.');
        }

        $otpRecord->update(['verified_at' => now()]);

        return response()->json([
            'message' => 'OTP verified successfully. You may now create your new password.'
        ]);
    }

    public function resetPassword(Request $r)
    {
        $d = $r->validate([
            'email' => 'required|email|exists:users,email',
            'otp' => 'required|string|size:6',
            'password' => [
                'required',
                'string',
                'confirmed',
                \Illuminate\Validation\Rules\Password::min(8)
                    ->max(64)
                    ->letters()
                    ->mixedCase()
                    ->numbers()
                    ->symbols(),
                function ($attribute, $value, $fail) use ($r) {
                    if (trim($value) !== $value) {
                        $fail('The password cannot start or end with spaces.');
                        return;
                    }
                    $weakPasswords = ['password', '12345678', 'qwerty', 'admin', 'welcome', '123456', 'password123', 'relieflink', 'letmein'];
                    if (in_array(strtolower($value), $weakPasswords, true)) {
                        $fail('This password is too common or easily guessable. Please choose a stronger password.');
                        return;
                    }
                    $emailParts = explode('@', strtolower($r->email ?? ''));
                    $emailUsername = $emailParts[0] ?? '';
                    if (!empty($emailUsername) && strlen($emailUsername) >= 3 && stripos($value, $emailUsername) !== false) {
                        $fail('The password cannot contain your email address.');
                        return;
                    }
                }
            ],
        ]);

        $otpRecord = PasswordOtp::where('email', $d['email'])
            ->where('used', false)
            ->whereNotNull('verified_at')
            ->latest()
            ->first();

        if (!$otpRecord) {
            abort(422, 'OTP verification record not found or expired. Please verify your OTP code first.');
        }

        $user = User::where('email', $d['email'])->firstOrFail();
        $user->update([
            'password' => Hash::make($d['password'])
        ]);

        $otpRecord->update(['used' => true]);

        // Revoke all active tokens for session invalidation on password reset
        $user->tokens()->delete();

        Log::info('Password reset completed and tokens revoked', ['user_id' => $user->id]);

        return response()->json([
            'message' => 'Your password has been reset successfully. Please log in with your new password.'
        ]);
    }

    public function user(Request $r)
    {
        return new UserResource($r->user());
    }

    public function updateProfile(Request $r)
    {
        $u = $r->user();
        $country = trim((string) $r->input('country', ''));
        $firstName = RegisterRequest::normalizeName((string) $r->input('first_name', ''));
        $middleName = RegisterRequest::normalizeName((string) $r->input('middle_name', ''));
        $lastName = RegisterRequest::normalizeName((string) $r->input('last_name', ''));
        $nameInput = RegisterRequest::normalizeName((string) $r->input('name', ''));

        if ($firstName !== '' || $lastName !== '') {
            $fullName = trim($firstName . ($middleName !== '' ? ' ' . $middleName : '') . ' ' . $lastName);
            if ($nameInput === '') $nameInput = $fullName;
        }

        $addr1 = trim((string) $r->input('address_line_1', ''));
        $district = trim((string) $r->input('district_local_area', ''));
        $city = trim((string) $r->input('city_municipality', ''));
        $state = trim((string) $r->input('state_province_region', ''));
        $postal = trim((string) $r->input('postal_zip_code', ''));
        $providedAddress = trim((string) $r->input('address', ''));

        if ($addr1 !== '') {
            $composedAddress = implode(', ', array_filter([$addr1, $district, $city, $state, $postal, $country]));
            $address = $providedAddress ?: $composedAddress;
        } else {
            $address = $providedAddress;
        }

        $validIdNum = RegisterRequest::normalizeId((string) ($r->input('valid_id_number', '') ?: $r->input('campus_id', '')));
        $contactRaw = trim((string) $r->input('contact_number', ''));
        $contactNormalized = $u->role === 'beneficiary'
            ? $contactRaw
            : RegisterRequest::normalizeContactNumber($contactRaw, $country, $r->input('country_code'));

        $normalized = [
            'name' => $nameInput ?: $u->name,
            'first_name' => $firstName ?: $u->first_name,
            'middle_name' => $middleName ?: $u->middle_name,
            'last_name' => $lastName ?: $u->last_name,
            'email' => RegisterRequest::normalizeEmail((string) $r->input('email', '')),
            'contact_number' => $contactNormalized ?: null,
            'campus_id' => ($u->role === 'beneficiary'
                ? RegisterRequest::normalizeId((string) $r->input('campus_id', ''))
                : $validIdNum) ?: null,
            'valid_id_number' => $u->role === 'beneficiary' ? null : ($validIdNum ?: null),
            'valid_id_type' => $u->role === 'beneficiary' ? null : (trim((string) $r->input('valid_id_type', '')) ?: null),
            'student_id_number' => RegisterRequest::normalizeId((string) $r->input('student_id_number', '')) ?: null,
            'beneficiary_type' => in_array($u->role, ['beneficiary'], true) ? ($r->input('beneficiary_type') ?: $u->beneficiary_type) : null,
            'school_email' => RegisterRequest::normalizeEmail((string) $r->input('school_email', '')) ?: null,
            'address' => $address ?: null,
            'address_line_1' => $addr1 ?: null,
            'state_province_region' => $state ?: null,
            'city_municipality' => $city ?: null,
            'district_local_area' => $district ?: null,
            'postal_zip_code' => $postal ?: null,
            'department' => trim((string) $r->input('department', '')) ?: null,
            'course' => trim((string) $r->input('course', '')) ?: null,
            'year_level' => trim((string) $r->input('year_level', '')) ?: null,
            'country' => $country ?: null,
            'country_code' => RegisterRequest::resolveCountryIso($country, $r->input('country_code')),
        ];
        if ($r->has('country_code') && !empty($r->input('country_code'))) {
            $normalized['country_code'] = strtoupper(trim((string) $r->input('country_code')));
        }
        $r->merge($normalized);

        $rules = [
            'name' => 'required|string|max:255',
            'first_name' => 'nullable|string|max:100',
            'middle_name' => 'nullable|string|max:100',
            'last_name' => 'nullable|string|max:100',
            'email' => 'required|email|unique:users,email,' . $u->id,
            'password' => 'nullable|min:8|confirmed',
            'profile_photo' => 'nullable|image|max:2048',
            'remove_photo' => 'nullable|boolean',
            'campus_id' => ['nullable', 'string', 'max:50', 'unique:users,campus_id,' . $u->id],
            'valid_id_number' => ['nullable', 'string', 'max:50', 'unique:users,valid_id_number,' . $u->id],
            'valid_id_type' => ['nullable', 'string', 'max:100'],
            'address' => 'nullable|string|max:255',
            'address_line_1' => 'nullable|string|max:255',
            'state_province_region' => 'nullable|string|max:255',
            'city_municipality' => 'nullable|string|max:255',
            'district_local_area' => 'nullable|string|max:255',
            'postal_zip_code' => 'nullable|string|max:50',
            'student_id_number' => ['nullable', 'string', 'max:9', 'unique:users,student_id_number,' . $u->id],
            'beneficiary_type' => ['nullable', 'in:student,faculty,staff'],
            'school_email' => 'nullable|email|max:255',
            'country' => [
                $u->role === 'donor' ? 'required' : 'nullable',
                'string',
                'max:100',
                function ($attribute, $value, $fail) use ($u) {
                    if ($u->role === 'donor' && !in_array(strtolower(trim((string) $value)), ['philippines', 'ph'], true)) {
                        $fail('Donor profiles are limited to the Philippines.');
                    }
                },
            ],
            'country_code' => [
                'nullable',
                'string',
                'max:10',
                function ($attribute, $value, $fail) use ($u) {
                    if ($u->role === 'donor' && !empty($value) && strtoupper(trim((string) $value)) !== 'PH') {
                        $fail('Donor profiles are limited to the Philippines.');
                    }
                },
            ],
        ];

        if ($u->role === 'beneficiary') {
            $rules['contact_number'] = [
                'nullable', 'string', 'max:30', 'unique:users,contact_number,' . $u->id,
                'regex:/^09[0-9]{9}$/',
            ];
            $rules['department'] = ['nullable', 'string', 'max:255', \Illuminate\Validation\Rule::in(RegisterRequest::DEPARTMENTS)];
            $rules['course'] = ['nullable', 'string', 'max:255', \Illuminate\Validation\Rule::in(RegisterRequest::COURSES)];
            $rules['year_level'] = ['nullable', 'string', 'max:50', \Illuminate\Validation\Rule::in(RegisterRequest::YEAR_LEVELS)];
        } elseif ($u->role === 'donor') {
            $rules['contact_number'] = [
                'nullable', 'string', 'max:30', 'unique:users,contact_number,' . $u->id,
                'regex:/^(09[0-9]{9}|\\+639[0-9]{9})$/',
            ];
            $rules['department'] = ['nullable', 'string', 'max:255'];
            $rules['course'] = ['nullable', 'string', 'max:255'];
            $rules['year_level'] = ['nullable', 'string', 'max:50'];
        } else {
            $rules['contact_number'] = [
                'nullable', 'string', 'max:30', 'unique:users,contact_number,' . $u->id,
                function ($attribute, $value, $fail) use ($r, $country) {
                    if ($value === null || $value === '') return;
                    $region = RegisterRequest::resolveCountryIso($country, $r->input('country_code'));
                    try {
                        $phone = str_starts_with($value, '+')
                            ? PhoneNumberUtil::getInstance()->parse($value, null)
                            : PhoneNumberUtil::getInstance()->parse($value, $region);
                        if (!PhoneNumberUtil::getInstance()->isValidNumber($phone)) {
                            $fail('Please enter a valid contact number for the selected Country / Region.');
                        }
                    } catch (NumberParseException) {
                        $fail('Please enter a valid contact number for the selected Country / Region.');
                    }
                },
            ];
            $rules['department'] = ['nullable', 'string', 'max:255'];
            $rules['course'] = ['nullable', 'string', 'max:255'];
            $rules['year_level'] = ['nullable', 'string', 'max:50'];
        }

        $data = $r->validate($rules);

        if ($r->hasFile('profile_photo')) {
            $data['profile_photo_path'] = $r->file('profile_photo')->store('profiles', 'public');
        } elseif ($r->boolean('remove_photo')) {
            $data['profile_photo_path'] = null;
        }

        if (empty($data['password'])) {
            unset($data['password']);
        } else {
            $data['password'] = Hash::make($data['password']);
        }

        unset($data['profile_photo'], $data['remove_photo']);
        $u->update($data);
        if (isset($data['password'])) $u->tokens()->where('id', '!=', $u->currentAccessToken()?->id)->delete();
        return new UserResource($u->fresh());
    }

    public function logout(Request $r)
    {
        $r->user()->currentAccessToken()?->delete();
        return response()->noContent();
    }
}
