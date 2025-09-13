<?php

namespace App\Http\Controllers;

use App\Http\Requests\EventoRequest;
use App\Models\Evento;
use App\Models\Proyecto;
use App\Models\TipoEvento;
use Illuminate\Http\Request;
use Inertia\Inertia;

class EventoController extends Controller
{
  public function index(Request $request)
  {
    $range = $request->validate([
      'from' => ['nullable', 'date'],
      'to'   => ['nullable', 'date', 'after_or_equal:from'],
    ]);

    $q = Evento::with(['tipo:id,nombre,color', 'proyecto:id,nombre', 'tarea:id,titulo', 'persona:id,nombre'])
      ->orderBy('fecha_inicio');

    if ($range['from'] ?? null) $q->where('fecha_inicio', '>=', $range['from']);
    if ($range['to']   ?? null) $q->where('fecha_inicio', '<=', $range['to']);

    return Inertia::render('Calendar/Index', [
      'eventos'     => $q->paginate(50)->withQueryString(),
      'tipoEvento'  => TipoEvento::select('id', 'nombre', 'color')->orderBy('nombre')->get(),
      'proyectos'   => Proyecto::select('id', 'nombre')->orderBy('nombre')->get(),
    ]);
  }

  public function create()
  {
    return Inertia::render('Calendar/Edit', [
      'evento'      => null,
      'tipoEvento'  => TipoEvento::select('id', 'nombre', 'color')->orderBy('nombre')->get(),
    ]);
  }

  public function store(EventoRequest $request)
  {
    $e = Evento::create($request->validated());
    return redirect()->route('eventos.edit', $e)->with('ok', 'Evento creado');
  }

  public function edit(Evento $evento)
  {
    return Inertia::render('Calendar/Edit', [
      'evento'     => $evento->load(['tipo', 'proyecto:id,nombre', 'tarea:id,titulo', 'persona:id,nombre']),
      'tipoEvento' => TipoEvento::select('id', 'nombre', 'color')->orderBy('nombre')->get(),
    ]);
  }

  public function update(EventoRequest $request, Evento $evento)
  {
    $evento->fill($request->validated())->save();
    return back()->with('ok', 'Evento actualizado');
  }

  public function destroy(Evento $evento)
  {
    $evento->delete();
    return redirect()->route('eventos.index')->with('ok', 'Evento eliminado');
  }
}
