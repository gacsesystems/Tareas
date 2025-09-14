<?php

namespace App\Http\Controllers;

use App\Models\Tarea;
use App\Models\Area;
use App\Models\Contexto;
use Inertia\Inertia;

class PrincipalController extends Controller
{
  public function __invoke()
  {
    $tasksToday = Tarea::query()->where('estado', 'hoy')->orderByDesc('score')->get()->map(fn($t) => [
      'id'                  => $t->id,
      'titulo'              => $t->titulo,
      'estado'              => $t->estado,
      'detalle_md'          => $t->detalle_md,
      'pomos_estimados'     => $t->pomos_estimados,
      'pomos_realizados'    => $t->pomos_realizados ?? 0,
      'score'               => $t->score ?? 0,
      'quadrant'            => $t->quadrant ?? null,
      'moscow'              => $t->moscow,
      'horizon'             => $t->horizon,
      'kash'                => $t->kash,
      'is_rock'             => (bool) $t->is_rock,
      'frog'                => (bool) $t->frog,
      'bloqueada'           => (bool) $t->bloqueada,
      'bloqueo_motivo'      => $t->bloqueo_motivo,
      'family_friendly'     => (bool) $t->family_friendly,
      'pareto'              => (bool) $t->pareto,
      'riesgo_oportunidad'  => (float) ($t->riesgo_oportunidad ?? 0),
      'score_boost_until'   => $t->score_boost_until,
      'proyecto_id'         => $t->proyecto_id, // si tienes relación puedes mapear nombre
      'seguimiento_proximo' => $t->seguimiento_proximo,
      'completed'           => (bool) $t->completed, // si usas flag separado
    ]);

    return Inertia::render('Principal', [
      'tasksToday'   => $tasksToday,
      'capacidadDia' => 480,
      'areas' => Area::select('id', 'nombre')->orderBy('nombre')->get(),
      'contextos' => Contexto::select('id', 'nombre')->orderBy('nombre')->get(),
    ]);
  }
}
