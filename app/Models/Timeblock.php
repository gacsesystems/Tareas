<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Timeblock extends Model
{
  protected $fillable = [
    'fecha',
    'hora_inicio',
    'hora_fin',
    'categoria',
    'descripcion',
    'disponible',
    'capacidad_min',
    'parkinson_enforce',
    'parkinson_max_min',
    'evento_id',
  ];

  protected $casts = [
    'fecha'             => 'date',
    'hora_inicio'       => 'datetime:H:i',
    'hora_fin'          => 'datetime:H:i',
    'disponible'        => 'boolean',
    'capacidad_min'     => 'integer',
    'parkinson_enforce' => 'boolean',
    'parkinson_max_min' => 'integer',
  ];

  public function evento()
  {
    return $this->belongsTo(Evento::class);
  }

  // Helpers
  public function getDuracionMinAttribute(): int
  {
    $inicio = strtotime($this->fecha . ' ' . $this->hora_inicio);
    $fin    = strtotime($this->fecha . ' ' . $this->hora_fin);
    return max(0, (int) round(($fin - $inicio) / 60));
  }
}
