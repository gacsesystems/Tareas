<?php

namespace App\Http\Controllers;

use App\Models\Tarea;

class TareaQuickController extends Controller
{
  public function toggleComplete(Tarea $tarea)
  {
    // usa tu campo real (completed / estado=hecha)
    if (property_exists($tarea, 'completed')) {
      $tarea->completed = ! $tarea->completed;
    } else {
      $tarea->estado = $tarea->estado === 'hecha' ? 'hoy' : 'hecha';
    }
    $tarea->calcularScore();
    $tarea->save();

    return back()->with('toast', [
      'type' => 'success',
      'title' => 'Actualizado',
      'desc' => 'Estado de la tarea cambiado',
      'id' => $tarea->id
    ]);
  }

  public function markFrog(Tarea $tarea)
  {
    // desmarcar otros frogs de hoy del mismo usuario si aplica; aquí solo marcamos este
    $tarea->frog = true;
    $tarea->frog_date = now()->toDateString();
    $tarea->estado = 'hoy';
    $tarea->calcularScore();
    $tarea->save();

    return back()->with('toast', ['type' => 'success', 'title' => 'Frog asignado']);
  }

  public function toggleRock(Tarea $tarea)
  {
    $tarea->is_rock = ! $tarea->is_rock;
    $tarea->calcularScore();
    $tarea->save();

    return back()->with('toast', ['type' => 'success', 'title' => 'Rock actualizado']);
  }

  public function boost24h(Tarea $tarea)
  {
    if ($tarea->bloqueada) {
      return back()->with('warn', 'No se puede aplicar boost a una tarea bloqueada');
    }

    $tarea->score_boost_factor = 1.15;
    $tarea->score_boost_until = now()->addDay();
    $tarea->calcularScore();
    $tarea->save();

    return back()->with('toast', ['type' => 'success', 'title' => 'Boost aplicado']);
  }
}
