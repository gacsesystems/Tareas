<?php

namespace App\Http\Controllers;

use App\Http\Requests\CategoriaFinRequest;
use App\Models\CategoriaFin;
use Inertia\Inertia;

class CategoriaFinController extends Controller
{
  public function index()
  {
    return Inertia::render('Finanzas/Categorias/Index', [
      'items' => CategoriaFin::with('children')->whereNull('parent_id')->orderBy('orden')->get(),
    ]);
  }

  public function store(CategoriaFinRequest $request)
  {
    CategoriaFin::create($request->validated());
    return back()->with('ok', 'Categoría creada');
  }

  public function update(CategoriaFinRequest $request, CategoriaFin $categoria_fi)
  {
    $categoria_fi->update($request->validated());
    return back()->with('ok', 'Categoría actualizada');
  }

  public function destroy(CategoriaFin $categoria_fi)
  {
    $categoria_fi->delete();
    return back()->with('ok', 'Categoría eliminada');
  }
}
