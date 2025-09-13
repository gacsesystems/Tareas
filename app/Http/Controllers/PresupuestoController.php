<?php

namespace App\Http\Controllers;

use App\Http\Requests\PresupuestoRequest;
use App\Models\Presupuesto;
use Inertia\Inertia;

class PresupuestoController extends Controller
{
  public function index()
  {
    return Inertia::render('Finanzas/Presupuestos/Index', [
      'items' => Presupuesto::with('categoria:id,nombre')->orderByDesc('anio')->orderByDesc('mes')->get(),
    ]);
  }

  public function store(PresupuestoRequest $request)
  {
    Presupuesto::create($request->validated());
    return back()->with('ok', 'Presupuesto creado');
  }

  public function update(PresupuestoRequest $request, Presupuesto $presupuesto)
  {
    $presupuesto->update($request->validated());
    return back()->with('ok', 'Presupuesto actualizado');
  }

  public function destroy(Presupuesto $presupuesto)
  {
    $presupuesto->delete();
    return back()->with('ok', 'Presupuesto eliminado');
  }
}
