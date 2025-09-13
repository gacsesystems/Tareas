<?php

namespace App\Http\Controllers;

use App\Http\Requests\PersonaRequest;
use App\Models\Persona;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PersonaController extends Controller
{
  public function index(Request $request)
  {
    $q = Persona::query()->orderBy('nombre');
    if ($request->boolean('solo_activos', true)) $q->where('activo', true);

    return Inertia::render('Personas/Index', [
      'items' => $q->paginate(30)->withQueryString(),
    ]);
  }

  public function create()
  {
    return Inertia::render('Personas/Edit');
  }
  public function edit(Persona $persona)
  {
    return Inertia::render('Personas/Edit', ['item' => $persona]);
  }

  public function store(PersonaRequest $request)
  {
    $persona = Persona::create($request->validated());
    return redirect()->route('personas.edit', $persona)->with('ok', 'Persona creada');
  }

  public function update(PersonaRequest $request, Persona $persona)
  {
    $persona->update($request->validated());
    return back()->with('ok', 'Persona actualizada');
  }

  public function destroy(Persona $persona)
  {
    $persona->delete();
    return redirect()->route('personas.index')->with('ok', 'Persona eliminada');
  }
}
