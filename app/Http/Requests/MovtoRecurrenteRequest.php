<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class MovtoRecurrenteRequest extends FormRequest
{
  public function authorize(): bool
  {
    return true;
  }

  public function rules(): array
  {
    return [
      'tipo'        => ['required', Rule::in(['ingreso', 'gasto'])],
      'descripcion' => ['required', 'string', 'max:200'],
      'monto'       => ['required', 'numeric', 'min:0.01'],
      'cuenta_id'   => ['required', 'exists:cuentas,id'],
      'categoria_id' => ['nullable', 'exists:categorias_fin,id'],

      'frecuencia'  => ['required', Rule::in(['diaria', 'semanal', 'mensual'])],
      'dia_semana'  => ['nullable', 'integer', 'min:1', 'max:7'],
      'dia_mes'     => ['nullable', 'integer', 'min:1', 'max:31'],
      'next_run'    => ['required', 'date'],
      'activo'      => ['sometimes', 'boolean'],
    ];
  }
}
