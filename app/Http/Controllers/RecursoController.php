<?php

namespace App\Http\Controllers;

use App\Http\Requests\RecursoRequest;
use App\Models\Recurso;
use App\Models\Archivo;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class RecursoController extends Controller
{
  public function index(Request $request)
  {
    $q = Recurso::query()
      ->with(['archivo:id,filename', 'tarea:id,titulo'])
      ->orderByDesc('id');

    if ($request->filled('status'))    $q->where('status', $request->string('status'));
    if ($request->filled('prioridad')) $q->where('prioridad', $request->string('prioridad'));
    if ($request->filled('tipo'))      $q->where('tipo', $request->string('tipo'));

    return Inertia::render('Recursos/Index', [
      'recursos' => $q->paginate(30)->withQueryString(),
      'filters'  => $request->only('status', 'prioridad', 'tipo'),
    ]);
  }

  public function create()
  {
    return Inertia::render('Recursos/Edit', [
      'recurso'  => null,
      'archivos' => Archivo::select('id', 'filename')->orderByDesc('id')->limit(50)->get(),
    ]);
  }

  public function store(RecursoRequest $request)
  {
    $data = $request->validated();

    $recurso = DB::transaction(function () use ($data) {
      $r = Recurso::create($data);

      // Attach polimórfico opcional
      if (!empty($data['attach_type']) && !empty($data['attach_id'])) {
        $this->attachTo($r, $data['attach_type'], (int)$data['attach_id']);
      }

      return $r;
    });

    return redirect()->route('recursos.edit', $recurso)->with('ok', 'Recurso creado');
  }

  public function edit(Recurso $recurso)
  {
    return Inertia::render('Recursos/Edit', [
      'recurso'  => $recurso->load(['archivo:id,filename', 'tarea:id,titulo']),
      'archivos' => Archivo::select('id', 'filename')->orderByDesc('id')->limit(50)->get(),
    ]);
  }

  public function update(RecursoRequest $request, Recurso $recurso)
  {
    $data = $request->validated();

    DB::transaction(function () use ($recurso, $data) {
      $recurso->fill($data)->save();

      if (!empty($data['attach_type']) && !empty($data['attach_id'])) {
        $this->attachTo($recurso, $data['attach_type'], (int)$data['attach_id']);
      }
    });

    return back()->with('ok', 'Recurso actualizado');
  }

  public function destroy(Recurso $recurso)
  {
    $recurso->delete();
    return redirect()->route('recursos.index')->with('ok', 'Recurso eliminado');
  }

  /** Adjuntar a un padre polimórfico */
  public function attach(Request $request, Recurso $recurso)
  {
    $data = $request->validate([
      'type' => ['required', 'string', 'max:80'],
      'id'   => ['required', 'integer'],
    ]);

    $this->attachTo($recurso, $data['type'], (int)$data['id']);
    return back()->with('ok', 'Recurso vinculado');
  }

  /** Desvincular */
  public function detach(Request $request, Recurso $recurso)
  {
    $data = $request->validate([
      'type' => ['required', 'string', 'max:80'],
      'id'   => ['required', 'integer'],
    ]);

    $model = $this->resolveMorph($data['type'], (int)$data['id']);
    if (method_exists($model, 'recursos')) {
      $model->recursos()->detach($recurso->id);
    } else {
      DB::table('resourceables')->where([
        'recurso_id'        => $recurso->id,
        'resourceable_id'   => $model->getKey(),
        'resourceable_type' => get_class($model),
      ])->delete();
    }

    return back()->with('ok', 'Recurso desvinculado');
  }

  /** Helpers privados (mismos que en Archivos, adaptados) */

  private function attachTo(Recurso $recurso, string $type, int $id): void
  {
    $model = $this->resolveMorph($type, $id);

    // Máx 5 recursos por entidad
    if (method_exists($model, 'recursos')) {
      if (($model->recursos()->count() ?? 0) >= 5) {
        abort(422, 'Máximo 5 recursos por elemento');
      }
      $model->recursos()->syncWithoutDetaching([$recurso->id]);
      return;
    }

    $exists = DB::table('resourceables')->where([
      'recurso_id'        => $recurso->id,
      'resourceable_id'   => $model->getKey(),
      'resourceable_type' => get_class($model),
    ])->exists();

    if ($exists) return;

    $count = DB::table('resourceables')->where([
      'resourceable_id'   => $model->getKey(),
      'resourceable_type' => get_class($model),
    ])->count();

    if ($count >= 5) abort(422, 'Máximo 5 recursos por elemento');

    DB::table('resourceables')->insert([
      'recurso_id'        => $recurso->id,
      'resourceable_id'   => $model->getKey(),
      'resourceable_type' => get_class($model),
    ]);
  }

  private function resolveMorph(string $type, int $id)
  {
    if (!class_exists($type)) abort(422, 'Tipo inválido');
    $model = (new $type)->find($id);
    if (!$model) abort(404, 'Destino no encontrado');
    return $model;
  }
}
