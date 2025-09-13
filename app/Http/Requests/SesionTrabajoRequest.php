<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class SesionTrabajoRequest extends FormRequest
{
  public function authorize(): bool
  {
    return true;
  }

  public function rules(): array
  {
    $tipos = ['trabajo', 'descanso'];
    $modos = ['acumulativo', 'balanceado', 'estricto'];

    return [
      'tarea_id' => ['nullable', 'exists:tareas,id'],
      'tipo'     => ['required', Rule::in($tipos)],
      'inicio'   => ['required', 'date'],
      'fin'      => ['nullable', 'date', 'after:inicio'],

      'foco_min'     => ['nullable', 'integer', 'min:0'],
      'descanso_min' => ['nullable', 'integer', 'min:0'],

      'modo_rollover' => ['required', Rule::in($modos)],
      'next_focus_suggestion' => ['nullable', 'array'],
      'notas' => ['nullable', 'string', 'max:400'],
    ];
  }
}
