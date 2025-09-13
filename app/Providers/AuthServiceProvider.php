<?php

namespace App\Providers;

use App\Models\Tarea;
use App\Policies\TareaPolicy;
use Illuminate\Foundation\Support\Providers\AuthServiceProvider as ServiceProvider;

class AuthServiceProvider extends ServiceProvider
{
  protected $policies = [
    //   Tarea::class => TareaPolicy::class,
  ];

  public function boot(): void
  {
    $this->registerPolicies();
  }
}
