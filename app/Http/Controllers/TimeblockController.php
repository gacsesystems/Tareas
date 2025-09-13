<?php

namespace App\Http\Controllers;

use App\Http\Requests\TimeblockRequest;
use App\Models\Timeblock;
use Illuminate\Http\Request;
use Inertia\Inertia;

class TimeblockController extends Controller
{
  public function index(Request $request)
  {
    $q = Timeblock::with('evento:id,titulo,fecha_inicio');
    if ($request->filled('fecha')) $q->where('fecha', $request->date('fecha'));
    return Inertia::render('Timeblocks/Index', ['items' => $q->orderBy('fecha')->orderBy('hora_inicio')->get()]);
  }

  public function store(TimeblockRequest $request)
  {
    Timeblock::create($request->validated());
    return back()->with('ok', 'Bloque creado');
  }

  public function update(TimeblockRequest $request, Timeblock $timeblock)
  {
    $timeblock->update($request->validated());
    return back()->with('ok', 'Bloque actualizado');
  }

  public function destroy(Timeblock $timeblock)
  {
    $timeblock->delete();
    return back()->with('ok', 'Bloque eliminado');
  }
}
