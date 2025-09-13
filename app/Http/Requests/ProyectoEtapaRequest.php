<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class ProyectoEtapaRequest extends FormRequest
{
  public function authorize(): bool
  {
    return true;
  }

  public function rules(): array
  {
    return [
      'proyecto_id'        => ['required', 'exists:proyectos,id'],
      'nombre'             => ['required', 'string', 'max:120'],
      'orden'              => ['required', 'integer'],

      'fecha_inicio_plan'  => ['nullable', 'date'],
      'fecha_fin_plan'     => ['nullable', 'date', 'after_or_equal:fecha_inicio_plan'],
      'fecha_inicio_real'  => ['nullable', 'date'],
      'fecha_fin_real'     => ['nullable', 'date', 'after_or_equal:fecha_inicio_real'],

      'progreso_pct'       => ['nullable', 'numeric', 'min:0', 'max:100'],
      'done'               => ['sometimes', 'boolean'],
    ];
  }
}
