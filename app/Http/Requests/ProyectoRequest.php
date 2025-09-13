<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class ProyectoRequest extends FormRequest
{
  public function authorize(): bool
  {
    return true; // 1 usuario
  }

  public function rules(): array
  {
    return [
      'nombre'        => ['required', 'string', 'max:200'],
      'descripcion'   => ['nullable', 'string', 'max:400'],
      'area_id'       => ['nullable', 'exists:areas,id'],
      'status'        => ['required', Rule::in(['abierto', 'cerrado'])],
      'prioridad'     => ['required', Rule::in(['baja', 'media', 'alta'])],
      'estrategico'   => ['sometimes', 'boolean'],

      'fec_inicio_plan' => ['nullable', 'date'],
      'fec_fin_plan'    => ['nullable', 'date', 'after_or_equal:fec_inicio_plan'],
      'fec_inicio_real' => ['nullable', 'date'],
      'fec_fin_real'    => ['nullable', 'date', 'after_or_equal:fec_inicio_real'],

      'criterio_cierre'   => ['required', Rule::in(['tareas', 'objetivos'])],
      'objetivo_principal' => ['nullable', 'string', 'max:300'],

      'proxima_accion_tarea_id' => ['nullable', 'exists:tareas,id'],
      'proxima_accion_modo'     => ['required', Rule::in(['auto', 'manual'])],

      'owner_id'                 => ['nullable', 'exists:personas,id'],
      'delegation_level_applied' => ['nullable', 'integer', 'min:1', 'max:5'],

      'interest_hits'    => ['nullable', 'integer', 'min:0'],
      'interest_last_at' => ['nullable', 'date'],

      'progreso_pct' => ['nullable', 'numeric', 'min:0', 'max:100'], // normalmente lo recalculamos nosotros
      'notas_md'     => ['nullable', 'string'],
    ];
  }

  protected function prepareForValidation(): void
  {
    if ($this->has('nombre')) {
      $this->merge(['nombre' => trim((string)$this->nombre)]);
    }
  }

  public function messages(): array
  {
    return [
      'fec_fin_plan.after_or_equal' => 'La fecha fin plan no puede ser anterior al inicio.',
      'fec_fin_real.after_or_equal' => 'La fecha fin real no puede ser anterior al inicio real.',
    ];
  }
}
