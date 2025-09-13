<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class ArchivoRequest extends FormRequest
{
  public function authorize(): bool
  {
    return true;
  }

  public function rules(): array
  {
    // Caso create: puede venir un archivo subido (input name="file")
    // o pueden venir metadatos manuales si ya subiste por otra vía.
    // Caso update: NO re-subimos archivo, sólo metadata opcional.
    return [
      'file'         => ['nullable', 'file', 'max:51200'], // 50MB; ajusta a tu gusto
      'filename'     => ['nullable', 'string', 'max:200'],
      'mime'         => ['nullable', 'string', 'max:120'],
      'size_bytes'   => ['nullable', 'integer', 'min:0'],
      'storage_path' => ['nullable', 'string', 'max:300'],

      // Opcional: attach inmediato
      'attach_type'  => ['nullable', 'string', 'max:80'], // e.g. "App\\Models\\Tarea"
      'attach_id'    => ['nullable', 'integer'],
    ];
  }
}
