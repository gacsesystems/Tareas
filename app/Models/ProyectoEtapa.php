<?php

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Model;

class ProyectoEtapa extends Model
{
  protected $table = 'proyecto_etapas';

  protected $fillable = [
    'proyecto_id',
    'nombre',
    'orden',
    'fecha_inicio_plan',
    'fecha_fin_plan',
    'fecha_inicio_real',
    'fecha_fin_real',
    'progreso_pct',
    'done',
  ];

  protected $casts = [
    'fecha_inicio_plan' => 'date',
    'fecha_fin_plan'    => 'date',
    'fecha_inicio_real' => 'date',
    'fecha_fin_real'    => 'date',
    'progreso_pct'      => 'decimal:2',
    'done'              => 'boolean',
  ];

  public function proyecto()
  {
    return $this->belongsTo(Proyecto::class);
  }

  /** Marcar done y setear fecha_fin_real si no existe */
  public function completar(): void
  {
    $this->done = true;
    if (!$this->fecha_fin_real) {
      $this->fecha_fin_real = Carbon::now()->toDateString();
    }
  }
}
