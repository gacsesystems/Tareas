<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\TareaController;
use App\Http\Controllers\ProyectoController;
use App\Http\Controllers\ProyectoEtapaController;
use App\Http\Controllers\EventoController;
use App\Http\Controllers\HabitoController;
use App\Http\Controllers\HabitoLogController;
use App\Http\Controllers\RutinaController;
use App\Http\Controllers\RutinaItemController;
use App\Http\Controllers\ArchivoController;
use App\Http\Controllers\RecursoController;
use App\Http\Controllers\ProyectoObjetivoController;
use App\Http\Controllers\EtiquetaController;
use App\Http\Controllers\SesionTrabajoController;
use App\Http\Controllers\PersonaController;
use App\Http\Controllers\TimeblockController;
use App\Http\Controllers\CuentaController;
use App\Http\Controllers\CategoriaFinController;
use App\Http\Controllers\MovimientoController;
use App\Http\Controllers\PresupuestoController;
use App\Http\Controllers\MovtoRecurrenteController;
use App\Http\Controllers\EntradaDiarioController;
use App\Http\Controllers\PrincipalController;
use App\Http\Controllers\TareaQuickController;
use App\Http\Controllers\CatalogoController;
use App\Http\Controllers\AreaController;
use App\Http\Controllers\ContextoController;
use Inertia\Inertia;

Route::prefix('proyectos')->name('proyectos.')->group(function () {
    Route::get('', [ProyectoController::class, 'index'])->name('index');
    Route::get('crear', [ProyectoController::class, 'create'])->name('create');
    Route::post('', [ProyectoController::class, 'store'])->name('store');
    Route::get('{proyecto}/editar', [ProyectoController::class, 'edit'])->name('edit');
    Route::put('{proyecto}', [ProyectoController::class, 'update'])->name('update');
    Route::delete('{proyecto}', [ProyectoController::class, 'destroy'])->name('destroy');

    // Acciones rápidas
    Route::post('{proyecto}/interes', [ProyectoController::class, 'interes'])->name('interes');
});

Route::prefix('proyectos/{proyecto}')->name('proyectos.')->group(function () {
    Route::get('etapas', [ProyectoEtapaController::class, 'index'])->name('etapas.index');
    Route::post('etapas', [ProyectoEtapaController::class, 'store'])->name('etapas.store');
    Route::post('etapas/sort', [ProyectoEtapaController::class, 'sort'])->name('etapas.sort');
});
Route::get('etapas/{proyectoEtapa}/editar', [ProyectoEtapaController::class, 'edit'])->name('etapas.edit');
Route::put('etapas/{proyectoEtapa}', [ProyectoEtapaController::class, 'update'])->name('etapas.update');
Route::delete('etapas/{proyectoEtapa}', [ProyectoEtapaController::class, 'destroy'])->name('etapas.destroy');
Route::post('etapas/{proyectoEtapa}/toggle', [ProyectoEtapaController::class, 'toggleDone'])->name('etapas.toggle');

Route::resource('eventos', EventoController::class)->except(['show']);

Route::resource('habitos', HabitoController::class)->except(['show']);
Route::post('habito-logs', [HabitoLogController::class, 'store'])->name('habito_logs.store');
Route::delete('habito-logs/{habitoLog}', [HabitoLogController::class, 'destroy'])->name('habito_logs.destroy');

Route::resource('rutinas', RutinaController::class)->except(['show']);
Route::post('rutinas/{rutina}/items/sort', [RutinaItemController::class, 'sort'])->name('rutinas.items.sort');
Route::post('rutina-items', [RutinaItemController::class, 'store'])->name('rutina_items.store');
Route::put('rutina-items/{rutinaItem}', [RutinaItemController::class, 'update'])->name('rutina_items.update');
Route::delete('rutina-items/{rutinaItem}', [RutinaItemController::class, 'destroy'])->name('rutina_items.destroy');



Route::resource('archivos', ArchivoController::class)->except(['show']);
Route::get('archivos/{archivo}/download', [ArchivoController::class, 'download'])->name('archivos.download');
Route::post('archivos/{archivo}/attach', [ArchivoController::class, 'attach'])->name('archivos.attach');
Route::post('archivos/{archivo}/detach', [ArchivoController::class, 'detach'])->name('archivos.detach');

Route::resource('recursos', RecursoController::class)->except(['show']);
Route::post('recursos/{recurso}/attach', [RecursoController::class, 'attach'])->name('recursos.attach');
Route::post('recursos/{recurso}/detach', [RecursoController::class, 'detach'])->name('recursos.detach');

Route::get('proyectos/{proyecto}/objetivos', [ProyectoObjetivoController::class, 'index'])->name('proyectos.objetivos.index');
Route::post('proyecto-objetivos', [ProyectoObjetivoController::class, 'store'])->name('proyecto-objetivos.store');
Route::put('proyecto-objetivos/{objetivo}', [ProyectoObjetivoController::class, 'update'])->name('proyecto-objetivos.update');
Route::delete('proyecto-objetivos/{objetivo}', [ProyectoObjetivoController::class, 'destroy'])->name('proyecto-objetivos.destroy');
Route::post('proyecto-objetivos/{objetivo}/toggle', [ProyectoObjetivoController::class, 'toggleCumplido'])->name('proyecto-objetivos.toggle');
Route::post('proyectos/{proyecto}/objetivos/reorder', [ProyectoObjetivoController::class, 'reorder'])->name('proyectos.objetivos.reorder');

Route::resource('etiquetas', EtiquetaController::class)->only(['index', 'store', 'update', 'destroy']);
Route::post('etiquetas/{etiqueta}/attach', [EtiquetaController::class, 'attach'])->name('etiquetas.attach');
Route::post('etiquetas/{etiqueta}/detach', [EtiquetaController::class, 'detach'])->name('etiquetas.detach');

Route::get('sesiones', [SesionTrabajoController::class, 'index'])->name('sesiones.index');
Route::post('sesiones', [SesionTrabajoController::class, 'store'])->name('sesiones.store');
Route::put('sesiones/{sesion}', [SesionTrabajoController::class, 'update'])->name('sesiones.update');
Route::delete('sesiones/{sesion}', [SesionTrabajoController::class, 'destroy'])->name('sesiones.destroy');

Route::resource('personas', PersonaController::class);
Route::resource('timeblocks', TimeblockController::class)->only(['index', 'store', 'update', 'destroy']);

Route::resource('cuentas', CuentaController::class)->only(['index', 'store', 'update', 'destroy']);
Route::resource('categorias-fin', CategoriaFinController::class)->parameters(['categorias-fin' => 'categoria_fi']);

Route::resource('movimientos', MovimientoController::class)->only(['index', 'store', 'update', 'destroy']);
Route::post('cuotas/{cuota}/liquidar', [MovimientoController::class, 'liquidarCuota'])->name('cuotas.liquidar');

Route::resource('presupuestos', PresupuestoController::class)->only(['index', 'store', 'update', 'destroy']);
Route::resource('recurrentes', MovtoRecurrenteController::class)->only(['index', 'store', 'update', 'destroy']);

Route::get('diario', [EntradaDiarioController::class, 'index'])->name('diario.index');
Route::post('diario', [EntradaDiarioController::class, 'store'])->name('diario.store');
Route::get('diario/{diario}/edit', [EntradaDiarioController::class, 'edit'])->name('diario.edit');
Route::put('diario/{diario}', [EntradaDiarioController::class, 'update'])->name('diario.update');
Route::delete('diario/{diario}', [EntradaDiarioController::class, 'destroy'])->name('diario.destroy');

Route::get('/view', function () {
    return Inertia::render('Principal'); // resources/js/Pages/View.tsx
})->name('view');

Route::get('/', PrincipalController::class)->name('Principal');
Route::post('tareas/{tarea}/quick/toggle-complete', [TareaQuickController::class, 'toggleComplete'])->name('tareas.quick.toggle-complete');
Route::post('tareas/{tarea}/quick/mark-frog',      [TareaQuickController::class, 'markFrog'])->name('tareas.quick.mark-frog');
Route::post('tareas/{tarea}/quick/toggle-rock',    [TareaQuickController::class, 'toggleRock'])->name('tareas.quick.toggle-rock');
Route::post('tareas/{tarea}/quick/boost-24h',      [TareaQuickController::class, 'boost24h'])->name('tareas.quick.boost-24h');

Route::resource('tareas', TareaController::class)->only(['store', 'update', 'destroy']);

// Proyectos (ya las tienes)
Route::post('proyectos/{proyecto}/recompute', [ProyectoController::class, 'recomputarProgreso'])->name('proyectos.recompute');
Route::post('proyectos/{proyecto}/proxima',   [ProyectoController::class, 'setProximaAccion'])->name('proyectos.proxima');
Route::post('proyectos/{proyecto}/cerrar',    [ProyectoController::class, 'cerrar'])->name('proyectos.cerrar');
Route::post('proyectos/{proyecto}/abrir',     [ProyectoController::class, 'abrir'])->name('proyectos.abrir');

// Etapas
Route::get('proyectos/{proyecto}/etapas',              [ProyectoEtapaController::class, 'index'])->name('proyectos.etapas.index');
Route::post('proyecto-etapas',                          [ProyectoEtapaController::class, 'store'])->name('proyectos.etapas.store');
Route::put('proyecto-etapas/{proyectoEtapa}',          [ProyectoEtapaController::class, 'update'])->name('proyectos.etapas.update');
Route::delete('proyecto-etapas/{proyectoEtapa}',        [ProyectoEtapaController::class, 'destroy'])->name('proyectos.etapas.destroy');
Route::post('proyectos/{proyecto}/etapas/sort',         [ProyectoEtapaController::class, 'sort'])->name('proyectos.etapas.sort');
Route::post('proyecto-etapas/{proyectoEtapa}/toggle',   [ProyectoEtapaController::class, 'toggleDone'])->name('proyectos.etapas.toggle');

// Objetivos
Route::post('proyecto-objetivos',                       [ProyectoObjetivoController::class, 'store'])->name('proyectos.objetivos.store');
Route::put('proyecto-objetivos/{objetivo}',            [ProyectoObjetivoController::class, 'update'])->name('proyectos.objetivos.update');
Route::delete('proyecto-objetivos/{objetivo}',          [ProyectoObjetivoController::class, 'destroy'])->name('proyectos.objetivos.destroy');
Route::post('proyecto-objetivos/{objetivo}/toggle',     [ProyectoObjetivoController::class, 'toggleCumplido'])->name('proyectos.objetivos.toggle');
Route::post('proyectos/{proyecto}/objetivos/reorder',   [ProyectoObjetivoController::class, 'reorder'])->name('proyectos.objetivos.reorder');

Route::post('proyectos/{proyecto}/kanban-reorder', [ProyectoController::class, 'kanbanReorder'])->name('proyectos.kanban.reorder');

Route::get('catalogos', [CatalogoController::class, 'index'])->name('catalogos.index'); // Página combinada

Route::resource('areas', AreaController::class)->only(['index', 'store', 'update', 'destroy']);
Route::resource('contextos', ContextoController::class)->only(['index', 'store', 'update', 'destroy']);

Route::get('tareas', [TareaController::class, 'index'])->name('tareas.index');
Route::post('tareas/{tarea}/interes',   [TareaController::class, 'interes'])->name('tareas.interes');
Route::post('tareas/{tarea}/boost',     [TareaController::class, 'boost'])->name('tareas.boost');
Route::post('tareas/{tarea}/bloqueo',   [TareaController::class, 'bloqueo'])->name('tareas.bloqueo');
Route::post('tareas/{tarea}/pomodoro',  [TareaController::class, 'pomodoro'])->name('tareas.pomodoro');
