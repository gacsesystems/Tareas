<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class TimeblockRequest extends FormRequest
{
  public function authorize(): bool
  {
    return true;
  }

  public function rules(): array
  {
    return [
      'fecha'             => ['required', 'date'],
      'hora_inicio'       => ['required', 'date_format:H:i'],
      'hora_fin'          => ['required', 'date_format:H:i', 'after:hora_inicio'],
      'categoria'         => ['nullable', 'string', 'max:60'],
      'descripcion'       => ['nullable', 'string', 'max:200'],
      'disponible'        => ['sometimes', 'boolean'],
      'capacidad_min'     => ['nullable', 'integer', 'min:0'],
      'parkinson_enforce' => ['sometimes', 'boolean'],
      'parkinson_max_min' => ['nullable', 'integer', 'min:0'],
      'evento_id'         => ['nullable', 'exists:eventos,id'],
    ];
  }
}
