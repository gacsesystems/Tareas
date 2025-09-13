<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class EtiquetaRequest extends FormRequest
{
  public function authorize(): bool
  {
    return true;
  }

  public function rules(): array
  {
    // unique compuesto (nombre, categoria) está en DB, aquí validamos shape
    return [
      'nombre'    => ['required', 'string', 'max:50'],
      'color'     => ['nullable', 'string', 'max:20'],
      'categoria' => ['nullable', 'string', 'max:50'],
    ];
  }
}
