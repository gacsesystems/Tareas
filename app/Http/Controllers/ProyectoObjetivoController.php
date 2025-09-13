<?php

namespace App\Http\Controllers;

use App\Http\Requests\ProyectoObjetivoRequest;
use App\Models\Proyecto;
use App\Models\ProyectoObjetivo;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class ProyectoObjetivoController extends Controller
{
  // Tip: normalmente se renderiza dentro del detalle de Proyecto
  public function index(Proyecto $proyecto)
  {
    return Inertia::render('Proyectos/Objetivos/Index', [
      'proyecto'  => $proyecto->only(['id', 'nombre']),
      'objetivos' => $proyecto->objetivos()->ordered()->get(),
    ]);
  }

  public function store(ProyectoObjetivoRequest $request)
  {
    $data = $request->validated();
    $objetivo = ProyectoObjetivo::create($data);

    return back()->with('ok', 'Objetivo creado')->with('created_id', $objetivo->id);
  }

  public function update(ProyectoObjetivoRequest $request, ProyectoObjetivo $objetivo)
  {
    $objetivo->fill($request->validated())->save();
    return back()->with('ok', 'Objetivo actualizado');
  }

  public function destroy(ProyectoObjetivo $objetivo)
  {
    $objetivo->delete();
    return back()->with('ok', 'Objetivo eliminado');
  }

  /** Toggle rápido de cumplido */
  public function toggleCumplido(ProyectoObjetivo $objetivo)
  {
    $objetivo->update(['cumplido' => ! $objetivo->cumplido]);
    return back()->with('ok', 'Estado actualizado');
  }

  /** Reordenar lista: recibe [{id, orden}, ...] */
  public function reorder(Request $request, Proyecto $proyecto)
  {
    $items = $request->validate([
      'items'   => ['required', 'array'],
      'items.*.id'    => ['required', 'integer', 'exists:proyecto_objetivos,id'],
      'items.*.orden' => ['required', 'integer'],
    ])['items'];

    DB::transaction(function () use ($items, $proyecto) {
      foreach ($items as $row) {
        ProyectoObjetivo::where('id', $row['id'])
          ->where('proyecto_id', $proyecto->id)
          ->update(['orden' => $row['orden']]);
      }
    });

    return back()->with('ok', 'Orden guardado');
  }
}
