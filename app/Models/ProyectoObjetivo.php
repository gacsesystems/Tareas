<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ProyectoObjetivo extends Model
{
  protected $table = 'proyecto_objetivos';

  protected $fillable = [
    'proyecto_id',
    'descripcion',
    'fecha_objetivo',
    'cumplido',
    'orden',
  ];

  protected $casts = [
    'fecha_objetivo' => 'date',
    'cumplido'       => 'boolean',
    'orden'          => 'integer',
  ];

  public function proyecto()
  {
    return $this->belongsTo(Proyecto::class);
  }

  public function scopeOrdered($q)
  {
    return $q->orderBy('orden')->orderBy('id');
  }
}
