<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class TipoEventoRequest extends FormRequest
{
  public function authorize(): bool
  {
    return true;
  }

  public function rules(): array
  {
    $id = $this->route('tipo_evento')?->id;
    return [
      'nombre' => ['required', 'string', 'max:60', 'unique:tipo_evento,nombre,' . ($id ?? 'NULL') . ',id'],
      'color'  => ['nullable', 'string', 'max:20'],
    ];
  }
}
