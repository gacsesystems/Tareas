<?php

namespace App\Http\Controllers;

use App\Http\Requests\SesionTrabajoRequest;
use App\Models\SesionTrabajo;
use App\Models\Tarea;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class SesionTrabajoController extends Controller
{
  public function index(Request $request)
  {
    $q = SesionTrabajo::with('tarea:id,titulo')
      ->orderByDesc('inicio');

    if ($request->filled('tarea_id')) {
      $q->where('tarea_id', $request->integer('tarea_id'));
    }

    return Inertia::render('Sesiones/Index', [
      'sesiones' => $q->paginate(30)->withQueryString(),
    ]);
  }

  /** Crear sesión (normalmente al presionar "Start") */
  public function store(SesionTrabajoRequest $request)
  {
    $data = $request->validated();
    $sesion = SesionTrabajo::create($data);

    return back()->with('ok', 'Sesión iniciada')->with('sesion_id', $sesion->id);
  }

  /** Cerrar/actualizar sesión (poner fin, mins, etc.) */
  public function update(SesionTrabajoRequest $request, SesionTrabajo $sesion)
  {
    DB::transaction(function () use ($sesion, $request) {
      $sesion->fill($request->validated())->save();

      // Side effects: sumar tiempo/pomos a Tarea si aplica
      if ($sesion->tarea_id && $sesion->tipo === 'trabajo' && $sesion->fin && $sesion->foco_min > 0) {
        /** @var Tarea $tarea */
        $tarea = Tarea::find($sesion->tarea_id);
        if ($tarea) {
          // aumentar minutos reales
          $tarea->tiempo_total_min = (int)$tarea->tiempo_total_min + (int)$sesion->foco_min;

          // aumentar pomodoros estimativos (1 pomo cada 25 min redondeo floor)
          $tarea->pomos_realizados = (int)$tarea->pomos_realizados + intdiv((int)$sesion->foco_min, 25);

          $tarea->ultimo_movimiento_at = now();
          $tarea->save();
        }
      }
    });

    return back()->with('ok', 'Sesión actualizada');
  }

  public function destroy(SesionTrabajo $sesion)
  {
    $sesion->delete();
    return back()->with('ok', 'Sesión eliminada');
  }
}
