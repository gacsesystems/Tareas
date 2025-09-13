<?php

namespace App\Http\Controllers;

use App\Http\Requests\AreaRequest;
use App\Models\Area;
use Inertia\Inertia;

class AreaController extends Controller
{
  public function index()
  {
    return Inertia::render('Catalogos/Areas/Index', [
      'items' => Area::orderBy('nombre')->get(),
    ]);
  }

  public function store(AreaRequest $request)
  {
    Area::create($request->validated());
    return back()->with('ok', 'Área creada');
  }

  public function update(AreaRequest $request, Area $area)
  {
    $area->update($request->validated());
    return back()->with('ok', 'Área actualizada');
  }

  public function destroy(Area $area)
  {
    $area->delete();
    return back()->with('ok', 'Área eliminada');
  }
}
