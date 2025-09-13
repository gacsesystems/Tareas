<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Etiqueta extends Model
{
  public $timestamps = false;
  protected $fillable = ['nombre', 'color', 'categoria'];

  // Si quieres morphedByMany por entidad:
  // public function tareas()    { return $this->morphedByMany(Tarea::class, 'taggable', 'etiquetables'); }
  // public function proyectos() { return $this->morphedByMany(Proyecto::class, 'taggable', 'etiquetables'); }
}
