<?php

namespace App\Imports;

use Maatwebsite\Excel\Concerns\WithStartRow;
use Maatwebsite\Excel\Concerns\WithMultipleSheets;
use Maatwebsite\Excel\Concerns\WithCustomValueBinder;
use PhpOffice\PhpSpreadsheet\Cell\StringValueBinder;

class HierarkiPreviewImport extends StringValueBinder implements WithStartRow, WithMultipleSheets, WithCustomValueBinder
{
    public function startRow(): int
    {
        return 5;
    }

    public function sheets(): array
    {
        return [
            0 => $this, // Hanya ambil sheet pertama
        ];
    }
}
