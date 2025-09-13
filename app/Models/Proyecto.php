<?php

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use App\Models\Concerns\HasArchivos;
use App\Models\Concerns\HasRecursos;
use App\Models\Concerns\HasEtiquetas;

class Proyecto extends Model
{
  use HasArchivos, HasRecursos, HasEtiquetas;

  protected $fillable = [
    'nombre',
    'descripcion',
    'area_id',
    'status',
    'prioridad',
    'estrategico',
    'fec_inicio_plan',
    'fec_fin_plan',
    'fec_inicio_real',
    'fec_fin_real',
    'criterio_cierre',
    'objetivo_principal',
    'proxima_accion_tarea_id',
    'proxima_accion_modo',
    'proxima_accion_updated_at',
    'owner_id',
    'delegation_level_applied',
    'interest_hits',
    'interest_last_at',
    'progreso_pct',
    'notas_md',
  ];

  protected $casts = [
    'estrategico'               => 'boolean',
    'fec_inicio_plan'           => 'date',
    'fec_fin_plan'              => 'date',
    'fec_inicio_real'           => 'date',
    'fec_fin_real'              => 'date',
    'proxima_accion_updated_at' => 'datetime',
    'interest_last_at'          => 'datetime',
    'progreso_pct'              => 'decimal:2',
  ];

  /* =========================
     | Relaciones
     ==========================*/
  public function area()
  {
    return $this->belongsTo(Area::class);
  }
  public function owner()
  {
    return $this->belongsTo(Persona::class, 'owner_id');
  }

  public function etapas()
  {
    return $this->hasMany(ProyectoEtapa::class, 'proyecto_id')->orderBy('orden');
  }
  public function objetivos()
  {
    return $this->hasMany(ProyectoObjetivo::class, 'proyecto_id')->orderBy('orden');
  }
  public function tareas()
  {
    return $this->hasMany(Tarea::class, 'proyecto_id');
  }

  public function proximaAccionTarea()
  {
    return $this->belongsTo(Tarea::class, 'proxima_accion_tarea_id');
  }

  /* =========================
     | Scopes
     ==========================*/
  public function scopeAbiertos(Builder $q): Builder
  {
    return $q->where('status', 'abierto');
  }

  public function scopeOrdenDashboard(Builder $q): Builder
  {
    return $q->orderByDesc('estrategico')
      ->orderByRaw("FIELD(prioridad,'alta','media','baja')")
      ->orderBy('nombre');
  }

  /* =========================
     | Lógica: Progreso
     ==========================*/
  public function calcularProgreso(): float
  {
    $pct = null;

    // 1) Si hay etapas con progreso explícito, prom. ponderado simple por duración plan (o promedio simple si no hay fechas)
    if ($this->etapas()->exists()) {
      $etapas = $this->etapas()->get(['progreso_pct', 'fecha_inicio_plan', 'fecha_fin_plan', 'done']);
      $total = 0;
      $peso = 0;

      foreach ($etapas as $e) {
        $p = is_null($e->progreso_pct) ? ($e->done ? 100 : 0) : (float)$e->progreso_pct;

        // peso por días plan si existe, si no peso 1
        $w = 1;
        if ($e->fecha_inicio_plan && $e->fecha_fin_plan) {
          $w = max(1, Carbon::parse($e->fecha_inicio_plan)->diffInDays(Carbon::parse($e->fecha_fin_plan)) + 1);
        }

        $total += $p * $w;
        $peso  += $w;
      }
      if ($peso > 0) $pct = round($total / $peso, 2);
    }

    // 2) Si no hay etapas o no definieron progreso, usar criterio del proyecto
    if (is_null($pct)) {
      if ($this->criterio_cierre === 'objetivos' && $this->objetivos()->exists()) {
        $total = $this->objetivos()->count();
        $done  = $this->objetivos()->where('cumplido', true)->count();
        $pct   = $total > 0 ? round($done * 100.0 / $total, 2) : 0.0;
      } else {
        // por tareas: hechas / (tareas vivas)
        $q = $this->tareas()->whereNull('deleted_at');
        $total = (clone $q)->count();
        $done  = (clone $q)->where('estado', 'hecha')->count();
        $pct   = $total > 0 ? round($done * 100.0 / $total, 2) : 0.0;
      }
    }

    $this->progreso_pct = $pct;
    return (float)$pct;
  }

  /* =========================
     | Lógica: Próxima Acción
     ==========================*/
  public function actualizarProximaAccionAuto(): void
  {
    // Si modo MANUAL, no tocar
    if ($this->proxima_accion_modo === 'manual') return;

    // Elegir mejor candidata:
    $t = $this->tareas()
      ->whereNull('deleted_at')
      ->whereIn('estado', ['siguiente', 'hoy', 'en_curso'])
      ->where('bloqueada', false)
      ->orderByDesc('frog')
      ->orderByDesc('is_rock')
      ->orderBy('ranking')     // ranking menor = más arriba
      ->orderByDesc('score')
      ->first();

    $this->proxima_accion_tarea_id = $t?->id;
    $this->proxima_accion_updated_at = now();
  }

  public function cerrarSiCorresponde(): void
  {
    // Si todas las etapas están done, o progreso = 100 → cerrar
    if ($this->etapas()->exists()) {
      $allDone = $this->etapas()->where('done', false)->count() === 0;
      if ($allDone) {
        $this->status = 'cerrado';
        $this->fec_fin_real = $this->fec_fin_real ?: now()->toDateString();
      }
    } elseif ((float)($this->progreso_pct ?? 0) >= 100.0) {
      $this->status = 'cerrado';
      $this->fec_fin_real = $this->fec_fin_real ?: now()->toDateString();
    }
  }
}
