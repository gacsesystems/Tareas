<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Presupuesto extends Model
{
  protected $fillable = [
    'categoria_id',
    'periodo',
    'anio',
    'mes',
    'semana_iso',
    'monto_plan',
    'monto_real_cache',
  ];

  protected $casts = [
    'anio'             => 'integer',
    'mes'              => 'integer',
    'semana_iso'       => 'integer',
    'monto_plan'       => 'decimal:2',
    'monto_real_cache' => 'decimal:2',
  ];

  public function categoria()
  {
    return $this->belongsTo(CategoriaFin::class, 'categoria_id');
  }
}
