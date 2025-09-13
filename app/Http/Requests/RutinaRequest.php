<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class RutinaRequest extends FormRequest
{
  public function authorize(): bool
  {
    return true;
  }

  public function rules(): array
  {
    return [
      'nombre'       => ['required', 'string', 'max:120'],
      'descripcion'  => ['nullable', 'string', 'max:300'],
      'periodicidad' => ['required', Rule::in(['diario', 'semanal', 'quincenal', 'mensual', 'bimestral', 'anual'])],
      'dias_semana_bitmap' => ['nullable', 'integer', 'min:0', 'max:127'],
      'horario_sugerido'   => ['nullable', 'date_format:H:i'],
      'activo'       => ['sometimes', 'boolean'],
      'notas_md'     => ['nullable', 'string'],
    ];
  }
}
