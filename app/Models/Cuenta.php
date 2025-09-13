<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Cuenta extends Model
{
  protected $fillable = [
    'nombre',
    'tipo',
    'saldo_inicial',
    'saldo_cache',
    'activa',
    'notas',
  ];

  protected $casts = [
    'saldo_inicial' => 'decimal:2',
    'saldo_cache'   => 'decimal:2',
    'activa'        => 'boolean',
  ];

  public function movimientosOrigen()
  {
    return $this->hasMany(Movimiento::class, 'cuenta_id');
  }

  public function movimientosDestino()
  {
    return $this->hasMany(Movimiento::class, 'cuenta_destino_id');
  }
}
