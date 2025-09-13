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

    return Inertia::render('Tasks/Index', [
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
}
