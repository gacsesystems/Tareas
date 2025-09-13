<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Persona extends Model
{
  protected $fillable = [
    'nombre',
    'relacion',
    'email',
    'telefono',
    'activo',
    'notas',
    'cumpleanos',
    'skill',
    'will',
    'delegation_level',
    'ranking',
    'last_review_at',
  ];

  protected $casts = [
    'activo'         => 'boolean',
    'cumpleanos'     => 'date',
    'skill'          => 'integer',
    'will'           => 'integer',
    'delegation_level' => 'integer',
    'ranking'        => 'decimal:2',
    'last_review_at' => 'datetime',
  ];

  // Relaciones útiles
  public function proyectosOwner()
  {
    return $this->hasMany(Proyecto::class, 'owner_id');
  }

  public function tareasResponsable()
  {
    return $this->hasMany(Tarea::class, 'responsable_id');
  }

  public function eventos()
  {
    return $this->hasMany(Evento::class, 'persona_id');
  }

  // Scopes
  public function scopeActivos($q)
  {
    return $q->where('activo', true);
  }
}
