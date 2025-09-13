<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Recurso extends Model
{
  use SoftDeletes;

  protected $fillable = [
    'titulo',
    'tipo',
    'autor',
    'anio',
    'genero',
    'fuente',
    'url',
    'archivo_id',
    'duracion_min_est',
    'requiere_pantalla',
    'apto_fondo',
    'apto_auto',
    'proposito',
    'prioridad',
    'plan_consumo_fecha',
    'fecha_caducidad',
    'status',
    'tarea_id',
    'conversion_modo',
    'ultimo_sugerido_at',
    'notas_md',
  ];

  protected $casts = [
    'anio'               => 'integer',
    'duracion_min_est'   => 'integer',
    'requiere_pantalla'  => 'boolean',
    'apto_fondo'         => 'boolean',
    'apto_auto'          => 'boolean',
    'plan_consumo_fecha' => 'date',
    'fecha_caducidad'    => 'date',
    'ultimo_sugerido_at' => 'datetime',
  ];

  public function archivo()
  {
    return $this->belongsTo(Archivo::class, 'archivo_id');
  }

  public function tarea()
  {
    return $this->belongsTo(Tarea::class, 'tarea_id');
  }

  // Polimórfico inverso en padres que usen HasRecursos
}
