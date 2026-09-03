<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreNodeRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'kode_node' => ['required', 'string', 'max:100', Rule::unique('nodes', 'kode_node')],
            'nama_lokasi' => ['required', 'string', 'max:255'],
        ];
    }
}
