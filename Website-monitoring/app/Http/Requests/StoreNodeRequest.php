<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreNodeRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'kode_node' => ['required', 'string', 'max:100'],
            'nama_lokasi' => ['required', 'string', 'max:255'],
        ];
    }
}
