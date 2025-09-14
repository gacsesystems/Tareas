<?php

namespace App\Http\Controllers;

use App\Http\Requests\TareaRequest;
use App\Models\Area;
use App\Models\Contexto;
use App\Models\Persona;
use App\Models\Proyecto;
use App\Models\Tarea;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\Rule;

class TareaController extends Controller
{
  /* ======== Listado/Inertia ======== */
  public function index(Request $request)
  {
    $f = $request->only(['estado', 'proyecto_id', 'responsable_id', 'area_id', 'contexto_id']);

    $tareas = Tarea::with(['proyecto:id,nombre', 'responsable:id,nombre', 'area:id,nombre', 'contexto:id,nombre'])
      ->filtro($f)
      ->orderByDesc('frog')
      ->orderByDesc('is_rock')
      ->orderBy('ranking')
      ->orderByDesc('score')
      ->paginate(30)
      ->withQueryString();

    return Inertia::render('TareasLista', [
      'filters' => $f,
      'tareas'  => $tareas,
      'proyectos'   => Proyecto::select('id', 'nombre')->orderBy('nombre')->get(),
      'personas'    => Persona::select('id', 'nombre')->where('activo', true)->orderBy('nombre')->get(),
      'areas'       => Area::select('id', 'nombre')->orderBy('nombre')->get(),
      'contextos'   => Contexto::select('id', 'nombre')->orderBy('nombre')->get(),
    ]);
  }

  public function create()
  {
    return Inertia::render('Tasks/Edit', [
      'proyectos' => Proyecto::select('id', 'nombre')->orderBy('nombre')->get(),
      'personas'  => Persona::select('id', 'nombre')->where('activo', true)->orderBy('nombre')->get(),
      'areas'     => Area::select('id', 'nombre')->orderBy('nombre')->get(),
      'contextos' => Contexto::select('id', 'nombre')->orderBy('nombre')->get(),
      'tarea'     => null,
    ]);
  }

  public function store(TareaRequest $request): RedirectResponse
  {
    Log::info('Tareas.store raw', $request->all());
    return DB::transaction(function () use ($request) {
      $tarea = new Tarea($request->validated());
      // defaults suaves
      if (!$tarea->fecha) $tarea->fecha = now();

      // si viene frog y no trae frog_date => hoy
      if ($tarea->frog && !$tarea->frog_date) $tarea->frog_date = now()->toDateString();

      $tarea->calcularScore();
      $tarea->save();

      // etiquetas/archivos vienen por otro flujo (opcional)

      return back()->with('toast', [
        'type'  => 'success',
        'title' => 'Tarea creada',
        'desc'  => 'Se guardó correctamente.',
        'id'    => $tarea->id,
      ]);
    });
  }

  public function edit(Tarea $tarea)
  {
    $tarea->load(['proyecto:id,nombre', 'responsable:id,nombre', 'etiquetas:id,nombre,color']);

    return Inertia::render('Tasks/Edit', [
      'tarea'     => $tarea,
      'proyectos' => Proyecto::select('id', 'nombre')->orderBy('nombre')->get(),
      'personas'  => Persona::select('id', 'nombre')->where('activo', true)->orderBy('nombre')->get(),
      'areas'     => Area::select('id', 'nombre')->orderBy('nombre')->get(),
      'contextos' => Contexto::select('id', 'nombre')->orderBy('nombre')->get(),
    ]);
  }

  public function update(TareaRequest $request, Tarea $tarea): RedirectResponse
  {
    return DB::transaction(function () use ($request, $tarea) {
      $tarea->fill($request->validated());

      // normalizaciones
      if ($tarea->frog && !$tarea->frog_date) {
        $tarea->frog_date = now()->toDateString();
      }
      if (!$tarea->frog) {
        $tarea->frog_date = null;
      }

      // recalcular score
      $tarea->calcularScore();
      $tarea->save();

      return back()->with('toast', [
        'type'  => 'success',
        'title' => 'Tarea actualizada',
        'desc'  => 'Cambios guardados.',
        'id'    => $tarea->id,
      ]);
    });
  }

  public function destroy(Tarea $tarea): RedirectResponse
  {
    $tarea->delete();
    return back()->with('toast', [
      'type'  => 'success',
      'title' => 'Tarea eliminada',
      'desc'  => 'Se envió a la papelera (si aplica) o se eliminó.',
      'id'    => $tarea->id,
    ]);
  }

  /* ======== Acciones rápidas (botones) ======== */

  // + Interés (👀)
  public function interes(Tarea $tarea)
  {
    $tarea->interest_hits = $tarea->interest_hits + 1;
    $tarea->interest_last_at = now();
    $tarea->calcularScore();
    $tarea->save();

    return back();
  }

  // Boost 24h
  public function boost(Request $request, Tarea $tarea)
  {
    $factor = (float)($request->input('factor', 1.15));
    $factor = max(1.0, min(1.25, $factor));

    if ($tarea->bloqueada) {
      return back()->with('warn', 'No se puede aplicar boost a una tarea bloqueada');
    }

    $tarea->score_boost_factor = $factor;
    $tarea->score_boost_until  = now()->addDay();
    $tarea->calcularScore();
    $tarea->save();

    return back();
  }

  // Bloquear / Desbloquear
  public function bloqueo(Request $request, Tarea $tarea)
  {
    $tarea->bloqueada = (bool)$request->boolean('bloqueada');
    $tarea->bloqueo_motivo = $request->string('motivo')->take(300);
    $tarea->calcularScore();
    $tarea->save();

    return back();
  }

  // Log de pomodoro/minutos al cerrar sesión
  public function pomodoro(Request $request, Tarea $tarea)
  {
    $mins = (int) $request->input('minutos', 25);
    $mins = max(1, min(240, $mins));

    $tarea->tiempo_total_min += $mins;
    $tarea->pomos_realizados = $tarea->pomos_realizados + (int) round($mins / 25);
    $tarea->ultimo_movimiento_at = now();

    $tarea->calcularScore();
    $tarea->save();

    return back();
  }

  public function kanban(Request $request)
  {
    $f = $request->only(['proyecto_id', 'responsable_id', 'area_id', 'contexto_id']);

    // Trae todas las tareas visibles para el tablero, sin paginar
    $tareas = Tarea::with(['proyecto:id,nombre', 'responsable:id,nombre', 'area:id,nombre', 'contexto:id,nombre'])
      ->filtro($f)
      ->orderByDesc('frog')
      ->orderByDesc('is_rock')
      ->orderBy('ranking')
      ->orderByDesc('score')
      ->get();

    // “3 últimos responsables” (puedes refinar el criterio)
    $ultimosResponsables = Persona::select('id', 'nombre')
      ->where('activo', true)
      ->orderBy('updated_at', 'desc')
      ->take(3)
      ->get();

    return Inertia::render('TareasKanban', [
      'filters'   => $f,
      'tareas'    => $tareas,
      'proyectos' => Proyecto::select('id', 'nombre')->orderBy('nombre')->get(),
      'personas'  => Persona::select('id', 'nombre')->where('activo', true)->orderBy('nombre')->get(),
      'areas'     => Area::select('id', 'nombre')->orderBy('nombre')->get(),
      'contextos' => Contexto::select('id', 'nombre')->orderBy('nombre')->get(),
      'ultimosResponsables' => $ultimosResponsables,
    ]);
  }

  /**
   * Reordena una tarjeta al soltarla en otra columna/posición.
   * Espera: { id, estado, after_id?, before_id? }
   * Calcula ranking nuevo entre vecinos (espaciado) y mueve estado.
   */
  public function kanbanReorder(Request $request)
  {
    $data = $request->validate([
      'id'        => ['required', 'integer', 'exists:tareas,id'],
      'estado'    => ['required', Rule::in(['backlog', 'siguiente', 'hoy', 'en_curso', 'en_revision', 'bloqueada', 'hecha'])],
      'after_id'  => ['nullable', 'integer', 'exists:tareas,id'],
      'before_id' => ['nullable', 'integer', 'exists:tareas,id'],
    ]);

    return DB::transaction(function () use ($data) {
      /** @var Tarea $t */
      $t = Tarea::lockForUpdate()->findOrFail($data['id']);
      $t->estado = $data['estado'];

      // ranking target tomando vecinos de la misma columna
      $getRank = function (?int $id): ?int {
        if (!$id) return null;
        $x = Tarea::select('id', 'ranking')->find($id);
        return $x?->ranking;
      };

      $afterRank  = $getRank($data['after_id']  ?? null);
      $beforeRank = $getRank($data['before_id'] ?? null);

      if (!is_null($afterRank) && !is_null($beforeRank)) {
        // colocar entre ambos
        $t->ranking = (int) floor(($afterRank + $beforeRank) / 2);
      } elseif (!is_null($afterRank)) {
        // poner debajo del "after" (más grande)
        $t->ranking = $afterRank + 100;
      } elseif (!is_null($beforeRank)) {
        // poner encima del "before" (más chico)
        $t->ranking = max(0, $beforeRank - 100);
      } else {
        // columna vacía: set punto medio por defecto
        $t->ranking = 1000;
      }

      // normalizaciones/coherencia rápida
      if ($t->frog && $t->estado !== 'hoy') {
        $t->frog = false;
        $t->frog_date = null;
      }
      if ($t->bloqueada && $t->estado !== 'bloqueada') {
        $t->bloqueada = false;
        $t->bloqueo_motivo = null;
      }

      $t->calcularScore();
      $t->save();

      return back();
    });
  }
}
