<?php

namespace App\Http\Requests\Api;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreDonationRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $type = $this->input('donation_type', 'physical');

        $rules = [
            'donation_type' => ['nullable', Rule::in(['physical', 'financial'])],
            'item_name' => 'required|string|max:255',
            'category' => 'required|string|max:80',
            'condition_notes' => 'nullable|string|max:2000',
            'availability_window' => 'nullable|string|max:255',
            'pickup_location' => 'nullable|string|max:255',
            'preferred_handoff_slots' => 'nullable|string|max:2000',
            'image' => 'nullable|image|max:4096',
            'request_id' => 'nullable|exists:requests,id',
        ];

        if ($type === 'financial') {
            $rules['amount'] = 'required|numeric|min:1';
            $rules['currency'] = 'nullable|string|max:10';
            $rules['quantity'] = 'nullable|integer|min:1';
        } else {
            $rules['quantity'] = 'required|integer|min:1';
            $rules['amount'] = 'nullable|numeric|min:0';
            $rules['currency'] = 'nullable|string|max:10';
        }

        return $rules;
    }
}
