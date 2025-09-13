<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Rutina extends Model
{
  protected $fillable = [
    'nombre',
    'descripcion',
    'periodicidad',
    'dias_semana_bitmap',
    'horario_sugerido',
    'activo',
    'notas_md',
  ];

  protected $casts = [
    'dias_semana_bitmap' => 'integer',
    'horario_sugerido'   => 'datetime:H:i:s',
    'activo'             => 'boolean',
  ];

  public function items()
  {
    return $this->hasMany(RutinaItem::class, 'rutina_id')->orderBy('orden');
  }
}
