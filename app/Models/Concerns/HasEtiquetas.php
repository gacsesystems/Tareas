<?php

namespace App\Models\Concerns;

use App\Models\Etiqueta;

trait HasEtiquetas
{
  public function etiquetas()
  {
    return $this->morphToMany(Etiqueta::class, 'taggable', 'etiquetables')->withTimestamps();
  }
}
