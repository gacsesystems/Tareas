<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CategoriaFin extends Model
{
  protected $table = 'categorias_fin';

  protected $fillable = ['nombre', 'parent_id', 'depth', 'orden'];

  public function parent()
  {
    return $this->belongsTo(CategoriaFin::class, 'parent_id');
  }

  public function children()
  {
    return $this->hasMany(CategoriaFin::class, 'parent_id')->orderBy('orden');
  }

  public function movimientos()
  {
    return $this->hasMany(Movimiento::class, 'categoria_id');
  }

  public function presupuestos()
  {
    return $this->hasMany(Presupuesto::class, 'categoria_id');
  }
}
