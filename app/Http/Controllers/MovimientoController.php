<?php

namespace App\Http\Controllers;

use App\Http\Requests\MovimientoRequest;
use App\Models\Movimiento;
use App\Models\MovimientoCuota;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Inertia\Inertia;

class MovimientoController extends Controller
{
  public function index(Request $request)
  {
    $q = Movimiento::with(['cuenta:id,nombre', 'cuentaDestino:id,nombre', 'categoria:id,nombre'])
      ->orderByDesc('id');

    if ($request->filled('status')) $q->where('status', $request->get('status'));
    if ($request->filled('tipo'))   $q->where('tipo', $request->get('tipo'));

    return Inertia::render('Finanzas/Movimientos/Index', [
      'items' => $q->paginate(30)->withQueryString(),
    ]);
  }

  public function store(MovimientoRequest $request)
  {
    $data = $request->validated();

    $mov = DB::transaction(function () use ($data) {
      // Transferencias: crear par de asientos con mismo transfer_group_id
      if ($data['tipo'] === 'transferencia') {
        $group = $data['transfer_group_id'] ?? (string) Str::uuid();

        // asiento salida
        $out = Movimiento::create(array_merge($data, [
          'status' => $data['status'] ?? 'realizado',
          'transfer_group_id' => $group,
          'categoria_id' => null,
        ]));

        // asiento entrada (invertir cuentas)
        $inData = $data;
        $inData['cuenta_id']        = $data['cuenta_destino_id'];
        $inData['cuenta_destino_id'] = null;
        $inData['transfer_group_id'] = $group;
        $in = Movimiento::create($inData);

        return $out; // devolvemos el primero
      }

      $mov = Movimiento::create($data);

      // MSI / cuotas
      if (($data['tiene_plan_parcial'] ?? false) && !empty($data['msi_meses']) && !empty($data['msi_inicio'])) {
        $monto = $data['monto'] / $data['msi_meses'];
        for ($i = 1; $i <= (int)$data['msi_meses']; $i++) {
          MovimientoCuota::create([
            'movimiento_id' => $mov->id,
            'numero' => $i,
            'monto'  => round($monto, 2),
            'fecha_objetivo' => now()->parse($data['msi_inicio'])->addMonthsNoOverflow($i - 1)->toDateString(),
            'status' => 'pendiente',
          ]);
        }
      }

      return $mov;
    });

    return redirect()->route('movimientos.index')->with('ok', 'Movimiento creado')->with('id', $mov->id);
  }

  public function update(MovimientoRequest $request, Movimiento $movimiento)
  {
    $movimiento->update($request->validated());
    return back()->with('ok', 'Movimiento actualizado');
  }

  public function destroy(Movimiento $movimiento)
  {
    $movimiento->delete();
    return back()->with('ok', 'Movimiento eliminado');
  }

  /** Marcar cuota como pagada, y enlazar pago si se proporciona */
  public function liquidarCuota(Request $request, MovimientoCuota $cuota)
  {
    $data = $request->validate([
      'pago_mov_id' => ['nullable', 'exists:movimientos,id'],
      'fecha_real'  => ['nullable', 'date'],
    ]);

    $cuota->update([
      'status' => 'realizado',
      'pago_mov_id' => $data['pago_mov_id'] ?? null,
    ]);

    if (!empty($data['fecha_real'])) {
      $cuota->movimiento->update(['fecha_real' => $data['fecha_real']]); // opcional
    }

    return back()->with('ok', 'Cuota liquidada');
  }
}
