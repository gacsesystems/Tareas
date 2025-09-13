<?php

namespace Database\Seeders;

use Illuminate\Support\Facades\DB;
use Illuminate\Database\Seeder;

class Catalogos extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        DB::table('areas')->insert([
            ['nombre' => 'Trabajo'],
            ['nombre' => 'Personal'],
        ]);

        DB::table('contextos')->insert([
            ['nombre' => 'Oficina'],
            ['nombre' => 'PC'],
            ['nombre' => 'Teléfono'],
            ['nombre' => 'Casa'],
        ]);
    }
}
