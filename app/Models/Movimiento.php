<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Movimiento extends Model
{
  protected $fillable = [
    'tipo',
    'descripcion',
    'contraparte',
    'monto',
    'fecha_objetivo',
    'fecha_real',
    'status',
    'cuenta_id',
    'cuenta_destino_id',
    'transfer_group_id',
    'categoria_id',
    'archivo_id',
    'tiene_plan_parcial',
    'msi_meses',
    'msi_inicio',
    'recordatorio_creado_at',
    'notas_md',
  ];

  protected $casts = [
    'monto'                  => 'decimal:2',
    'fecha_objetivo'         => 'date',
    'fecha_real'             => 'date',
    'tiene_plan_parcial'     => 'boolean',
    'msi_meses'              => 'integer',
    'msi_inicio'             => 'date',
    'recordatorio_creado_at' => 'datetime',
  ];

  public function cuenta()
  {
    return $this->belongsTo(Cuenta::class, 'cuenta_id');
  }
  public function cuentaDestino()
  {
    return $this->belongsTo(Cuenta::class, 'cuenta_destino_id');
  }
  public function categoria()
  {
    return $this->belongsTo(CategoriaFin::class, 'categoria_id');
  }
  public function archivo()
  {
    return $this->belongsTo(Archivo::class, 'archivo_id');
  }
  public function cuotas()
  {
    return $this->hasMany(MovimientoCuota::class, 'movimiento_id')->orderBy('numero');
  }

  public function scopePendientes($q)
  {
    return $q->where('status', 'pendiente');
  }
}
