<?php

namespace App\Http\Controllers;

use App\Http\Requests\EtiquetaRequest;
use App\Models\Etiqueta;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class EtiquetaController extends Controller
{
  public function index()
  {
    return Inertia::render('Catalogos/Etiquetas/Index', [
      'items' => Etiqueta::orderBy('categoria')->orderBy('nombre')->get(),
    ]);
  }

  public function store(EtiquetaRequest $request)
  {
    Etiqueta::create($request->validated());
    return back()->with('ok', 'Etiqueta creada');
  }

  public function update(EtiquetaRequest $request, Etiqueta $etiqueta)
  {
    $etiqueta->update($request->validated());
    return back()->with('ok', 'Etiqueta actualizada');
  }

  public function destroy(Etiqueta $etiqueta)
  {
    $etiqueta->delete();
    return back()->with('ok', 'Etiqueta eliminada');
  }

  /** Attach polimórfico a cualquier modelo */
  public function attach(Request $request, Etiqueta $etiqueta)
  {
    $data = $request->validate([
      'type' => ['required', 'string', 'max:120'], // e.g. "App\\Models\\Tarea"
      'id'   => ['required', 'integer'],
    ]);

    $model = $this->resolveMorph($data['type'], (int)$data['id']);

    // Enforce máx 5 etiquetas por elemento (por DB y UX)
    $count = DB::table('etiquetables')->where([
      'taggable_id'   => $model->getKey(),
      'taggable_type' => get_class($model),
    ])->count();

    if ($count >= 5) abort(422, 'Máximo 5 etiquetas por elemento');

    DB::table('etiquetables')->updateOrInsert([
      'etiqueta_id'   => $etiqueta->id,
      'taggable_id'   => $model->getKey(),
      'taggable_type' => get_class($model),
    ], []); // PK compuesta evita duplicado

    return back()->with('ok', 'Etiqueta agregada');
  }

  public function detach(Request $request, Etiqueta $etiqueta)
  {
    $data = $request->validate([
      'type' => ['required', 'string', 'max:120'],
      'id'   => ['required', 'integer'],
    ]);

    $model = $this->resolveMorph($data['type'], (int)$data['id']);

    DB::table('etiquetables')->where([
      'etiqueta_id'   => $etiqueta->id,
      'taggable_id'   => $model->getKey(),
      'taggable_type' => get_class($model),
    ])->delete();

    return back()->with('ok', 'Etiqueta removida');
  }

  private function resolveMorph(string $type, int $id)
  {
    if (!class_exists($type)) abort(422, 'Tipo inválido');
    $model = (new $type)->find($id);
    if (!$model) abort(404, 'Destino no encontrado');
    return $model;
  }
}
