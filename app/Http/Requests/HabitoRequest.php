<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class HabitoRequest extends FormRequest
{
  public function authorize(): bool
  {
    return true;
  }

  public function rules(): array
  {
    return [
      'nombre'  => ['required', 'string', 'max:120'],
      'tipo'    => ['required', Rule::in(['positivo', 'negativo'])],

      'unidad'  => ['nullable', 'string', 'max:20'],
      'meta'    => ['nullable', 'numeric', 'min:0'],
      'umbral_cumplimiento' => ['nullable', 'numeric', 'min:0', 'max:1000000'],

      'periodicidad' => ['required', Rule::in(['diario', 'semanal', 'quincenal', 'mensual', 'anual'])],
      'times_per_week' => ['nullable', 'integer', 'min:1', 'max:7'],
      'dias_semana_bitmap' => ['nullable', 'integer', 'min:0', 'max:127'],
      'min_dias_mes' => ['nullable', 'integer', 'min:1', 'max:31'],

      'fecha_inicio' => ['nullable', 'date'],
      'activo'       => ['sometimes', 'boolean'],
      'peso'         => ['nullable', 'integer', 'min:1', 'max:5'],

      'streak'       => ['nullable', 'integer', 'min:0'],
      'mejor_streak' => ['nullable', 'integer', 'min:0'],

      'freezes_restantes_mes'  => ['nullable', 'integer', 'min:0'],
      'comodines_restantes_mes' => ['nullable', 'integer', 'min:0'],

      'task_template_id' => ['nullable', 'exists:tareas,id'],
      'notas_md'         => ['nullable', 'string'],
    ];
  }
}
