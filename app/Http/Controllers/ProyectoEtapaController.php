<?php

namespace App\Http\Controllers;

use App\Http\Requests\ProyectoEtapaRequest;
use App\Models\Proyecto;
use App\Models\ProyectoEtapa;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class ProyectoEtapaController extends Controller
{
  public function index(Proyecto $proyecto)
  {
    $proyecto->load(['etapas' => fn($q) => $q->orderBy('orden')]);
    return Inertia::render('Projects/Etapas/Index', [
      'proyecto' => $proyecto,
      'etapas'   => $proyecto->etapas,
    ]);
  }

  public function store(ProyectoEtapaRequest $request)
  {
    $etapa = DB::transaction(function () use ($request) {
      $etapa = ProyectoEtapa::create($request->validated());

      // Recalcular progreso del proyecto
      $p = $etapa->proyecto;
      $p->calcularProgreso();
      $p->cerrarSiCorresponde();
      $p->save();

      return $etapa;
    });

    return redirect()
      ->route('proyectos.edit', $etapa->proyecto_id)
      ->with('ok', 'Etapa creada');
  }

  public function edit(ProyectoEtapa $proyectoEtapa)
  {
    return Inertia::render('Projects/Etapas/Edit', [
      'etapa' => $proyectoEtapa->load('proyecto:id,nombre'),
    ]);
  }

  public function update(ProyectoEtapaRequest $request, ProyectoEtapa $proyectoEtapa)
  {
    DB::transaction(function () use ($request, $proyectoEtapa) {
      $proyectoEtapa->fill($request->validated());

      // Si marca done y no hay fecha_fin_real, fijarla hoy
      if ($proyectoEtapa->done && !$proyectoEtapa->fecha_fin_real) {
        $proyectoEtapa->completar();
      }

      $proyectoEtapa->save();

      // Recalcular progreso del proyecto
      $p = $proyectoEtapa->proyecto;
      $p->calcularProgreso();
      $p->cerrarSiCorresponde();
      $p->save();
    });

    return back()->with('ok', 'Etapa actualizada');
  }

  public function destroy(ProyectoEtapa $proyectoEtapa)
  {
    $pid = $proyectoEtapa->proyecto_id;

    DB::transaction(function () use ($proyectoEtapa) {
      $p = $proyectoEtapa->proyecto;
      $proyectoEtapa->delete();

      $p->calcularProgreso();
      $p->cerrarSiCorresponde();
      $p->save();
    });

    return redirect()->route('proyectos.edit', $pid)->with('ok', 'Etapa eliminada');
  }

  /** Reordenar múltiples etapas (drag & drop) */
  public function sort(Request $request, Proyecto $proyecto)
  {
    $data = $request->validate([
      'orden' => ['required', 'array'],
      'orden.*.id'    => ['required', 'exists:proyecto_etapas,id'],
      'orden.*.orden' => ['required', 'integer'],
    ]);

    DB::transaction(function () use ($data, $proyecto) {
      foreach ($data['orden'] as $row) {
        ProyectoEtapa::where('id', $row['id'])
          ->where('proyecto_id', $proyecto->id)
          ->update(['orden' => $row['orden']]);
      }
    });

    return back()->with('ok', 'Orden actualizado');
  }

  /** Toggle done rápido */
  public function toggleDone(ProyectoEtapa $proyectoEtapa)
  {
    DB::transaction(function () use ($proyectoEtapa) {
      $proyectoEtapa->done = !$proyectoEtapa->done;
      if ($proyectoEtapa->done) $proyectoEtapa->completar();
      $proyectoEtapa->save();

      $p = $proyectoEtapa->proyecto;
      $p->calcularProgreso();
      $p->cerrarSiCorresponde();
      $p->save();
    });

    return back();
  }
}
