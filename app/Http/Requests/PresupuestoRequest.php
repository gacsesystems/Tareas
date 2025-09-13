<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class PresupuestoRequest extends FormRequest
{
  public function authorize(): bool
  {
    return true;
  }

  public function rules(): array
  {
    return [
      'categoria_id' => ['required', 'exists:categorias_fin,id'],
      'periodo'      => ['required', Rule::in(['mensual', 'semanal'])],
      'anio'         => ['required', 'integer', 'min:2000', 'max:2100'],
      'mes'          => ['nullable', 'integer', 'min:1', 'max:12'],
      'semana_iso'   => ['nullable', 'integer', 'min:1', 'max:53'],
      'monto_plan'   => ['required', 'numeric', 'min:0'],
      'monto_real_cache' => ['nullable', 'numeric', 'min:0'],
    ];
  }
}
