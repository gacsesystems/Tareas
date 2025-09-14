<?php

namespace App\Http\Controllers;

use App\Http\Requests\ContextoRequest;
use App\Models\Contexto;
use Inertia\Inertia;

class ContextoController extends Controller
{
  public function index()
  {
    return Inertia::render('Catalogos/Contextos', [
      'contextos' => Contexto::orderBy('nombre')->get(),
    ]);
  }

  public function store(ContextoRequest $request)
  {
    Contexto::create($request->validated());
    return back()->with('ok', 'Contexto creado');
  }

  public function update(ContextoRequest $request, Contexto $contexto)
  {
    $contexto->update($request->validated());
    return back()->with('ok', 'Contexto actualizado');
  }

  public function destroy(Contexto $contexto)
  {
    $contexto->delete();
    return back()->with('ok', 'Contexto eliminado');
  }
}
