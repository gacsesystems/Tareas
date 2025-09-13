<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class PersonaRequest extends FormRequest
{
  public function authorize(): bool
  {
    return true;
  }

  public function rules(): array
  {
    return [
      'nombre'           => ['required', 'string', 'max:120'],
      'relacion'         => ['nullable', Rule::in(['familiar', 'amigo', 'colaborador', 'cliente', 'otro'])],
      'email'            => ['nullable', 'email', 'max:200'],
      'telefono'         => ['nullable', 'string', 'max:40'],
      'activo'           => ['sometimes', 'boolean'],
      'notas'            => ['nullable', 'string'],
      'cumpleanos'       => ['nullable', 'date'],
      'skill'            => ['nullable', 'integer', 'min:0', 'max:10'],
      'will'             => ['nullable', 'integer', 'min:0', 'max:10'],
      'delegation_level' => ['nullable', 'integer', 'min:1', 'max:5'],
      'ranking'          => ['nullable', 'numeric', 'min:0', 'max:999.99'],
      'last_review_at'   => ['nullable', 'date'],
    ];
  }
}
