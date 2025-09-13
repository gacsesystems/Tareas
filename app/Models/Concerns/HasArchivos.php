<?php

namespace App\Models\Concerns;

use App\Models\Archivo;

trait HasArchivos
{
  public function archivos()
  {
    return $this->morphToMany(Archivo::class, 'archivable', 'archivables')->withTimestamps();
  }
}
