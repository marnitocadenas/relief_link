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
        ]);
    }

    public function rules(): array
    {
        return [
            'name' => 'required|string|max:255',
            'email' => ['required', 'email', 'max:255', 'unique:users,email', 'regex:/^[^\s@]+@[^\s@]+\.[^\s@]+$/'],
            'role' => ['required', Rule::in(['donor', 'beneficiary', 'staff'])],
            'campus_role' => [
                'required',
                'string',
                'max:50',
                function ($attribute, $value, $fail) {
                    if ($this->role === 'donor') {
                        $allowed = ['student', 'faculty', 'staff', 'alumni', 'campus_organization', 'other'];
                        if (!in_array(strtolower($value), $allowed)) {
                            $fail('Invalid donor type selected.');
                        }
                    } elseif ($this->role === 'beneficiary') {
                        $allowed = ['student', 'faculty', 'staff', 'other'];
                        if (!in_array(strtolower($value), $allowed)) {
                            $fail('Invalid beneficiary type selected.');
                        }
                    }
                },
            ],
            'contact_number' => 'required|string|max:20|regex:/^[\d\s\-\+\(\)]+$/',
            'campus_id' => [
                'required_if:role,beneficiary',
                'string',
                'max:50',
            ],
            'organization_name' => [
                'required_if:campus_role,campus_organization',
                'string',
                'max:255',
            ],
            'other_role_specify' => [
                'required_if:campus_role,other',
                'string',
                'max:100',
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
        return [
            'campus_role.required' => 'Campus role is required.',
            'contact_number.required' => 'Contact number is required.',
            'contact_number.regex' => 'Contact number must contain only numbers, spaces, dashes, plus signs, and parentheses.',
            'email.regex' => 'Please enter a valid email address.',
            'password' => 'The password must contain an allowed special character.',
            'campus_id.required_if' => 'Campus ID / Student ID is required for beneficiaries.',
            'organization_name.required_if' => 'Organization name is required for campus organizations.',
            'other_role_specify.required_if' => 'Please specify your campus role.',
        ];
    }
}
