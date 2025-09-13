<?php

namespace App\Http\Controllers;

use App\Http\Requests\MovtoRecurrenteRequest;
use App\Models\MovtoRecurrente;
use Inertia\Inertia;

class MovtoRecurrenteController extends Controller
{
  public function index()
  {
    return Inertia::render('Finanzas/Recurrentes/Index', [
      'items' => MovtoRecurrente::with(['cuenta:id,nombre', 'categoria:id,nombre'])
        ->orderBy('activo', 'desc')->orderBy('next_run')->get(),
    ]);
  }

  public function store(MovtoRecurrenteRequest $request)
  {
    MovtoRecurrente::create($request->validated());
    return back()->with('ok', 'Recurrente creado');
  }

  public function update(MovtoRecurrenteRequest $request, MovtoRecurrente $movto_recurrente)
  {
    $movto_recurrente->update($request->validated());
    return back()->with('ok', 'Recurrente actualizado');
  }

  public function destroy(MovtoRecurrente $movto_recurrente)
  {
    $movto_recurrente->delete();
    return back()->with('ok', 'Recurrente eliminado');
  }
}
