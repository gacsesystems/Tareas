<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class EventoRequest extends FormRequest
{
  public function authorize(): bool
  {
    return true;
  }

  public function rules(): array
  {
    return [
      'titulo'         => ['required', 'string', 'max:200'],
      'tipo_evento_id' => ['required', 'exists:tipo_evento,id'],

      'fecha_inicio'   => ['required', 'date'],
      'fecha_fin'      => ['nullable', 'date', 'after_or_equal:fecha_inicio'],
      'all_day'        => ['sometimes', 'boolean'],

      'rrule'          => ['nullable', 'string', 'max:400'],
      'exdates'        => ['nullable', 'array'],

      'proyecto_id'    => ['nullable', 'exists:proyectos,id'],
      'tarea_id'       => ['nullable', 'exists:tareas,id'],
      'persona_id'     => ['nullable', 'exists:personas,id'],

      'recordatorio_inbox' => ['sometimes', 'boolean'],

      'external_source' => ['nullable', 'string', 'max:40'],
      'external_id'     => ['nullable', 'string', 'max:120'],
      'external_payload' => ['nullable', 'array'],

      'notas_md'        => ['nullable', 'string'],
    ];
  }
}
