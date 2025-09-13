<?php

namespace App\Http\Controllers;

use App\Http\Requests\RutinaItemRequest;
use App\Models\Rutina;
use App\Models\RutinaItem;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class RutinaItemController extends Controller
{
  public function store(RutinaItemRequest $request)
  {
    $item = RutinaItem::create($request->validated());
    return redirect()->route('rutinas.edit', $item->rutina_id)->with('ok', 'Paso agregado');
  }

  public function update(RutinaItemRequest $request, RutinaItem $rutinaItem)
  {
    $rutinaItem->fill($request->validated())->save();
    return back()->with('ok', 'Paso actualizado');
  }

  public function destroy(RutinaItem $rutinaItem)
  {
    $rid = $rutinaItem->rutina_id;
    $rutinaItem->delete();
    return redirect()->route('rutinas.edit', $rid)->with('ok', 'Paso eliminado');
  }

  /** Reordenar (drag & drop) */
  public function sort(Request $request, Rutina $rutina)
  {
    $data = $request->validate([
      'orden' => ['required', 'array'],
      'orden.*.id'    => ['required', 'exists:rutina_items,id'],
      'orden.*.orden' => ['required', 'integer'],
    ]);

    DB::transaction(function () use ($data, $rutina) {
      foreach ($data['orden'] as $row) {
        RutinaItem::where('id', $row['id'])
          ->where('rutina_id', $rutina->id)
          ->update(['orden' => $row['orden']]);
      }
    });

    return back()->with('ok', 'Orden actualizado');
  }
}
