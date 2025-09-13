<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class MovimientoCuota extends Model
{
  protected $table = 'movimiento_cuotas';

  protected $fillable = ['movimiento_id', 'numero', 'monto', 'fecha_objetivo', 'status', 'pago_mov_id'];

  protected $casts = [
    'monto'         => 'decimal:2',
    'fecha_objetivo' => 'date',
  ];

  public function movimiento()
  {
    return $this->belongsTo(Movimiento::class);
  }
  public function pago()
  {
    return $this->belongsTo(Movimiento::class, 'pago_mov_id');
  }
}
