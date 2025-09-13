<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SesionTrabajo extends Model
{
  protected $table = 'sesiones_trabajo';
  protected $fillable = [
    'tarea_id',
    'tipo',
    'inicio',
    'fin',
    'foco_min',
    'descanso_min',
    'modo_rollover',
    'next_focus_suggestion',
    'notas',
  ];

  protected $casts = [
    'inicio'               => 'datetime',
    'fin'                  => 'datetime',
    'foco_min'             => 'integer',
    'descanso_min'         => 'integer',
    'next_focus_suggestion' => 'array',
  ];

  public function tarea()
  {
    return $this->belongsTo(Tarea::class);
  }
}
