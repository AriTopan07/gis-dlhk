<?php

namespace App\Imports;

use Maatwebsite\Excel\Concerns\WithMultipleSheets;

class HierarkiImport implements WithMultipleSheets
{
    public HierarkiSheetImport $sheetImport;

    public function __construct()
    {
        $this->sheetImport = new HierarkiSheetImport();
    }

    public function sheets(): array
    {
        return [
            0 => $this->sheetImport, // Hanya import sheet pertama (DATA IMPORT)
        ];
    }
}
