<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class MovimientoRequest extends FormRequest
{
  public function authorize(): bool
  {
    return true;
  }

  public function rules(): array
  {
    return [
      'tipo'     => ['required', Rule::in(['ingreso', 'gasto', 'transferencia', 'ajuste'])],
      'descripcion' => ['required', 'string', 'max:200'],
      'contraparte' => ['nullable', 'string', 'max:160'],
      'monto'       => ['required', 'numeric', 'min:0.01'],
      'fecha_objetivo' => ['nullable', 'date'],
      'fecha_real'     => ['nullable', 'date'],
      'status'         => ['required', Rule::in(['pendiente', 'realizado', 'vencido'])],

      'cuenta_id'        => ['nullable', 'exists:cuentas,id'],
      'cuenta_destino_id' => ['nullable', 'exists:cuentas,id'],
      'transfer_group_id' => ['nullable', 'uuid'],
      'categoria_id'     => ['nullable', 'exists:categorias_fin,id'],
      'archivo_id'       => ['nullable', 'exists:archivos,id'],

      'tiene_plan_parcial' => ['sometimes', 'boolean'],
      'msi_meses'          => ['nullable', 'integer', 'min:1', 'max:120'],
      'msi_inicio'         => ['nullable', 'date'],

      'recordatorio_creado_at' => ['nullable', 'date'],
      'notas_md'               => ['nullable', 'string'],
    ];
  }

  public function withValidator($validator)
  {
    $validator->after(function ($v) {
      $tipo = $this->input('tipo');
      if ($tipo === 'transferencia') {
        if (!$this->filled('cuenta_id') || !$this->filled('cuenta_destino_id')) {
          $v->errors()->add('cuenta_destino_id', 'Transferencia requiere cuenta origen y destino.');
        }
      }
    });
  }
}
