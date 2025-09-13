<?php

namespace App\Models\Concerns;

use App\Models\Recurso;

trait HasRecursos
{
  public function recursos()
  {
    return $this->morphToMany(Recurso::class, 'resourceable', 'resourceables')->withTimestamps();
  }
}
