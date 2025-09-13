<?php

namespace App\Http\Controllers;

use App\Http\Requests\EntradaDiarioRequest;
use App\Models\EntradaDiario;
use Illuminate\Http\Request;
use Inertia\Inertia;

class EntradaDiarioController extends Controller
{
  public function index(Request $request)
  {
    $q = EntradaDiario::orderByDesc('momento');
    if ($request->filled('fecha')) $q->where('fecha', $request->date('fecha'));
    return Inertia::render('Diario/Index', ['items' => $q->paginate(30)->withQueryString()]);
  }

  public function store(EntradaDiarioRequest $request)
  {
    $e = EntradaDiario::create($request->validated() + ['momento' => now()]);
    return redirect()->route('diario.edit', $e)->with('ok', 'Entrada creada');
  }

  public function edit(EntradaDiario $diario)
  {
    return Inertia::render('Diario/Edit', ['item' => $diario]);
  }

  public function update(EntradaDiarioRequest $request, EntradaDiario $diario)
  {
    $diario->update($request->validated());
    return back()->with('ok', 'Entrada actualizada');
  }

  public function destroy(EntradaDiario $diario)
  {
    $diario->delete();
    return redirect()->route('diario.index')->with('ok', 'Entrada eliminada');
  }
}
