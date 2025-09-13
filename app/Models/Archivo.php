<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Archivo extends Model
{
  protected $fillable = [
    'filename',
    'mime',
    'size_bytes',
    'storage_path',
  ];

  protected $casts = [
    'size_bytes' => 'integer',
  ];

  /** Helpers para mostrar tamaño legible */
  public function getSizeHumanAttribute(): ?string
  {
    $bytes = $this->size_bytes;
    if (is_null($bytes)) return null;
    $units = ['B', 'KB', 'MB', 'GB', 'TB'];
    $i = 0;
    while ($bytes >= 1024 && $i < count($units) - 1) {
      $bytes /= 1024;
      $i++;
    }
    return round($bytes, 1) . ' ' . $units[$i];
  }

  /**
   * Si quieres conocer padres (Tarea, Proyecto, Evento, etc.),
   * puedes definir relaciones específicas con morphedByMany:
   *
   * public function tareas()   { return $this->morphedByMany(Tarea::class, 'archivable'); }
   * public function proyectos(){ return $this->morphedByMany(Proyecto::class, 'archivable'); }
   * ...etc.
   *
   * Como es un sistema personal, puedes omitirlas y manejar attach/detach por controlador.
   */
}
// No es necesario definir la relación inversa (morphToMany) en los modelos que usan archivos.