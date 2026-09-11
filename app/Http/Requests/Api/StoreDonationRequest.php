<?php
namespace App\Http\Requests\Api; use Illuminate\Foundation\Http\FormRequest;
class StoreDonationRequest extends FormRequest { public function authorize():bool{return true;} public function rules():array{return ['item_name'=>'required|string|max:255','category'=>'required|string|max:80','quantity'=>'required|integer|min:1','condition_notes'=>'nullable|string|max:2000','availability_window'=>'nullable|string|max:255','pickup_location'=>'nullable|string|max:255','preferred_handoff_slots'=>'nullable|string|max:2000','image'=>'nullable|image|max:4096'];} }
