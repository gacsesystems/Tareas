<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class HabitoLogRequest extends FormRequest
{
  public function authorize(): bool
  {
    return true;
  }

  public function rules(): array
  {
    return [
      'habito_id' => ['required', 'exists:habito,id'],
      'fecha'     => ['required', 'date'],
      'valor'     => ['nullable', 'numeric', 'min:0'],
      // cumplido/porcentaje se recalculan server-side
      'tarea_id'  => ['nullable', 'exists:tareas,id'],
    ];
  }
}
