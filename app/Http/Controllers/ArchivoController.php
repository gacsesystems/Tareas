<?php

namespace App\Http\Controllers;

use App\Http\Requests\ArchivoRequest;
use App\Models\Archivo;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class ArchivoController extends Controller
{
  /** Listado simple */
  public function index()
  {
    $archivos = Archivo::orderByDesc('id')->paginate(30);
    return Inertia::render('Archivos/Index', [
      'archivos' => $archivos,
    ]);
  }

  public function create()
  {
    return Inertia::render('Archivos/Edit', ['archivo' => null]);
  }

  public function store(ArchivoRequest $request)
  {
    $data = $request->validated();

    $archivo = DB::transaction(function () use ($data, $request) {
      // 1) Subida real de archivo si viene 'file'
      if ($request->hasFile('file')) {
        $file = $request->file('file');

        // Carpeta destino; cambia 'uploads' por lo que prefieras
        $path = $file->store('uploads', ['disk' => 'local']); // 'local' por defecto

        $archivo = Archivo::create([
          'filename'     => $file->getClientOriginalName(),
          'mime'         => $file->getMimeType(),
          'size_bytes'   => $file->getSize(),
          'storage_path' => $path,
        ]);
      } else {
        // 2) Crear desde metadata previa (si usas otro flujo)
        $archivo = Archivo::create([
          'filename'     => $data['filename']     ?? 'archivo',
          'mime'         => $data['mime']         ?? null,
          'size_bytes'   => $data['size_bytes']   ?? null,
          'storage_path' => $data['storage_path'] ?? '',
        ]);
      }

      // 3) Attach inmediato (opcional)
      if (!empty($data['attach_type']) && !empty($data['attach_id'])) {
        $this->attachTo($archivo, $data['attach_type'], (int)$data['attach_id']);
      }

      return $archivo;
    });

    return redirect()->route('archivos.edit', $archivo)->with('ok', 'Archivo guardado');
  }

  public function edit(Archivo $archivo)
  {
    return Inertia::render('Archivos/Edit', ['archivo' => $archivo]);
  }

  public function update(ArchivoRequest $request, Archivo $archivo)
  {
    $data = $request->validated();

    // No aceptamos reemplazar binario aquí (más simple). Sólo metadata.
    $archivo->fill([
      'filename'   => $data['filename'] ?? $archivo->filename,
      'mime'       => $data['mime'] ?? $archivo->mime,
      'size_bytes' => $data['size_bytes'] ?? $archivo->size_bytes,
    ])->save();

    // Attach opcional
    if (!empty($data['attach_type']) && !empty($data['attach_id'])) {
      $this->attachTo($archivo, $data['attach_type'], (int)$data['attach_id']);
    }

    return back()->with('ok', 'Archivo actualizado');
  }

  public function destroy(Archivo $archivo)
  {
    DB::transaction(function () use ($archivo) {
      // Borrar físico si nadie más lo usa
      // (como tienes PK compuesta única por archivable, detecta vínculos)
      $inUse = DB::table('archivables')->where('archivo_id', $archivo->id)->exists();
      if (!$inUse && $archivo->storage_path && Storage::disk('local')->exists($archivo->storage_path)) {
        Storage::disk('local')->delete($archivo->storage_path);
      }
      $archivo->delete();
    });

    return redirect()->route('archivos.index')->with('ok', 'Archivo eliminado');
  }

  /** Descargar/mostrar (según tipo) */
  public function download(Archivo $archivo)
  {
    // Local:
    return response()->download(Storage::disk('local')->path($archivo->storage_path), $archivo->filename);

    // S3 (opcional):
    // $url = Storage::disk('s3')->temporaryUrl($archivo->storage_path, now()->addMinutes(5));
    // return redirect()->away($url);
  }

  /** Adjuntar a un modelo polimórfico */
  public function attach(Request $request, Archivo $archivo)
  {
    $data = $request->validate([
      'type' => ['required', 'string', 'max:80'], // e.g. "App\\Models\\Tarea"
      'id'   => ['required', 'integer'],
    ]);

    $this->attachTo($archivo, $data['type'], (int)$data['id']);
    return back()->with('ok', 'Archivo adjuntado');
  }

  /** Desvincular de un modelo polimórfico */
  public function detach(Request $request, Archivo $archivo)
  {
    $data = $request->validate([
      'type' => ['required', 'string', 'max:80'],
      'id'   => ['required', 'integer'],
    ]);

    $model = $this->resolveMorph($data['type'], (int)$data['id']);
    // Si el modelo usa el Trait HasArchivos:
    if (method_exists($model, 'archivos')) {
      $model->archivos()->detach($archivo->id);
    } else {
      // fallback directo a la tabla pivot
      DB::table('archivables')->where([
        'archivo_id'      => $archivo->id,
        'archivable_id'   => $model->getKey(),
        'archivable_type' => get_class($model),
      ])->delete();
    }

    return back()->with('ok', 'Archivo desvinculado');
  }

  /** Helpers privados */

  private function attachTo(Archivo $archivo, string $type, int $id): void
  {
    $model = $this->resolveMorph($type, $id);

    // En modelos con Trait HasArchivos:
    if (method_exists($model, 'archivos')) {
      // Máx 5 archivos por entidad (enforce backend)
      if (($model->archivos()->count() ?? 0) >= 5) {
        abort(422, 'Máximo 5 archivos por elemento');
      }
      $model->archivos()->syncWithoutDetaching([$archivo->id]);
      return;
    }

    // Fallback directo a pivot
    $exists = DB::table('archivables')->where([
      'archivo_id'      => $archivo->id,
      'archivable_id'   => $model->getKey(),
      'archivable_type' => get_class($model),
    ])->exists();

    if ($exists) return;

    // Máx 5 archivos por entidad
    $count = DB::table('archivables')->where([
      'archivable_id'   => $model->getKey(),
      'archivable_type' => get_class($model),
    ])->count();

    if ($count >= 5) abort(422, 'Máximo 5 archivos por elemento');

    DB::table('archivables')->insert([
      'archivo_id'      => $archivo->id,
      'archivable_id'   => $model->getKey(),
      'archivable_type' => get_class($model),
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
