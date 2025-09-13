<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Contexto extends Model
{
  public $timestamps = false;
  protected $fillable = ['nombre'];

  public function tareas(): HasMany
  {
    return $this->hasMany(Tarea::class);
  }
}
