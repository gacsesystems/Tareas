<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Area extends Model
{
  public $timestamps = false;
  protected $fillable = ['nombre'];

  public function proyectos(): HasMany
  {
    return $this->hasMany(Proyecto::class);
  }

  public function tareas(): HasMany
  {
    return $this->hasMany(Tarea::class);
  }
}
