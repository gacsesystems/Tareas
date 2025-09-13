<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class RecursoRequest extends FormRequest
{
  public function authorize(): bool
  {
    return true;
  }

  public function rules(): array
  {
    return [
      'titulo' => ['required', 'string', 'max:220'],
      'tipo'   => ['required', Rule::in(['video', 'podcast', 'libro', 'articulo', 'pelicula', 'curso', 'documento', 'musica', 'otro'])],

      'autor'  => ['nullable', 'string', 'max:160'],
      'anio'   => ['nullable', 'integer', 'min:1900', 'max:2100'],
      'genero' => ['nullable', 'string', 'max:80'],

      'fuente' => ['nullable', Rule::in(['youtube', 'vimeo', 'spotify', 'web', 'pdf', 'drive', 'local', 'otro'])],
      'url'    => ['nullable', 'url', 'max:500'],
      'archivo_id' => ['nullable', 'exists:archivos,id'],

      'duracion_min_est'  => ['nullable', 'integer', 'min:1', 'max:100000'],
      'requiere_pantalla' => ['sometimes', 'boolean'],
      'apto_fondo'        => ['sometimes', 'boolean'],
      'apto_auto'         => ['sometimes', 'boolean'],

      'proposito' => ['required', Rule::in(['educativo', 'inspirador', 'entretenimiento'])],
      'prioridad' => ['required', Rule::in(['baja', 'media', 'alta'])],

      'plan_consumo_fecha' => ['nullable', 'date'],
      'fecha_caducidad'    => ['nullable', 'date', 'after_or_equal:plan_consumo_fecha'],
      'status'             => ['required', Rule::in(['pendiente', 'en_progreso', 'consumido', 'archivado', 'vencido'])],

      'tarea_id'        => ['nullable', 'exists:tareas,id'],
      'conversion_modo' => ['required', Rule::in(['manual', 'semi', 'auto'])],
      'ultimo_sugerido_at' => ['nullable', 'date'],

      'notas_md' => ['nullable', 'string'],

      // Opcional: attach polimórfico inmediato (Tarea/Proyecto/Habito/Evento...)
      'attach_type' => ['nullable', 'string', 'max:80'],
      'attach_id'   => ['nullable', 'integer'],
    ];
  }
}
