<?php

namespace App\Http\Controllers;

use App\Http\Requests\TipoEventoRequest;
use App\Models\TipoEvento;
use Inertia\Inertia;

class TipoEventoController extends Controller
{
  public function index()
  {
    return Inertia::render('Catalogos/TipoEvento/Index', [
      'items' => TipoEvento::orderBy('nombre')->get(),
    ]);
  }

  public function store(TipoEventoRequest $request)
  {
    TipoEvento::create($request->validated());
    return back()->with('ok', 'Tipo de evento creado');
  }

  public function update(TipoEventoRequest $request, TipoEvento $tipo_evento)
  {
    $tipo_evento->update($request->validated());
    return back()->with('ok', 'Tipo de evento actualizado');
  }

  public function destroy(TipoEvento $tipo_evento)
  {
    $tipo_evento->delete();
    return back()->with('ok', 'Tipo de evento eliminado');
  }
}
