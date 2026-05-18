<?php

namespace App\Exports;

use App\Models\Kordinator;
use App\Models\Pengawas;
use App\Models\Lokasi;
use Maatwebsite\Excel\Concerns\FromArray;
use Maatwebsite\Excel\Concerns\WithTitle;
use Maatwebsite\Excel\Concerns\WithStyles;
use Maatwebsite\Excel\Concerns\WithColumnWidths;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;
use PhpOffice\PhpSpreadsheet\Style\Fill;
use PhpOffice\PhpSpreadsheet\Style\Alignment;
use PhpOffice\PhpSpreadsheet\Style\Border;

class TemplatePetugasReferensiSheet implements FromArray, WithTitle, WithStyles, WithColumnWidths
{
    public function title(): string
    {
        return 'Referensi';
    }

    public function array(): array
    {
        $rows = [];

        // Judul
        $rows[] = ['DATA REFERENSI - DAFTAR KORDINATOR, PENGAWAS & LOKASI', '', '', '', ''];
        $rows[] = ['']; // spasi

        // Header blok Kordinator & Pengawas
        $rows[] = ['KORDINATOR', 'PENGAWAS', '', 'LOKASI', ''];
        $rows[] = ['Nama Kordinator', 'Nama Pengawas', '', 'Nama Lokasi', ''];

        // Ambil semua kordinator dengan pengawas-nya
        $kordinators = Kordinator::with('pengawas')->get();
        $lokasis = Lokasi::all();

        $rowIndex = 5; // mulai dari baris ke-5

        foreach ($kordinators as $kordinator) {
            if ($kordinator->pengawas->isEmpty()) {
                $rows[] = [$kordinator->nama, '(belum ada pengawas)', '', '', ''];
            } else {
                foreach ($kordinator->pengawas as $pengawas) {
                    $lokasi = $lokasis->get($rowIndex - 5); // Ambil lokasi paralel jika ada
                    $rows[] = [
                        $kordinator->nama,
                        $pengawas->nama,
                        '',
                        $lokasi ? $lokasi->lokasi : '',
                        '',
                    ];
                    $rowIndex++;
                }
            }
        }

        // Jika masih ada sisa lokasi yang belum ditampilkan
        $dataRowCount = $rowIndex - 5;
        $remainingLokasis = $lokasis->slice($dataRowCount);
        foreach ($remainingLokasis as $lokasi) {
            $rows[] = ['', '', '', $lokasi->lokasi, ''];
        }

        return $rows;
    }

    public function styles(Worksheet $sheet): array
    {
        // Merge judul
        $sheet->mergeCells('A1:E1');

        return [
            // Baris 1 - Judul
            1 => [
                'font' => ['bold' => true, 'size' => 13, 'color' => ['rgb' => 'FFFFFF']],
                'fill' => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['rgb' => '047857']],
                'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER],
            ],
            // Baris 3 - Header grup
            3 => [
                'font' => ['bold' => true, 'size' => 11, 'color' => ['rgb' => 'FFFFFF']],
                'fill' => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['rgb' => '065F46']],
                'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER],
            ],
            // Baris 4 - Sub-header
            4 => [
                'font' => ['bold' => true, 'color' => ['rgb' => '374151']],
                'fill' => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['rgb' => 'D1FAE5']],
                'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER],
            ],
        ];
    }

    public function columnWidths(): array
    {
        return [
            'A' => 32, // Kordinator
            'B' => 32, // Pengawas
            'C' => 5,  // spasi
            'D' => 32, // Lokasi
            'E' => 5,  // spasi
        ];
    }
}
