<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class CategoriaFinRequest extends FormRequest
{
  public function authorize(): bool
  {
    return true;
  }

  public function rules(): array
  {
    return [
      'nombre'    => ['required', 'string', 'max:120'],
      'parent_id' => ['nullable', 'exists:categorias_fin,id'],
      'depth'     => ['nullable', 'integer', 'min:0', 'max:10'],
      'orden'     => ['nullable', 'integer', 'min:0'],
    ];
  }
}
