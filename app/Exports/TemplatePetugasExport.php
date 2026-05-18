<?php

namespace App\Exports;

use App\Models\Kordinator;
use App\Models\Pengawas;
use App\Models\Lokasi;
use Maatwebsite\Excel\Concerns\WithMultipleSheets;

class TemplatePetugasExport implements WithMultipleSheets
{
    public function sheets(): array
    {
        return [
            'Data Petugas' => new TemplatePetugasSheet(),
            'Referensi'    => new TemplatePetugasReferensiSheet(),
        ];
    }
}
