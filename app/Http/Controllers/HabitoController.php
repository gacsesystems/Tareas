<?php

namespace App\Http\Controllers;

use App\Http\Requests\HabitoRequest;
use App\Models\Habito;
use Inertia\Inertia;

class HabitoController extends Controller
{
  public function index()
  {
    $habitos = Habito::orderByDesc('activo')->orderByDesc('peso')->orderBy('nombre')->paginate(30);
    return Inertia::render('Habitos/Index', ['habitos' => $habitos]);
  }

  public function create()
  {
    return Inertia::render('Habitos/Edit', ['habito' => null]);
  }

  public function store(HabitoRequest $request)
  {
    $h = Habito::create($request->validated());
    return redirect()->route('habitos.edit', $h)->with('ok', 'Hábito creado');
  }

  public function edit(Habito $habito)
  {
    return Inertia::render('Habitos/Edit', [
      'habito' => $habito->load(['logs' => fn($q) => $q->limit(30)]),
    ]);
  }

  public function update(HabitoRequest $request, Habito $habito)
  {
    $habito->fill($request->validated())->save();
    return back()->with('ok', 'Hábito actualizado');
  }

  public function destroy(Habito $habito)
  {
    $habito->delete();
    return redirect()->route('habitos.index')->with('ok', 'Hábito eliminado');
  }
}
