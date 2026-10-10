<?php

namespace App\Http\Requests\Api;

use App\Models\User;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Password;
use libphonenumber\PhoneNumberUtil;
use libphonenumber\PhoneNumberFormat;

class RegisterRequest extends FormRequest
{
    public static array $countryToIso = [
        'philippines' => 'PH',
        'ph' => 'PH',
        'united states' => 'US',
        'united states of america' => 'US',
        'us' => 'US',
        'usa' => 'US',
        'canada' => 'CA',
        'ca' => 'CA',
        'united kingdom' => 'GB',
        'uk' => 'GB',
        'gb' => 'GB',
        'great britain' => 'GB',
        'australia' => 'AU',
        'au' => 'AU',
        'japan' => 'JP',
        'jp' => 'JP',
        'south korea' => 'KR',
        'korea, south' => 'KR',
        'korea' => 'KR',
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
        'switzerland' => 'CH',
        'ch' => 'CH',
        'netherlands' => 'NL',
        'nl' => 'NL',
        'sweden' => 'SE',
        'se' => 'SE',
        'norway' => 'NO',
        'no' => 'NO',
        'denmark' => 'DK',
        'dk' => 'DK',
        'finland' => 'FI',
        'fi' => 'FI',
        'ireland' => 'IE',
        'ie' => 'IE',
        'belgium' => 'BE',
        'be' => 'BE',
        'austria' => 'AT',
        'at' => 'AT',
        'poland' => 'PL',
        'pl' => 'PL',
        'portugal' => 'PT',
        'pt' => 'PT',
        'greece' => 'GR',
        'gr' => 'GR',
        'turkey' => 'TR',
        'tr' => 'TR',
        'russia' => 'RU',
        'ru' => 'RU',
        'south africa' => 'ZA',
        'za' => 'ZA',
        'egypt' => 'EG',
        'eg' => 'EG',
        'argentina' => 'AR',
        'ar' => 'AR',
        'chile' => 'CL',
        'cl' => 'CL',
        'colombia' => 'CO',
        'co' => 'CO',
        'peru' => 'PE',
        'pe' => 'PE',
        'israel' => 'IL',
        'il' => 'IL',
        'pakistan' => 'PK',
        'pk' => 'PK',
        'bangladesh' => 'BD',
        'bd' => 'BD',
        'bahrain' => 'BH',
        'bh' => 'BH',
        'oman' => 'OM',
        'om' => 'OM',
        'jordan' => 'JO',
        'jo' => 'JO',
        'lebanon' => 'LB',
        'lb' => 'LB',
    ];

    public const DEPARTMENT_COURSES = [
        'College of Teacher Education' => [
            'Bachelor of Elementary Education',
            'Bachelor of Secondary Education',
        ],
        'College of Arts and Sciences' => [
            'Bachelor of Arts in Political Science',
            'Bachelor of Arts in Communication',
        ],
        'College of Criminal Justice Education' => [
            'Bachelor of Science in Criminology',
        ],
        'College of Computer Studies' => [
            'Bachelor of Science in Information Technology',
        ],
        'College of Office Administration' => [
            'Bachelor of Science in Office Administration',
        ],
    ];

    public const BENEFICIARY_DEPARTMENTS = [
        'College of Teacher Education',
        'College of Arts and Sciences',
        'College of Criminal Justice Education',
        'College of Computer Studies',
        'College of Office Administration',
    ];

    public const BENEFICIARY_COURSES = [
        'Bachelor of Elementary Education',
        'Bachelor of Secondary Education',
        'Bachelor of Arts in Political Science',
        'Bachelor of Arts in Communication',
        'Bachelor of Science in Criminology',
        'Bachelor of Science in Information Technology',
        'Bachelor of Science in Office Administration',
    ];

    public const BENEFICIARY_YEAR_LEVELS = [
        '1st Year',
        '2nd Year',
        '3rd Year',
        '4th Year',
    ];

    public const DEPARTMENTS = self::BENEFICIARY_DEPARTMENTS;
    public const COURSES = self::BENEFICIARY_COURSES;
    public const YEAR_LEVELS = self::BENEFICIARY_YEAR_LEVELS;

    public function authorize(): bool
    {
        return (bool) \App\Services\SystemSettings::get('allow_self_registration', true);
    }

    public static function resolveCountryIso(?string $country, ?string $countryCode = null): string
    {
        if (!empty($countryCode) && strlen(trim($countryCode)) === 2) {
            return strtoupper(trim($countryCode));
        }
        $key = strtolower(trim((string) $country));
        if ($key === '') {
            return 'PH';
        }
        if (isset(self::$countryToIso[$key])) {
            return self::$countryToIso[$key];
        }
        if (strlen($key) === 2) {
            return strtoupper($key);
        }
        return 'PH';
    }

    protected function prepareForValidation(): void
    {
        $accountTypeInput = trim((string) ($this->input('account_type', '') ?: $this->input('role', '')));
        $countryInput = trim((string) $this->input('country', ''));
        $countryCodeInput = trim((string) $this->input('country_code', ''));
        $contactInput = trim((string) $this->input('contact_number', ''));
        if ($accountTypeInput === 'beneficiary') {
            $contactRaw = $contactInput;
        } else {
            $contactRaw = self::normalizeContactNumber($contactInput, $countryInput, $countryCodeInput);
        }

        $nullable = fn (string $v): ?string => $v === '' ? null : $v;
        $beneficiaryType = trim((string) $this->input('beneficiary_type', ''));
        if ($accountTypeInput === 'beneficiary' && $beneficiaryType === '') {
            $beneficiaryType = 'student';
        }

        $firstName = self::normalizeName((string) $this->input('first_name', ''));
        $middleName = self::normalizeName((string) $this->input('middle_name', ''));
        $lastName = self::normalizeName((string) $this->input('last_name', ''));
        $nameInput = self::normalizeName((string) $this->input('name', ''));

        if ($firstName !== '' || $lastName !== '') {
            $computedName = trim($firstName . ($middleName !== '' ? ' ' . $middleName : '') . ' ' . $lastName);
            $fullName = $nameInput !== '' ? $nameInput : $computedName;
        } else {
            $fullName = $nameInput;
            $parts = explode(' ', $nameInput);
            if (count($parts) >= 2) {
                $firstName = $parts[0];
                $lastName = end($parts);
                $middleName = count($parts) > 2 ? implode(' ', array_slice($parts, 1, -1)) : '';
            } else {
                $firstName = $nameInput;
                $lastName = '';
                $middleName = '';
            }
        }

        $emailInput = self::normalizeEmail((string) ($this->input('email', '') ?: $this->input('school_email', '')));

        // Compose full address string if components provided
        $addr1 = trim((string) $this->input('address_line_1', ''));
        $district = trim((string) $this->input('district_local_area', ''));
        $city = trim((string) ($this->input('city_municipality', '') ?: $this->input('city', '')));
        $state = trim((string) ($this->input('state_province_region', '') ?: $this->input('state', '')));
        $postal = trim((string) ($this->input('postal_zip_code', '') ?: $this->input('zip_code', '')));
        $providedAddress = trim((string) $this->input('address', ''));

        if ($addr1 !== '') {
            $composedAddress = implode(', ', array_filter([$addr1, $district, $city, $state, $postal, $countryInput]));
            $address = $providedAddress ?: $composedAddress;
        } else {
            $address = $providedAddress;
        }

        $validIdNum = self::normalizeId((string) ($this->input('valid_id_number', '') ?: $this->input('campus_id', '')));
        $resolvedIso = self::resolveCountryIso($countryInput, $countryCodeInput);

        $normalized = [
            'first_name'            => $nullable($firstName),
            'middle_name'           => $nullable($middleName),
            'last_name'             => $nullable($lastName),
            'name'                  => $nullable($fullName),
            'email'                 => $emailInput,
            'role'                  => $accountTypeInput,
            'account_type'          => $accountTypeInput,
            'contact_number'        => $contactRaw,
            'campus_id'             => $nullable($validIdNum),
            'address'               => $nullable($address),
            'address_line_1'        => $nullable($addr1),
            'state_province_region' => $nullable($state),
            'city_municipality'     => $nullable($city),
            'district_local_area'   => $nullable($district),
            'postal_zip_code'       => $nullable($postal),
            'valid_id_type'         => $nullable(trim((string) $this->input('valid_id_type', ''))),
            'valid_id_number'       => $nullable($validIdNum),
            'student_id_number'     => $nullable(self::normalizeId((string) $this->input('student_id_number', ''))),
            'beneficiary_type'      => $nullable($beneficiaryType),
            'school_email'          => $nullable($emailInput),
            'department'            => $nullable(trim((string) $this->input('department', ''))),
            'course'                => $nullable(trim((string) $this->input('course', ''))),
            'year_level'            => $nullable(trim((string) $this->input('year_level', ''))),
            'country'               => $nullable($countryInput),
            'country_code'          => $nullable($resolvedIso),
        ];

        // Isolate role-specific fields
        if ($accountTypeInput === 'beneficiary') {
            $normalized['address'] = null;
            $normalized['address_line_1'] = null;
            $normalized['state_province_region'] = null;
            $normalized['city_municipality'] = null;
            $normalized['district_local_area'] = null;
            $normalized['postal_zip_code'] = null;
            $normalized['valid_id_type'] = null;
            $normalized['valid_id_number'] = null;
            $normalized['valid_id_number'] = null;
            $normalized['valid_id_type'] = null;
            $normalized['country'] = null;
            $normalized['country_code'] = null;
            $normalized['school_email'] = $emailInput;
        } elseif ($accountTypeInput === 'donor') {
            $normalized['beneficiary_type'] = null;
            $normalized['student_id_number'] = null;
            $normalized['school_email'] = null;
            $normalized['department'] = null;
            $normalized['course'] = null;
            $normalized['year_level'] = null;
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

    public static function normalizeContactNumber(string $value, string $country = '', ?string $countryCode = null): string
    {
        $value = trim($value);
        if ($value === '') return '';

        $region = self::resolveCountryIso($country, $countryCode);
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
        $isBeneficiary = $this->input('role') === 'beneficiary' || $this->input('account_type') === 'beneficiary';
        $isDonor = $this->input('role') === 'donor' || $this->input('account_type') === 'donor';
        $beneficiaryType = $this->input('beneficiary_type');
        $isStudentBeneficiary = $isBeneficiary && $beneficiaryType === 'student';
        $isEmployeeBeneficiary = $isBeneficiary && in_array($beneficiaryType, ['faculty', 'staff'], true);

        return [
            'role' => ['required', Rule::in(['beneficiary', 'donor'])],
            'account_type' => ['nullable', Rule::in(['beneficiary', 'donor'])],
            'beneficiary_type' => [$isBeneficiary ? 'required' : 'nullable', 'nullable', Rule::in(['student', 'faculty'])],
            'first_name' => ['required', 'string', 'max:100'],
            'middle_name' => ['nullable', 'string', 'max:100'],
            'last_name' => ['required', 'string', 'max:100'],
            'name' => [
                'nullable', 'string', 'max:255',
                function ($attribute, $value, $fail) {
                    if (!empty($value) && User::query()->whereRaw('LOWER(name) = ?', [strtolower($value)])->exists()) {
                        $fail('This name is already taken.');
                    }
                },
            ],
            'email' => [
                'required',
                'email',
                'max:255',
                'unique:users,email',
                'regex:/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/',
                function ($attribute, $value, $fail) {
                    if (str_contains($value, '..')) {
                        $fail('Please enter a valid email address.');
                    }
                },
            ],
            'contact_number' => [
                'required',
                'string',
                'max:30',
                function ($attribute, $value, $fail) use ($isBeneficiary, $isDonor) {
                    if (empty($value)) {
                        $fail('Contact Number is required.');
                        return;
                    }

                    if ($isBeneficiary) {
                        if (!preg_match('/^09[0-9]{9}$/', $value)) {
                            $fail('Please enter a valid Philippine mobile number (09XXXXXXXXX).');
                            return;
                        }
                        $localNum = trim($value);
                        $e164Num = '+63' . substr($localNum, 1);
                        $exists = User::query()->where('contact_number', $localNum)->orWhere('contact_number', $e164Num)->exists();
                        if ($exists) {
                            $fail('This contact number is already taken. Please use a different contact number.');
                        }
                        return;
                    }

                    $localNumber = preg_match('/^09[0-9]{9}$/', $value)
                        ? $value
                        : (preg_match('/^\+639[0-9]{9}$/', $value) ? '0' . substr($value, 3) : null);
                    if ($localNumber === null) {
                        $fail('Please enter a valid Philippine mobile number (09XXXXXXXXX).');
                        return;
                    }

                    $e164 = '+63' . substr($localNumber, 1);
                    $exists = User::query()->where('contact_number', $localNumber)
                        ->orWhere('contact_number', $e164)
                        ->exists();
                    if ($exists) {
                        $fail('This contact number is already taken. Please use a different contact number.');
                    }
                },
            ],

            // Beneficiary-specific rules
            'student_id_number' => [
                $isStudentBeneficiary ? 'required' : 'nullable',
                'string',
                'max:9',
                $isStudentBeneficiary ? 'regex:/^\d{2}-\d{6}$/' : 'nullable',
                'unique:users,student_id_number',
            ],
            'campus_id' => [
                $isEmployeeBeneficiary ? 'required' : 'nullable',
                'nullable', 'string', 'min:3', 'max:50', 'unique:users,campus_id',
            ],
            'department' => [
                $isBeneficiary ? 'required' : 'nullable',
                'string',
                'max:255',
                $isStudentBeneficiary ? Rule::in(self::BENEFICIARY_DEPARTMENTS) : 'nullable',
            ],
            'course' => [
                $isStudentBeneficiary ? 'required' : 'nullable',
                'string',
                'max:255',
                $isStudentBeneficiary ? function ($attribute, $value, $fail) {
                    $department = $this->input('department');
                    $allowed = self::DEPARTMENT_COURSES[$department] ?? [];
                    if (!in_array($value, $allowed, true)) {
                        $fail('The selected course does not belong to the selected department. Please choose a valid course.');
                    }
                } : 'nullable',
            ],
            'year_level' => [
                $isStudentBeneficiary ? 'required' : 'nullable',
                'string',
                'max:50',
                $isBeneficiary ? Rule::in(self::BENEFICIARY_YEAR_LEVELS) : 'nullable',
            ],

            // Donor-specific rules
            'country' => [
                $isDonor ? 'required' : 'nullable',
                'string',
                'max:100',
                function ($attribute, $value, $fail) use ($isDonor) {
                    if ($isDonor && !in_array(strtolower(trim((string) $value)), ['philippines', 'ph'], true)) {
                        $fail('Donor registration is limited to the Philippines.');
                    }
                },
            ],
            'country_code' => [
                'nullable',
                'string',
                'max:10',
                function ($attribute, $value, $fail) use ($isDonor) {
                    if ($isDonor && !empty($value) && strtoupper(trim((string) $value)) !== 'PH') {
                        $fail('Donor registration is limited to the Philippines.');
                    }
                },
            ],
            'address_line_1' => [$isDonor ? 'required' : 'nullable', 'string', 'max:255'],
            'state_province_region' => ['nullable', 'string', 'max:255'],
            'city_municipality' => ['nullable', 'string', 'max:255'],
            'district_local_area' => ['nullable', 'string', 'max:255'],
            'postal_zip_code' => ['nullable', 'string', 'max:50'],
            'valid_id_type' => [$isDonor ? 'required' : 'nullable', 'string', 'max:100'],
            'valid_id_number' => [
                $isDonor ? 'required' : 'nullable',
                'string',
                'max:50',
                'unique:users,valid_id_number',
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
                    $nameParts = array_filter(explode(' ', strtolower($this->name ?? ($this->first_name . ' ' . $this->last_name))));
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
        return [
            'role.required' => 'Please select an account type.',
            'role.in' => 'Please select a valid account type.',
            'account_type.required' => 'Please select an account type.',
            'account_type.in' => 'Please select a valid account type.',
            'first_name.required' => 'First Name is required.',
            'last_name.required' => 'Last Name is required.',
            'name.unique' => 'This name is already taken.',
            'email.required' => 'Email Address is required.',
            'email.unique' => 'This email address is already taken. Please use a different email address.',
            'email.email' => 'Please enter a valid email address.',
            'email.regex' => 'Please enter a valid email address.',
            'contact_number.required' => 'Contact Number is required.',
            'contact_number.unique' => 'This contact number is already taken. Please use a different contact number.',
            'student_id_number.required' => 'Student ID Number is required.',
            'student_id_number.regex' => 'Please enter a valid Student ID Number in the format YY-###### (e.g., 21-010956).',
            'student_id_number.unique' => 'This Student ID Number is already registered.',
            'department.required' => 'Please select a department.',
            'department.in' => 'Please select a valid department.',
            'course.required' => 'Please select a course.',
            'course.in' => 'Please select a valid course.',
            'year_level.required' => 'Please select a year level.',
            'year_level.in' => 'Please select a valid year level.',
            'country.required' => 'Donor registration is limited to the Philippines.',
            'address_line_1.required' => 'Please enter your address.',
            'valid_id_type.required' => 'Please select a valid ID type.',
            'valid_id_number.required' => 'Please enter your valid ID number.',
            'valid_id_number.unique' => 'This Valid ID Number is already taken.',
            'password.required' => 'Password is required.',
            'password.confirmed' => 'Passwords do not match.',
            'password' => 'The password must contain an allowed special character.',
        ];
    }
}
