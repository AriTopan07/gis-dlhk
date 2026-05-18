<?php

namespace App\Exports;

use App\Models\Kordinator;
use App\Models\Pengawas;
use Maatwebsite\Excel\Concerns\FromArray;
use Maatwebsite\Excel\Concerns\WithTitle;
use Maatwebsite\Excel\Concerns\WithStyles;
use Maatwebsite\Excel\Concerns\WithColumnWidths;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;
use PhpOffice\PhpSpreadsheet\Style\Fill;
use PhpOffice\PhpSpreadsheet\Style\Alignment;
use PhpOffice\PhpSpreadsheet\Style\Border;

class TemplatePetugasSheet implements FromArray, WithTitle, WithStyles, WithColumnWidths
{
    public function title(): string
    {
        return 'Data Petugas';
    }

    public function array(): array
    {
        $rows = [];

        // Baris 1: Judul
        $rows[] = ['TEMPLATE IMPORT DATA PETUGAS - DLHK', '', '', '', '', '', ''];
        $rows[] = ['Petunjuk: Isi data petugas di bawah ini. Gunakan sheet "Referensi" untuk melihat daftar Kordinator dan Pengawas yang tersedia.', '', '', '', '', '', ''];
        $rows[] = ['']; // spasi

        // Baris header tabel
        $rows[] = [
            'NAMA PETUGAS',
            'NIK KTP',
            'NIP',
            'NAMA PENGAWAS (MANDOR)',
            'NAMA KORDINATOR',
            'NAMA LOKASI',
        ];

        // Baris contoh
        $rows[] = [
            'Contoh: Budi Santoso',
            '3515072211860001',
            '198611222025211088',
            'Nama Pengawas (lihat sheet Referensi)',
            'Nama Kordinator (lihat sheet Referensi)',
            'Kantor DLHK',
        ];

        // 50 baris kosong untuk diisi
        for ($i = 0; $i < 50; $i++) {
            $rows[] = ['', '', '', '', '', ''];
        }

        return $rows;
    }

    public function styles(Worksheet $sheet): array
    {
        // Merge cell judul
        $sheet->mergeCells('A1:F1');
        $sheet->mergeCells('A2:F2');

        // Freeze pane
        $sheet->freezePane('A5');

        return [
            // Baris 1 - Judul utama
            1 => [
                'font' => ['bold' => true, 'size' => 14, 'color' => ['rgb' => 'FFFFFF']],
                'fill' => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['rgb' => '047857']],
                'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER, 'vertical' => Alignment::VERTICAL_CENTER],
            ],
            // Baris 2 - Petunjuk
            2 => [
                'font' => ['italic' => true, 'size' => 10, 'color' => ['rgb' => '374151']],
                'fill' => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['rgb' => 'D1FAE5']],
                'alignment' => ['horizontal' => Alignment::HORIZONTAL_LEFT, 'wrapText' => true],
            ],
            // Baris 4 - Header kolom
            4 => [
                'font' => ['bold' => true, 'size' => 11, 'color' => ['rgb' => 'FFFFFF']],
                'fill' => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['rgb' => '065F46']],
                'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER, 'vertical' => Alignment::VERTICAL_CENTER],
                'borders' => [
                    'allBorders' => [
                        'borderStyle' => Border::BORDER_THIN,
                        'color' => ['rgb' => '6EE7B7'],
                    ],
                ],
            ],
            // Baris 5 - Baris contoh
            5 => [
                'font' => ['italic' => true, 'color' => ['rgb' => '6B7280']],
                'fill' => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['rgb' => 'F9FAFB']],
            ],
        ];
    }

    public function columnWidths(): array
    {
        return [
            'A' => 30, // Nama Petugas
            'B' => 22, // NIK KTP
            'C' => 22, // NIP
            'D' => 30, // Nama Pengawas
            'E' => 30, // Nama Kordinator
            'F' => 25, // Nama Lokasi
        ];
    }
}
