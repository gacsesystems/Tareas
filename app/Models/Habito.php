<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Habito extends Model
{
  protected $fillable = [
    'nombre',
    'tipo',
    'unidad',
    'meta',
    'umbral_cumplimiento',
    'periodicidad',
    'times_per_week',
    'dias_semana_bitmap',
    'min_dias_mes',
    'fecha_inicio',
    'activo',
    'peso',
    'streak',
    'mejor_streak',
    'freezes_restantes_mes',
    'comodines_restantes_mes',
    'task_template_id',
    'notas_md',
  ];

  protected $casts = [
    'meta'                  => 'decimal:2',
    'umbral_cumplimiento'   => 'decimal:2',
    'fecha_inicio'          => 'date',
    'activo'                => 'boolean',
    'peso'                  => 'integer',
    'streak'                => 'integer',
    'mejor_streak'          => 'integer',
    'freezes_restantes_mes' => 'integer',
    'comodines_restantes_mes' => 'integer',
  ];

  public function logs()
  {
    return $this->hasMany(HabitoLog::class, 'habito_id')->orderByDesc('fecha');
  }

  public function taskTemplate()
  {
    return $this->belongsTo(Tarea::class, 'task_template_id');
  }

  /** Evalúa si un valor cumple (para positivos: >=; para negativos: <=) y devuelve [cumplido, porcentaje] */
  public function evaluar(?float $valor): array
  {
    $isCuant = !is_null($this->unidad) && !is_null($this->meta);
    $umbral  = $this->umbral_cumplimiento;

    if (!$isCuant) {
      // binario → porcentaje 100 si checked
      return [(bool)$valor, (bool)$valor ? 100.0 : 0.0];
    }

    if ($this->tipo === 'negativo') {
      // éxito si valor <= (umbral || meta)
      $lim = $umbral ?? $this->meta;
      $cumplido = !is_null($valor) && $valor <= $lim;
      // porcentaje simple (mientras menor mejor); acótalo 0..100
      $pct = !is_null($valor) && $lim > 0 ? max(0, min(100, (1 - ($valor / $lim)) * 100)) : ($cumplido ? 100 : 0);
      return [$cumplido, round($pct, 2)];
    } else {
      // positivo: porcentaje = (valor/meta)*100
      $pct = !is_null($valor) && $this->meta > 0 ? min(100, ($valor / $this->meta) * 100) : 0;
      $req = $umbral ?? 100;
      $cumplido = $pct >= $req;
      return [$cumplido, round($pct, 2)];
    }
  }
}
