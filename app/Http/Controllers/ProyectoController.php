<?php

namespace App\Http\Controllers;

use App\Http\Requests\ProyectoRequest;
use App\Models\Area;
use App\Models\Persona;
use App\Models\Proyecto;
use App\Models\Tarea;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class ProyectoController extends Controller
{
  /* ===== Listado ===== */
  public function index(Request $request)
  {
    $f = $request->only(['status', 'area_id', 'prioridad', 'estrategico']);

    $base = Proyecto::query()->with(['area:id,nombre', 'owner:id,nombre', 'proximaAccionTarea:id,titulo,estado,score,frog,is_rock,ranking'])
      ->when(isset($f['status']), fn($q) => $q->where('status', $f['status']))
      ->when(isset($f['area_id']), fn($q) => $q->where('area_id', $f['area_id']))
      ->when(isset($f['prioridad']), fn($q) => $q->where('prioridad', $f['prioridad']))
      ->when(isset($f['estrategico']), fn($q) => $q->where('estrategico', (bool)$f['estrategico']));

    // Resumen con los mismos filtros aplicados
    $summary = [
      'total'        => (clone $base)->count(),
      'abiertos'     => (clone $base)->where('status', 'abierto')->count(),
      'cerrados'     => (clone $base)->where('status', 'cerrado')->count(),
      'estrategicos' => (clone $base)->where('estrategico', true)->count(),
      'avg_progreso' => round((clone $base)->avg('progreso_pct') ?? 0, 1),
    ];

    $proyectos = (clone $base)->ordenDashboard()->paginate(24)->withQueryString();

    return Inertia::render('Proyectos/Index', [
      'filters'   => $f,
      'summary'   => $summary,
      'proyectos' => $proyectos,
      'areas'     => Area::select('id', 'nombre')->orderBy('nombre')->get(),
    ]);
  }

  public function create()
  {
    return Inertia::render('Projects/Edit', [
      'proyecto'  => null,
      'areas'     => Area::select('id', 'nombre')->orderBy('nombre')->get(),
      'owners'    => Persona::select('id', 'nombre')->where('activo', true)->orderBy('nombre')->get(),
    ]);
  }

  public function store(ProyectoRequest $request)
  {
    return DB::transaction(function () use ($request) {
      $p = new Proyecto($request->validated());

      // si se crea en abierto y no hay fecha inicio real -> opcionalmente setear hoy cuando se crea la primera tarea
      // $p->fec_inicio_real = $p->fec_inicio_real ?: now()->toDateString();

      // progreso inicial
      $p->calcularProgreso();
      // próxima acción auto (si aplica)
      $p->actualizarProximaAccionAuto();

      $p->save();

      return redirect()->route('proyectos.edit', $p)->with('ok', 'Proyecto creado');
    });
  }

  public function edit(Proyecto $proyecto)
  {
    $proyecto->load([
      'area:id,nombre',
      'owner:id,nombre',
      'proximaAccionTarea:id,titulo,estado,score,frog,is_rock,ranking',
      'etapas' => fn($q) => $q->orderBy('orden'),
      'tareas' => fn($q) => $q->select('id', 'titulo', 'estado', 'bloqueada', 'ranking', 'proyecto_id', 'proyecto_etapa_id', 'fecha_limite')->where('proyecto_id', $proyecto->id)->orderBy('ranking'),
      'objetivos' => fn($q) => $q->orderBy('orden'),
    ]);

    return Inertia::render('Projects/Edit', [
      'proyecto' => $proyecto,
      'areas'    => Area::select('id', 'nombre')->orderBy('nombre')->get(),
      'owners'   => Persona::select('id', 'nombre')->where('activo', true)->orderBy('nombre')->get(),
      // Puedes cargar aquí métricas agregadas si quieres (conteos por estado, etc.)
    ]);
  }

  public function update(ProyectoRequest $request, Proyecto $proyecto)
  {
    return DB::transaction(function () use ($request, $proyecto) {
      $proyecto->fill($request->validated());

      // recalcular progreso y próxima acción si está en auto
      $proyecto->calcularProgreso();
      $proyecto->actualizarProximaAccionAuto();
      $proyecto->cerrarSiCorresponde();

      $proyecto->save();

      return back()->with('ok', 'Proyecto actualizado');
    });
  }

  public function destroy(Proyecto $proyecto)
  {
    // no soft deletes en tabla proyectos (según tu schema); si quieres, conviértelo a softDeletes
    $proyecto->delete();
    return redirect()->route('proyectos.index')->with('ok', 'Proyecto eliminado');
  }

  /* ===== Acciones rápidas ===== */

  // 👀 interés
  public function interes(Proyecto $proyecto)
  {
    $proyecto->interest_hits = (int)$proyecto->interest_hits + 1;
    $proyecto->interest_last_at = now();
    // interés no cambia progreso; pero podría influir en ordenar tareas (se hace a nivel tarea)
    $proyecto->save();

    return back();
  }

  // Forzar recálculo de progreso (ej. tras editar etapas/objetivos vía otros controladores)
  public function recomputarProgreso(Proyecto $proyecto)
  {
    $proyecto->calcularProgreso();
    $proyecto->cerrarSiCorresponde();
    $proyecto->save();

    return back()->with('ok', 'Progreso recalculado');
  }

  // Fijar próxima acción manual
  public function setProximaAccion(Request $request, Proyecto $proyecto)
  {
    $request->validate([
      'tarea_id' => ['nullable', 'exists:tareas,id'],
      'modo'     => ['required', 'in:auto,manual'],
    ]);

    $proyecto->proxima_accion_modo = $request->string('modo');
    $proyecto->proxima_accion_tarea_id = $request->input('tarea_id');

    if ($proyecto->proxima_accion_modo === 'auto') {
      $proyecto->actualizarProximaAccionAuto();
    } else {
      $proyecto->proxima_accion_updated_at = now();
    }

    $proyecto->save();

    return back()->with('ok', 'Próxima acción actualizada');
  }

  public function cerrar(Proyecto $proyecto)
  {
    $proyecto->status = 'cerrado';
    $proyecto->fec_fin_real = $proyecto->fec_fin_real ?: now()->toDateString();
    $proyecto->save();

    return back()->with('ok', 'Proyecto cerrado');
  }

  public function abrir(Proyecto $proyecto)
  {
    $proyecto->status = 'abierto';
    // opcional: limpiar fec_fin_real
    $proyecto->save();

    return back()->with('ok', 'Proyecto reabierto');
  }

  public function kanbanReorder(Request $request, Proyecto $proyecto)
  {
    $data = $request->validate([
      'moves' => ['required', 'array', 'min:1'],
      'moves.*.tarea_id'       => ['required', 'integer', 'exists:tareas,id'],
      'moves.*.from_etapa_id'  => ['nullable', 'integer'],
      'moves.*.to_etapa_id'    => ['nullable', 'integer'],
      'moves.*.new_index'      => ['required', 'integer', 'min:0'],
    ]);

    DB::transaction(function () use ($data, $proyecto) {
      foreach ($data['moves'] as $mv) {
        $t = Tarea::where('id', $mv['tarea_id'])->where('proyecto_id', $proyecto->id)->firstOrFail();

        // Cambiar etapa si aplica
        $t->proyecto_etapa_id = $mv['to_etapa_id'] ?: null;
        $t->save();

        // Reordenar dentro de la columna destino: normalizamos ranking como múltiplos de 100
        $destQuery = \App\Models\Tarea::where('proyecto_id', $proyecto->id)
          ->where(function ($q) use ($mv) {
            if ($mv['to_etapa_id']) $q->where('proyecto_etapa_id', $mv['to_etapa_id']);
            else $q->whereNull('proyecto_etapa_id');
          })->where('id', '!=', $t->id)->orderBy('ranking');

        $dest = $destQuery->get()->values();

        // Insertar tarea en posición new_index
        $list = $dest->toArray();
        array_splice($list, (int)$mv['new_index'], 0, [$t->toArray()]);

        // Persistir ranking
        foreach ($list as $i => $row) {
          Tarea::where('id', $row['id'])->update(['ranking' => ($i + 1) * 100]);
        }
      }

      // Recalcula progreso y cierre si corresponde (opcional)
      $proyecto->calcularProgreso();
      $proyecto->cerrarSiCorresponde();
      $proyecto->save();
    });

    return back();
  }
}
