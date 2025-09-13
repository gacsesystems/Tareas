<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Evento extends Model
{
  protected $fillable = [
    'titulo',
    'tipo_evento_id',
    'fecha_inicio',
    'fecha_fin',
    'all_day',
    'rrule',
    'exdates',
    'proyecto_id',
    'tarea_id',
    'persona_id',
    'recordatorio_inbox',
    'external_source',
    'external_id',
    'external_payload',
    'notas_md',
  ];

  protected $casts = [
    'fecha_inicio'      => 'datetime',
    'fecha_fin'         => 'datetime',
    'all_day'           => 'boolean',
    'exdates'           => 'array',
    'recordatorio_inbox' => 'boolean',
    'external_payload'  => 'array',
  ];

  public function tipo()
  {
    return $this->belongsTo(TipoEvento::class, 'tipo_evento_id');
  }
  public function proyecto()
  {
    return $this->belongsTo(Proyecto::class);
  }
  public function tarea()
  {
    return $this->belongsTo(Tarea::class);
  }
  public function persona()
  {
    return $this->belongsTo(Persona::class);
  }
}
