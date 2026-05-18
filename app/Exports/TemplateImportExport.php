<?php

namespace App\Exports;

use Maatwebsite\Excel\Concerns\WithMultipleSheets;

class TemplateImportExport implements WithMultipleSheets
{
    public function sheets(): array
    {
        return [
            'DATA IMPORT'  => new TemplateImportDataSheet(),
            'PETUNJUK'     => new TemplateImportPetunjukSheet(),
        ];
    }
}
