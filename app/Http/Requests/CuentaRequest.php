<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class CuentaRequest extends FormRequest
{
  public function authorize(): bool
  {
    return true;
  }

  public function rules(): array
  {
    return [
      'nombre'        => ['required', 'string', 'max:120'],
      'tipo'          => ['required', Rule::in(['billetera', 'cuenta', 'tarjeta_credito', 'prestamo_hipoteca'])],
      'saldo_inicial' => ['nullable', 'numeric'],
      'saldo_cache'   => ['nullable', 'numeric'],
      'activa'        => ['sometimes', 'boolean'],
      'notas'         => ['nullable', 'string', 'max:300'],
    ];
  }
}
