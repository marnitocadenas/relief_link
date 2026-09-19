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

        $normalized = [
            'name' => self::normalizeName((string) $this->input('name', '')),
            // Store one canonical form so an address cannot be registered again
            // merely by changing its letter case.
            'email' => self::normalizeEmail((string) $this->input('email', '')),
            'role' => trim((string) $this->input('role', '')),
            'contact_number' => $contactRaw,
            'campus_id' => self::normalizeId((string) $this->input('campus_id', '')),
            'student_id_number' => self::normalizeId((string) $this->input('student_id_number', '')),
            'school_email' => self::normalizeEmail((string) $this->input('school_email', '')),
            'address' => trim((string) $this->input('address', '')),
            'department' => trim((string) $this->input('department', '')),
            'course' => trim((string) $this->input('course', '')),
            'year_level' => trim((string) $this->input('year_level', '')),
            'country' => $countryInput,
        ];
        if ($this->has('country_code')) {
            $normalized['country_code'] = strtoupper(trim((string) $this->input('country_code')));
        }
        $this->merge($normalized);
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
            'campus_id' => [
                'exclude_unless:role,donor',
                Rule::requiredIf(fn () => $this->role === 'donor'),
                'string',
                'max:50',
                'unique:users,campus_id',
            ],
            'address' => ['exclude_unless:role,donor', 'required', 'string', 'max:255'],
            'student_id_number' => ['exclude_unless:role,beneficiary', 'required', 'string', 'max:50', 'unique:users,student_id_number'],
            'school_email' => ['exclude_unless:role,beneficiary', 'required', 'email', 'max:255'],
            'department' => ['exclude_unless:role,beneficiary', 'required', 'string', 'max:255'],
            'course' => ['exclude_unless:role,beneficiary', 'required', 'string', 'max:255'],
            'year_level' => ['exclude_unless:role,beneficiary', 'required', 'string', 'max:50'],
            'country' => [
                'required',
                'string',
                'max:100',
                function ($attribute, $value, $fail) {
                    if (trim(strtolower($value)) === 'select your country' || trim($value) === '') {
                        $fail('Please select a valid country.');
                    }
                },
            ],
            'country_code' => ['nullable', 'string', 'size:2'],
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

        return [
            'name.unique' => 'This name is already taken.',
            'email.unique' => 'This email address is already taken.',
            'contact_number.unique' => 'This contact number is already taken.',
            'campus_id.unique' => 'This ID number is already taken.',
            'student_id_number.unique' => 'This student ID number is already taken.',
            'campus_id.required' => "{$idLabel} is required.",
            'campus_id.required_if' => "{$idLabel} is required.",
            'student_id_number.required' => 'Student ID Number is required.',
            'school_email.required' => 'School Email Address is required.',
            'department.required' => 'Department is required.',
            'course.required' => 'Course is required.',
            'year_level.required' => 'Year Level is required.',
            'address.required' => 'Address is required.',
            'country.required' => 'Please select your country.',
            'contact_number.required' => 'Contact number is required.',
            'email.regex' => 'Please enter a valid email address.',
            'password' => 'The password must contain an allowed special character.',
        ];
    }
}
