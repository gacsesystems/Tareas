<?php

namespace App\Http\Controllers;

use App\Http\Requests\RutinaRequest;
use App\Models\Rutina;
use Inertia\Inertia;

class RutinaController extends Controller
{
  public function index()
  {
    $rutinas = Rutina::withCount('items')->orderByDesc('activo')->orderBy('nombre')->paginate(30);
    return Inertia::render('Rutinas/Index', ['rutinas' => $rutinas]);
  }

  public function create()
  {
    return Inertia::render('Rutinas/Edit', ['rutina' => null]);
  }

  public function store(RutinaRequest $request)
  {
    $r = Rutina::create($request->validated());
    return redirect()->route('rutinas.edit', $r)->with('ok', 'Rutina creada');
  }

  public function edit(Rutina $rutina)
  {
    return Inertia::render('Rutinas/Edit', [
      'rutina' => $rutina->load('items'),
    ]);
  }

  public function update(RutinaRequest $request, Rutina $rutina)
  {
    $rutina->fill($request->validated())->save();
    return back()->with('ok', 'Rutina actualizada');
  }

  public function destroy(Rutina $rutina)
  {
    $rutina->delete();
    return redirect()->route('rutinas.index')->with('ok', 'Rutina eliminada');
  }
}
