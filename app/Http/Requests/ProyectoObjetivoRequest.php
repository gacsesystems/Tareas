<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class ProyectoObjetivoRequest extends FormRequest
{
  public function authorize(): bool
  {
    return true;
  }

  public function rules(): array
  {
    return [
      'proyecto_id'   => ['required', 'exists:proyectos,id'],
      'descripcion'   => ['required', 'string', 'max:300'],
      'fecha_objetivo' => ['nullable', 'date'],
      'cumplido'      => ['sometimes', 'boolean'],
      'orden'         => ['required', 'integer'],
    ];
  }
}
