<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class HabitoLog extends Model
{
  protected $table = 'habito_log';

  protected $fillable = [
    'habito_id',
    'fecha',
    'valor',
    'cumplido',
    'porcentaje',
    'tarea_id',
  ];

  protected $casts = [
    'fecha'      => 'date',
    'valor'      => 'decimal:2',
    'cumplido'   => 'boolean',
    'porcentaje' => 'decimal:2',
  ];

  public function habito()
  {
    return $this->belongsTo(Habito::class, 'habito_id');
  }

  public function tarea()
  {
    return $this->belongsTo(Tarea::class, 'tarea_id');
  }
}
