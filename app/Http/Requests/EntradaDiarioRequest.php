<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class EntradaDiarioRequest extends FormRequest
{
  public function authorize(): bool
  {
    return true;
  }

  public function rules(): array
  {
    return [
      'fecha'            => ['required', 'date'],
      'momento'          => ['nullable', 'date'],
      'contenido_md'     => ['required', 'string'],
      'mood_principal'   => ['nullable', Rule::in(['increible', 'bien', 'meh', 'mal', 'horrible'])],
      'mood_escala'      => ['nullable', 'integer', 'min:1', 'max:5'],
      'sueno_horas'      => ['nullable', 'numeric', 'min:0', 'max:24'],
      'plantilla_diaria' => ['sometimes', 'boolean'],
      'tarea_id'         => ['nullable', 'exists:tareas,id'],
    ];
  }
}
