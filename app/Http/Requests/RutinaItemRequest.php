<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class RutinaItemRequest extends FormRequest
{
  public function authorize(): bool
  {
    return true;
  }

  public function rules(): array
  {
    return [
      'rutina_id'        => ['required', 'exists:rutinas,id'],
      'tipo'             => ['required', Rule::in(['habito', 'tarea_micro', 'pausa', 'nota'])],
      'habito_id'        => ['nullable', 'exists:habito,id'],     // <- tabla singular
      'task_template_id' => ['nullable', 'exists:tareas,id'],
      'descripcion'      => ['nullable', 'string', 'max:200'],
      'duracion_est_min' => ['nullable', 'integer', 'min:1', 'max:10000'],
      'obligatorio'      => ['sometimes', 'boolean'],
      'orden'            => ['nullable', 'integer'],
    ];
  }
}
