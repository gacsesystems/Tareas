<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class MovtoRecurrente extends Model
{
  protected $table = 'movto_recurrentes';

  protected $fillable = [
    'tipo',
    'descripcion',
    'monto',
    'cuenta_id',
    'categoria_id',
    'frecuencia',
    'dia_semana',
    'dia_mes',
    'next_run',
    'activo',
  ];

  protected $casts = [
    'monto'    => 'decimal:2',
    'dia_semana' => 'integer',
    'dia_mes'    => 'integer',
    'next_run'   => 'date',
    'activo'     => 'boolean',
  ];

  public function cuenta()
  {
    return $this->belongsTo(Cuenta::class);
  }
  public function categoria()
  {
    return $this->belongsTo(CategoriaFin::class, 'categoria_id');
  }
}
