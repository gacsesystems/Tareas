<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class EntradaDiario extends Model
{
  protected $table = 'entrada_diario';

  protected $fillable = [
    'fecha',
    'momento',
    'contenido_md',
    'mood_principal',
    'mood_escala',
    'sueno_horas',
    'plantilla_diaria',
    'tarea_id',
  ];

  protected $casts = [
    'fecha'            => 'date',
    'momento'          => 'datetime',
    'mood_escala'      => 'integer',
    'sueno_horas'      => 'decimal:2',
    'plantilla_diaria' => 'boolean',
  ];

  public function tarea()
  {
    return $this->belongsTo(Tarea::class);
  }

  // Si usas etiquetas/archivos polimórficos:
  public function etiquetas()
  {
    return $this->morphToMany(Etiqueta::class, 'taggable', 'etiquetables');
  }

  public function archivos()
  {
    return $this->morphToMany(Archivo::class, 'archivable', 'archivables');
  }
}
