<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreSensorDataRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'api_token' => ['required', 'string'],
            'kode_node' => ['required', 'string', 'exists:nodes,kode_node'],

            'ph' => ['nullable', 'numeric', 'between:0,14'],
            'temp' => ['nullable', 'numeric', 'between:-10,100'],
            'humidity' => ['nullable', 'numeric', 'between:0,100'],
            'turbidity' => ['nullable', 'numeric', 'min:0'],
            'water_level' => ['nullable', 'numeric', 'min:0'],
            'vibration_rms' => ['nullable', 'numeric', 'min:0'],
            'ai_status' => ['nullable', 'string', 'in:Normal,Bahaya,Anomali'],
        ];
    }

    public function messages(): array
    {
        return [
            'ph.between' => 'Nilai pH harus di antara 0 dan 14.',
            'kode_node.exists' => 'kode_node tidak dikenal.',
        ];
    }
}
