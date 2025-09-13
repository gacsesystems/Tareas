<?php

namespace App\Http\Controllers;

use App\Http\Requests\CuentaRequest;
use App\Models\Cuenta;
use Inertia\Inertia;

class CuentaController extends Controller
{
  public function index()
  {
    return Inertia::render('Finanzas/Cuentas/Index', [
      'items' => Cuenta::orderBy('activa', 'desc')->orderBy('nombre')->get(),
    ]);
  }

  public function store(CuentaRequest $request)
  {
    Cuenta::create($request->validated());
    return back()->with('ok', 'Cuenta creada');
  }

  public function update(CuentaRequest $request, Cuenta $cuenta)
  {
    $cuenta->update($request->validated());
    return back()->with('ok', 'Cuenta actualizada');
  }

  public function destroy(Cuenta $cuenta)
  {
    $cuenta->delete();
    return back()->with('ok', 'Cuenta eliminada');
  }
}
