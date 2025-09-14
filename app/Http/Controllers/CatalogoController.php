<?php

namespace App\Http\Controllers;

use Inertia\Inertia;
use App\Models\Area;
use App\Models\Contexto;

class CatalogoController extends Controller
{
  public function index()
  {
    return Inertia::render('Catalogos', [
      'areas'     => Area::select('id', 'nombre')->orderBy('nombre')->get(),
      'contextos' => Contexto::select('id', 'nombre')->orderBy('nombre')->get(),
    ]);
  }
}
