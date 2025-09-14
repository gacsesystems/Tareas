<?php

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use App\Models\Concerns\HasArchivos;
use App\Models\Concerns\HasRecursos;
use App\Models\Concerns\HasEtiquetas;

class Tarea extends Model
{
  use SoftDeletes, HasArchivos, HasRecursos, HasEtiquetas;

  protected $fillable = [
    'proyecto_id',
    'proyecto_etapa_id',
    'titulo',
    'detalle_md',
    'estado',
    'fecha',
    'fecha_limite',
    'seguimiento_proximo',
    'responsable_id',
    'tipo',
    'area_id',
    'contexto_id',
    'moscow',
    'horizon',
    'eisen_importante',
    'eisen_urgente',
    'impacto',
    'valor',
    'eficiencia',
    'stakeholders',
    'urgencia_manual',
    'kash',
    'family_friendly',
    'is_rock',
    'frog',
    'frog_date',
    'pomos_estimados',
    'pomos_realizados',
    'tiempo_total_min',
    'score',
    'ranking',
    'pareto',
    'bloqueada',
    'bloqueo_motivo',
    'score_boost_until',
    'score_boost_factor',
    'riesgo_oportunidad',
    'habito_id',
    'dificultad',
    'kaizen',
    'delegation_level_rec',
    'delegation_level_applied',
    'skill_override',
    'will_override',
    'sla_fecha',
    'ultimo_movimiento_at',
    'escalado',
    'interest_hits',
    'interest_last_at',
  ];

  protected $casts = [
    'fecha'               => 'datetime',
    'fecha_limite'        => 'datetime',
    'seguimiento_proximo' => 'date',
    'frog_date'           => 'date',
    'score'               => 'decimal:4',
    'eisen_importante'    => 'boolean',
    'eisen_urgente'       => 'boolean',
    'family_friendly'     => 'boolean',
    'is_rock'             => 'boolean',
    'frog'                => 'boolean',
    'pareto'              => 'boolean',
    'bloqueada'           => 'boolean',
    'score_boost_until'   => 'datetime',
    'kaizen'              => 'boolean',
    'escalado'            => 'boolean',
    'interest_hits'       => 'integer',
    'riesgo_oportunidad'  => 'decimal:2',
    'eficiencia'       => 'int',
    'stakeholders'     => 'int',
    'urgencia_manual'  => 'int',
    'pomos_estimados'  => 'int',
    'ranking'          => 'int',
  ];

  /* =========================
     | Relaciones
     ==========================*/
  public function proyecto()
  {
    return $this->belongsTo(Proyecto::class);
  }
  public function etapa()
  {
    return $this->belongsTo(ProyectoEtapa::class, 'proyecto_etapa_id');
  }
  public function responsable()
  {
    return $this->belongsTo(Persona::class, 'responsable_id');
  }
  public function area()
  {
    return $this->belongsTo(Area::class);
  }
  public function contexto()
  {
    return $this->belongsTo(Contexto::class);
  }
  public function habito()
  {
    return $this->belongsTo(Habito::class, 'habito_id');
  }

  public function sesionesTrabajo()
  {
    return $this->hasMany(SesionTrabajo::class, 'tarea_id');
  }
  public function eventos()
  {
    return $this->hasMany(Evento::class, 'tarea_id');
  }

  /* =========================
     | Scopes
     ==========================*/
  public function scopeOrdenHoy(Builder $q): Builder
  {
    return $q->whereIn('estado', ['hoy', 'en_curso', 'siguiente'])
      ->where('bloqueada', false)
      ->orderByDesc('frog')
      ->orderByDesc('is_rock')
      ->orderBy('ranking')
      ->orderByDesc('score');
  }

  public function scopeFiltro(Builder $q, array $f = []): Builder
  {
    return $q
      ->when(isset($f['estado']), fn($qq) => $qq->where('estado', $f['estado']))
      ->when(isset($f['proyecto_id']), fn($qq) => $qq->where('proyecto_id', $f['proyecto_id']))
      ->when(isset($f['responsable_id']), fn($qq) => $qq->where('responsable_id', $f['responsable_id']))
      ->when(isset($f['area_id']), fn($qq) => $qq->where('area_id', $f['area_id']))
      ->when(isset($f['contexto_id']), fn($qq) => $qq->where('contexto_id', $f['contexto_id']));
  }

  /* =========================
     | Accesores derivados
     ==========================*/
  public function cuadranteEisenhower(): Attribute
  {
    return Attribute::get(function () {
      $i = (bool)$this->eisen_importante;
      $u = (bool)$this->eisen_urgente;
      return match (true) {
        $i && $u => 'Q1',
        $i && !$u => 'Q2',
        !$i && $u => 'Q3',
        default => 'Q4',
      };
    });
  }

  public function urgenciaDerivada(): Attribute
  {
    return Attribute::get(function () {
      if ($this->urgencia_manual !== null) return (int)$this->urgencia_manual;

      if (!$this->fecha_limite) return 3; // sin due-date: baja urgencia por defecto

      $hoy = Carbon::today();
      $dias = $hoy->diffInDays($this->fecha_limite, false); // negativo si vencida
      // Mapear días a escala 0..10 (más cerca => más alto)
      if ($dias <= 0) return 10;       // vencida/hoy
      if ($dias <= 1) return 9;
      if ($dias <= 2) return 8;
      if ($dias <= 3) return 7;
      if ($dias <= 5) return 6;
      if ($dias <= 7) return 5;
      if ($dias <= 14) return 4;
      if ($dias <= 30) return 3;
      return 2;
    });
  }

  public function mcdaBase(): Attribute
  {
    return Attribute::get(function () {
      // sliders 0..10 (null -> 0)
      $impacto     = (int)($this->impacto     ?? 0);
      $valor       = (int)($this->valor       ?? 0);
      $urgencia    = (int)($this->urgenciaDerivada ?? 0);
      $eficiencia  = (int)($this->eficiencia  ?? 0);
      $stake       = (int)($this->stakeholders ?? 0);

      // 0..10 => 0..100
      $score = 0.30 * $impacto + 0.25 * $valor + 0.20 * $urgencia + 0.15 * $eficiencia + 0.10 * $stake;
      return round($score * 10, 2); // 0..100
    });
  }

  public function boostActivo(): Attribute
  {
    return Attribute::get(function () {
      return $this->score_boost_until && now()->lessThan($this->score_boost_until)
        ? max(1.0, (float)($this->score_boost_factor ?? 1.0))
        : 1.0;
    });
  }

  public function interesMultiplier(): Attribute
  {
    return Attribute::get(function () {
      $hits = max(0, (int)$this->interest_hits);
      return 1 + min($hits * 0.02, 0.20); // hasta +20%
    });
  }

  public function decayMultiplier(): Attribute
  {
    return Attribute::get(function () {
      // “Tareas antiguas pierden 3% por día” desde 7 días de antigüedad
      $dias = $this->fecha ? Carbon::parse($this->fecha)->diffInDays(now()) : 0;
      $dias = max(0, $dias - 7); // tolerancia de 7 días
      $factor = 1 - ($dias * 0.03);
      return max(0.40, $factor); // piso 0.40
    });
  }

  /* =========================
     | Cálculo de Score Final
     ==========================*/
  public function calcularScore(): float
  {
    // Base MCDA (0..100)
    $base = (float)$this->mcdaBase;

    // Bonus visuales/estratégicos
    $mult = 1.0;
    if ($this->is_rock)          $mult *= 1.15; // roca semanal
    if ($this->frog)             $mult *= 1.20; // frog del día
    if ($this->pareto)           $mult *= 1.10; // top 20% del proyecto
    if ($this->family_friendly)  $mult *= 1.25; // apta con familia
    if (in_array($this->kash, ['S', 'H'])) $mult *= 1.10; // enfoque skill/habit
    if ($this->kaizen)           $mult *= 1.05;

    // Interés, Boost, Decay y Riesgo/Oportunidad
    $mult *= (float)$this->interesMultiplier;
    $mult *= (float)$this->boostActivo;
    $mult *= (float)$this->decayMultiplier;

    if (!is_null($this->riesgo_oportunidad)) {
      $ro = (float)$this->riesgo_oportunidad; // -0.20 .. +0.20
      $mult *= (1 + $ro);
    }

    // Si está bloqueada, el score cae fuerte
    if ($this->bloqueada) $mult *= 0.20;

    $final = round($base * $mult, 4);

    // Guardar cache local (opcional; puedes mover esto a Observer)
    $this->score = $final;

    return (float)$final;
  }
}
