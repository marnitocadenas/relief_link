<?php

namespace App\Http\Requests\Api;

use App\Models\User;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Password;
use libphonenumber\PhoneNumberUtil;
use libphonenumber\PhoneNumberFormat;
use libphonenumber\NumberParseException;

class RegisterRequest extends FormRequest
{
    private static array $countryToIso = [
        'philippines' => 'PH',
        'ph' => 'PH',
        'united states' => 'US',
        'us' => 'US',
        'usa' => 'US',
        'canada' => 'CA',
        'ca' => 'CA',
        'united kingdom' => 'GB',
        'uk' => 'GB',
        'gb' => 'GB',
        'australia' => 'AU',
        'au' => 'AU',
        'japan' => 'JP',
        'jp' => 'JP',
        'south korea' => 'KR',
        'kr' => 'KR',
        'singapore' => 'SG',
        'sg' => 'SG',
        'united arab emirates' => 'AE',
        'uae' => 'AE',
        'ae' => 'AE',
        'saudi arabia' => 'SA',
        'sa' => 'SA',
        'germany' => 'DE',
        'de' => 'DE',
        'france' => 'FR',
        'fr' => 'FR',
        'italy' => 'IT',
        'it' => 'IT',
        'spain' => 'ES',
        'es' => 'ES',
        'india' => 'IN',
        'in' => 'IN',
        'china' => 'CN',
        'cn' => 'CN',
        'new zealand' => 'NZ',
        'nz' => 'NZ',
        'qatar' => 'QA',
        'qa' => 'QA',
        'kuwait' => 'KW',
        'kw' => 'KW',
        'malaysia' => 'MY',
        'my' => 'MY',
        'indonesia' => 'ID',
        'id' => 'ID',
        'thailand' => 'TH',
        'th' => 'TH',
        'vietnam' => 'VN',
        'vn' => 'VN',
        'hong kong' => 'HK',
        'hk' => 'HK',
        'taiwan' => 'TW',
        'tw' => 'TW',
        'brazil' => 'BR',
        'br' => 'BR',
        'mexico' => 'MX',
        'mx' => 'MX',
    ];

    public function authorize(): bool
    {
        return true;
    }

    protected function prepareForValidation(): void
    {
        $countryInput = trim((string) $this->input('country', ''));
        $contactRaw = self::normalizeContactNumber((string) $this->input('contact_number', ''), $countryInput);

        $this->merge([
            'name' => self::normalizeName((string) $this->input('name', '')),
            // Store one canonical form so an address cannot be registered again
            // merely by changing its letter case.
            'email' => self::normalizeEmail((string) $this->input('email', '')),
            'role' => trim((string) $this->input('role', '')),
            'campus_role' => trim((string) $this->input('campus_role', '')),
            'contact_number' => $contactRaw,
            'campus_id' => self::normalizeId((string) $this->input('campus_id', '')),
            'organization_name' => trim((string) $this->input('organization_name', '')),
            'other_role_specify' => trim((string) $this->input('other_role_specify', '')),
            'country' => $countryInput,
        ]);
    }

    public static function normalizeName(string $value): string
    {
        return preg_replace('/\s+/', ' ', trim($value)) ?? '';
    }

    public static function normalizeEmail(string $value): string
    {
        return strtolower(trim($value));
    }

    public static function normalizeId(string $value): string
    {
        return strtoupper(trim($value));
    }

    public static function normalizeContactNumber(string $value, string $country = ''): string
    {
        $value = trim($value);
        if ($value === '') return '';

        $region = self::$countryToIso[strtolower(trim($country))] ?? 'PH';
        try {
            $phoneUtil = PhoneNumberUtil::getInstance();
            $number = str_starts_with($value, '+')
                ? $phoneUtil->parse($value, null)
                : $phoneUtil->parse($value, $region);
            if ($phoneUtil->isValidNumber($number)) {
                return $phoneUtil->format($number, PhoneNumberFormat::E164);
            }
        } catch (\Throwable) {
            // The normal validation rule will return the user-facing error.
        }

        return $value;
    }

    public function rules(): array
    {
        $isInternational = $this->campus_role === 'other' && (
            stripos((string) $this->other_role_specify, 'international') !== false
        );

        return [
            'name' => [
                'required', 'string', 'max:255',
                function ($attribute, $value, $fail) {
                    if (User::query()->whereRaw('LOWER(name) = ?', [strtolower($value)])->exists()) {
                        $fail('This name is already taken.');
                    }
                },
            ],
            'email' => ['required', 'email', 'max:255', 'unique:users,email', 'regex:/^[^\s@]+@[^\s@]+\.[^\s@]+$/'],
            'role' => ['required', Rule::in(['donor', 'beneficiary', 'staff'])],
            'campus_role' => [
                'required',
                'string',
                'max:50',
                function ($attribute, $value, $fail) {
                    $normalized = strtolower($value);
                    if ($this->role === 'donor') {
                        $allowed = ['student', 'faculty', 'staff', 'other', 'alumni', 'campus_organization'];
                        if (!in_array($normalized, $allowed, true)) {
                            $fail('Invalid donor type selected.');
                        }
                    } elseif ($this->role === 'beneficiary') {
                        $allowed = ['student', 'faculty', 'staff'];
                        if (!in_array($normalized, $allowed, true)) {
                            $fail('Invalid beneficiary type selected.');
                        }
                    }
                },
            ],
            'campus_id' => [
                Rule::requiredIf(fn () => in_array($this->role, ['donor', 'beneficiary'], true)),
                'string',
                'max:50',
                'unique:users,campus_id',
            ],
            'other_role_specify' => [
                'required_if:campus_role,other',
                'nullable',
                'string',
                'max:100',
            ],
            'country' => [
                Rule::requiredIf($isInternational),
                'nullable',
                'string',
                'max:100',
            ],
            'organization_name' => [
                'required_if:campus_role,campus_organization',
                'nullable',
                'string',
                'max:255',
            ],
            'contact_number' => [
                'required',
                'string',
                'max:30',
                'unique:users,contact_number',
                function ($attribute, $value, $fail) {
                    $phoneUtil = PhoneNumberUtil::getInstance();
                    $countryInput = trim((string) $this->input('country', ''));
                    $region = self::$countryToIso[strtolower($countryInput)] ?? 'PH';

                    try {
                        $numberProto = str_starts_with($value, '+')
                            ? $phoneUtil->parse($value, null)
                            : $phoneUtil->parse($value, $region);

                        if (!$phoneUtil->isValidNumber($numberProto)) {
                            $fail('Please enter a valid mobile number for the selected country.');
                            return;
                        }
                    } catch (NumberParseException) {
                        $fail('Please enter a valid mobile number for the selected country.');
                    }
                },
            ],
            'password' => [
                'required',
                'string',
                'confirmed',
                Password::min(8)
                    ->max(64)
                    ->letters()
                    ->mixedCase()
                    ->numbers()
                    ->symbols(),
                function ($attribute, $value, $fail) {
                    if (!preg_match('/[!@#$%^&*()_\-+=\[\]{}|:;,.?]/', $value)) {
                        $fail('The password must contain an allowed special character.');
                        return;
                    }
                    if (trim($value) !== $value) {
                        $fail('The password cannot start or end with spaces.');
                        return;
                    }
                    $weakPasswords = ['password', '12345678', 'qwerty', 'admin', 'welcome', '123456', 'password123', 'relieflink', 'letmein'];
                    if (in_array(strtolower($value), $weakPasswords, true)) {
                        $fail('This password is too common or easily guessable. Please choose a stronger password.');
                        return;
                    }
                    $nameParts = array_filter(explode(' ', strtolower($this->name ?? '')));
                    $emailParts = explode('@', strtolower($this->email ?? ''));
                    $emailUsername = $emailParts[0] ?? '';
                    foreach ($nameParts as $part) {
                        if (strlen($part) >= 3 && stripos($value, $part) !== false) {
                            $fail('The password cannot contain your name.');
                            return;
                        }
                    }
                    if (!empty($emailUsername) && strlen($emailUsername) >= 3 && stripos($value, $emailUsername) !== false) {
                        $fail('The password cannot contain your email address.');
                        return;
                    }
                }
            ],
        ];
    }

    public function messages(): array
    {
        $idLabel = 'Valid ID Number';
        if ($this->campus_role === 'student') {
            $idLabel = 'Student ID Number';
        } elseif ($this->campus_role === 'faculty') {
            $idLabel = 'Faculty/Employee ID Number';
        } elseif ($this->campus_role === 'staff') {
            $idLabel = 'Staff/Employee ID Number';
        } else {
            $idLabel = 'Valid ID Number';
        }

        return [
            'name.unique' => 'This name is already taken.',
            'email.unique' => 'This email address is already taken.',
            'contact_number.unique' => 'This contact number is already taken.',
            'campus_id.unique' => 'This ID number is already taken.',
            'campus_role.required' => 'Campus role is required.',
            'campus_id.required' => "{$idLabel} is required.",
            'campus_id.required_if' => "{$idLabel} is required.",
            'other_role_specify.required_if' => $this->role === 'donor'
                ? 'Please specify your donor type.'
                : 'Please specify your beneficiary type.',
            'country.required' => 'Country is required for international registration.',
            'country.required_if' => 'Country is required for international registration.',
            'organization_name.required_if' => 'Organization name is required for campus organizations.',
            'contact_number.required' => 'Contact number is required.',
            'email.regex' => 'Please enter a valid email address.',
            'password' => 'The password must contain an allowed special character.',
        ];
    }
}
