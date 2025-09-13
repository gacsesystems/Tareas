<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class TareaRequest extends FormRequest
{
  public function authorize(): bool
  {
    return true; // app de 1 usuario
  }

  public function rules(): array
  {
    return [
      'proyecto_id'          => ['nullable', 'exists:proyectos,id'],
      'proyecto_etapa_id'    => ['nullable', 'exists:proyecto_etapas,id'],
      'titulo'               => ['required', 'string', 'min:2', 'max:300'],
      'detalle_md'           => ['nullable', 'string'],
      'estado'               => ['required', Rule::in(['backlog', 'siguiente', 'hoy', 'en_curso', 'en_revision', 'hecha', 'bloqueada'])],
      'fecha'                => ['nullable', 'date'],
      'fecha_limite'         => ['nullable', 'date', 'after_or_equal:fecha'],
      'seguimiento_proximo'  => ['nullable', 'date'],

      'responsable_id'       => ['nullable', 'exists:personas,id'],
      'tipo'                 => ['required', Rule::in(['tarea', 'bug', 'mejora', 'investigacion', 'consumo'])],
      'area_id'              => ['required', 'exists:areas,id'],
      'contexto_id'          => ['required', 'exists:contextos,id'],

      'moscow'               => ['nullable', Rule::in(['M', 'S', 'C', 'W'])],
      'horizon'              => ['nullable', Rule::in(['H1', 'H2', 'H3'])],
      'eisen_importante'     => ['sometimes', 'boolean'],
      'eisen_urgente'        => ['sometimes', 'boolean'],

      'impacto'              => ['nullable', 'integer', 'min:0', 'max:10'],
      'valor'                => ['nullable', 'integer', 'min:0', 'max:10'],
      'eficiencia'           => ['nullable', 'integer', 'min:0', 'max:10'],
      'stakeholders'         => ['nullable', 'integer', 'min:0', 'max:10'],
      'urgencia_manual'      => ['nullable', 'integer', 'min:0', 'max:10'],

      'kash'                 => ['nullable', Rule::in(['K', 'A', 'S', 'H'])],
      'family_friendly'      => ['sometimes', 'boolean'],
      'is_rock'              => ['sometimes', 'boolean'],
      'frog'                 => ['sometimes', 'boolean'],
      'frog_date'            => ['nullable', 'date'],

      'pomos_estimados'      => ['nullable', 'integer', 'min:0', 'max:255'],
      'pomos_realizados'     => ['nullable', 'integer', 'min:0', 'max:765'], // sanity cap 3x
      'tiempo_total_min'     => ['nullable', 'integer', 'min:0'],

      'ranking'              => ['nullable', 'integer'],
      'pareto'               => ['sometimes', 'boolean'],

      'bloqueada'            => ['sometimes', 'boolean'],
      'bloqueo_motivo'       => ['nullable', 'string', 'max:300'],

      'score_boost_until'    => ['nullable', 'date'],
      'score_boost_factor'   => ['nullable', 'numeric', 'min:1', 'max:1.25'],

      'riesgo_oportunidad'   => ['nullable', 'numeric', 'min:-0.20', 'max:0.20'],

      'habito_id'            => ['nullable', 'exists:habito,id'],
      'dificultad'           => ['nullable', Rule::in(['trivial/mecánico', 'requiere_pensar_leer_investigar', 'muy_exigente'])],
      'kaizen'               => ['sometimes', 'boolean'],

      'delegation_level_rec'     => ['nullable', 'integer', 'min:1', 'max:5'],
      'delegation_level_applied' => ['nullable', 'integer', 'min:1', 'max:5'],
      'skill_override'           => ['nullable', 'integer', 'min:0', 'max:10'],
      'will_override'            => ['nullable', 'integer', 'min:0', 'max:10'],

      'sla_fecha'            => ['nullable', 'date'],
      'ultimo_movimiento_at' => ['nullable', 'date'],
      'escalado'             => ['sometimes', 'boolean'],

      'interest_hits'        => ['nullable', 'integer', 'min:0'],
    ];
  }

  public function messages(): array
  {
    return [
      'titulo.required' => 'La tarea necesita un título.',
      'fecha_limite.after_or_equal' => 'La fecha límite no puede ser anterior a la fecha de creación.',
    ];
  }

  /** Normalización simple */
  protected function prepareForValidation(): void
  {
    if ($this->has('titulo')) {
      $this->merge(['titulo' => trim((string) $this->titulo)]);
    }

    // normaliza strings vacíos a null
    $this->merge([
      'proyecto_id'     => $this->proyecto_id     === '' ? null : $this->proyecto_id,
      'responsable_id'  => $this->responsable_id  === '' ? null : $this->responsable_id,
      'fecha_limite'    => $this->fecha_limite    === '' ? null : $this->fecha_limite,
      'moscow'          => $this->moscow          === '' ? null : $this->moscow,
      'horizon'         => $this->horizon         === '' ? null : $this->horizon,
      'kash'            => $this->kash            === '' ? null : $this->kash,
      'bloqueo_motivo'  => $this->bloqueo_motivo  === '' ? null : $this->bloqueo_motivo,
    ]);
  }
}
