<?php

namespace App\Http\Requests\Api;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Password;

class RegisterRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    protected function prepareForValidation(): void
    {
        $this->merge([
            'name' => trim((string) $this->input('name', '')),
            'email' => trim((string) $this->input('email', '')),
            'role' => trim((string) $this->input('role', '')),
            'campus_role' => trim((string) $this->input('campus_role', '')),
            'contact_number' => trim((string) $this->input('contact_number', '')),
            'campus_id' => trim((string) $this->input('campus_id', '')),
            'organization_name' => trim((string) $this->input('organization_name', '')),
            'other_role_specify' => trim((string) $this->input('other_role_specify', '')),
            'country' => trim((string) $this->input('country', '')),
        ]);
    }

    public function rules(): array
    {
        $isInternational = $this->campus_role === 'other' && (
            stripos((string) $this->other_role_specify, 'international') !== false
        );

        return [
            'name' => 'required|string|max:255',
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
                        $allowed = ['student', 'faculty', 'staff', 'other'];
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
                'regex:/^\+?[0-9\s\-\(\)\.]{7,25}$/',
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
        $idLabel = 'Identification Number';
        if ($this->campus_role === 'student') {
            $idLabel = 'Student ID Number';
        } elseif ($this->campus_role === 'faculty') {
            $idLabel = 'Faculty/Employee ID Number';
        } elseif ($this->campus_role === 'staff') {
            $idLabel = 'Staff/Employee ID Number';
        } elseif ($this->campus_role === 'other') {
            $idLabel = 'Valid ID Number';
        }

        return [
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
            'contact_number.regex' => 'Please enter a valid international contact number.',
            'email.regex' => 'Please enter a valid email address.',
            'password' => 'The password must contain an allowed special character.',
        ];
    }
}
