<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class RutinaItem extends Model
{
  protected $table = 'rutina_items';

  protected $fillable = [
    'rutina_id',
    'tipo',
    'habito_id',
    'task_template_id',
    'descripcion',
    'duracion_est_min',
    'obligatorio',
    'orden',
  ];

  protected $casts = [
    'duracion_est_min' => 'integer',
    'obligatorio'      => 'boolean',
  ];

  public function rutina()
  {
    return $this->belongsTo(Rutina::class, 'rutina_id');
  }
  public function habito()
  {
    return $this->belongsTo(Habito::class, 'habito_id');
  } // tabla 'habito'
  public function taskTemplate()
  {
    return $this->belongsTo(Tarea::class, 'task_template_id');
  }
}
