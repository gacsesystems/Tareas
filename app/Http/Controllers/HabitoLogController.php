<?php

namespace App\Http\Controllers;

use App\Http\Requests\HabitoLogRequest;
use App\Models\Habito;
use App\Models\HabitoLog;
use Illuminate\Support\Facades\DB;

class HabitoLogController extends Controller
{
  public function store(HabitoLogRequest $request)
  {
    $data = $request->validated();

    DB::transaction(function () use ($data) {
      $habito = Habito::findOrFail($data['habito_id']);

      // Calcular cumplimiento/porcentaje
      $valor = $data['valor'] ?? null;
      [$cumplido, $pct] = $habito->evaluar(is_null($valor) ? null : (float)$valor);

      $log = HabitoLog::updateOrCreate(
        ['habito_id' => $habito->id, 'fecha' => $data['fecha']],
        [
          'valor'      => $valor,
          'cumplido'   => $cumplido,
          'porcentaje' => $pct,
          'tarea_id'   => $data['tarea_id'] ?? null,
        ]
      );

      // Streaks muy básico (diario): si hoy cumplido, +1; si no, reset — ajusta si usas semanal/mensual
      if ($log->fecha->isToday()) {
        if ($cumplido) {
          $habito->streak = (int)$habito->streak + 1;
          $habito->mejor_streak = max((int)$habito->mejor_streak, (int)$habito->streak);
        } else {
          // no tocamos si solo guardaron parcial; ajusta a tu preferencia
        }
        $habito->save();
      }
    });

    return back()->with('ok', 'Registro guardado');
  }

  public function destroy(HabitoLog $habitoLog)
  {
    $habitoLog->delete();
    return back()->with('ok', 'Registro eliminado');
  }
}
