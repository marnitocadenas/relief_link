<?php

namespace App\Http\Requests\Api;

use App\Services\SystemSettings;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreAidRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $type = $this->input('request_type', 'physical');
        $requireJustification = SystemSettings::get('require_justification');

        $rules = [
            'request_type' => ['nullable', Rule::in(['physical', 'financial'])],
            'category' => 'required|string|max:80',
            'urgency' => ['required', Rule::in(['low', 'medium', 'high'])],
            'justification' => ($requireJustification ? 'required' : 'nullable') . '|string|max:2000',
            'preferred_assistance_date' => 'nullable|string|max:100',
            'additional_info' => 'nullable|string|max:2000',
            'alternative_categories' => 'nullable|string|max:255',
            'pickup_location' => 'nullable|string|max:255',
            'availability_window' => 'nullable|string|max:255',
            'image' => 'nullable|file|mimes:jpg,jpeg,png,webp,pdf|max:4096',
        ];

        if ($type === 'financial') {
            $rules['amount_requested'] = 'required|numeric|min:1';
            $rules['currency'] = 'nullable|string|max:10';
            $rules['purpose_of_funds'] = 'required|string|max:2000';
            $rules['quantity_needed'] = 'nullable|integer|min:1';
            $rules['unit'] = 'nullable|string|max:50';
            $rules['item_details'] = 'nullable|string|max:255';
        } else {
            $rules['quantity_needed'] = 'required|integer|min:1';
            $rules['unit'] = 'nullable|string|max:50';
            $rules['item_details'] = 'nullable|string|max:255';
            $rules['amount_requested'] = 'nullable|numeric|min:0';
            $rules['currency'] = 'nullable|string|max:10';
            $rules['purpose_of_funds'] = 'nullable|string|max:2000';
        }

        return $rules;
    }

    public function messages(): array
    {
        return [
            'category.required' => 'Category is required.',
            'quantity_needed.required' => 'Quantity needed is required.',
            'quantity_needed.min' => 'Quantity needed must be at least 1.',
            'amount_requested.required' => 'Amount requested is required.',
            'amount_requested.min' => 'Amount requested must be at least 1.',
            'purpose_of_funds.required' => 'Purpose of funds is required.',
            'justification.required' => 'Reason for request is required.',
            'urgency.required' => 'Priority level is required.',
        ];
    }
}
