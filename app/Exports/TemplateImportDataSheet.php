<?php

namespace App\Exports;

use Maatwebsite\Excel\Concerns\FromArray;
use Maatwebsite\Excel\Concerns\WithTitle;
use Maatwebsite\Excel\Concerns\WithStyles;
use Maatwebsite\Excel\Concerns\WithColumnWidths;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;
use PhpOffice\PhpSpreadsheet\Style\Fill;
use PhpOffice\PhpSpreadsheet\Style\Alignment;
use PhpOffice\PhpSpreadsheet\Style\Border;
use PhpOffice\PhpSpreadsheet\Style\Font;
use PhpOffice\PhpSpreadsheet\Style\NumberFormat;
use Maatwebsite\Excel\Concerns\WithColumnFormatting;
use Maatwebsite\Excel\Concerns\WithCustomValueBinder;
use PhpOffice\PhpSpreadsheet\Cell\StringValueBinder;

class TemplateImportDataSheet extends StringValueBinder implements FromArray, WithTitle, WithStyles, WithColumnWidths, WithColumnFormatting, WithCustomValueBinder
{
    public function title(): string
    {
        return 'DATA IMPORT';
    }

    public function array(): array
    {
        $rows = [];

        // Baris 1: Judul utama
        $rows[] = ['TEMPLATE IMPORT DATA HIERARKI - DLHK', '', '', '', '', '', ''];

        // Baris 2: Sub-judul
        $rows[] = ['Sistem Informasi Dinas Lingkungan Hidup dan Kebersihan Kabupaten Sidoarjo', '', '', '', '', '', ''];

        // Baris 3: Petunjuk singkat
        $rows[] = ['PETUNJUK: Isi data di bawah mulai baris ke-5. Baris kosong pada kolom Kordinator/Pengawas = mengikuti baris sebelumnya. Lihat sheet PETUNJUK untuk panduan lengkap.', '', '', '', '', '', ''];

        // Baris 4: Header kolom
        $rows[] = [
            'NAMA KORDINATOR',
            'NIP KORDINATOR',
            'EMAIL KORDINATOR',
            'PASSWORD KORDINATOR',
            'NAMA PENGAWAS (MANDOR)',
            'NIP PENGAWAS',
            'NAMA PETUGAS',
            'NIK KTP PETUGAS',
            'NIP PETUGAS',
            'SHIFT PETUGAS',
        ];

        // Baris 5-6: Contoh pengisian
        $rows[] = ['Andi Sumarno',     '198501012020011001', 'andi@dlhk.go.id', 'password123', 'Budi Santoso',   '198001012010011005', 'Fatchul Muin',          '3515072211860001', '198611222025211088', 'Pagi'];
        $rows[] = ['',                  '',                   '',                '',             '',               '',                   'Ian Anugrish',          '3515811110190900002', '199001112025211122', 'Siang'];
        $rows[] = ['',                  '',                   '',                '',             '',               '',                   'Camelia Novi Ika P.',   '3515084611890900003', '', 'Malam'];
        $rows[] = ['',                  '',                   '',                '',             'Desi Ariani',    '198205052015022003', 'Brilian Salsabina',     '3578014805030200012', '200303080252501012', 'Pagi'];
        $rows[] = ['Siti Rahayu',       '197803152019012002', 'siti@dlhk.go.id', 'password456', 'Ahmad Yusuf',    '198302022011031006', 'Rian Maulana',          '3515011503850001',   '', 'Siang'];
        $rows[] = ['',                  '',                   '',                '',             '',               '',                   'Wahyu Santoso',         '3515081209870002',   '', 'Malam'];

        // 90 baris kosong untuk diisi
        for ($i = 0; $i < 90; $i++) {
            $rows[] = ['', '', '', '', '', '', '', '', '', ''];
        }

        return $rows;
    }

    public function styles(Worksheet $sheet): array
    {
        // Merge judul
        $sheet->mergeCells('A1:J1');
        $sheet->mergeCells('A2:J2');
        $sheet->mergeCells('A3:J3');

        // Tinggi baris
        $sheet->getRowDimension(1)->setRowHeight(30);
        $sheet->getRowDimension(3)->setRowHeight(30);
        $sheet->getRowDimension(4)->setRowHeight(24);

        // Freeze baris header
        $sheet->freezePane('A5');

        // Shading baris contoh (5-10) – warna beda biru muda
        foreach (range(5, 10) as $r) {
            $sheet->getStyle("A{$r}:J{$r}")->applyFromArray([
                'fill' => [
                    'fillType'   => Fill::FILL_SOLID,
                    'startColor' => ['rgb' => 'EFF6FF'],
                ],
                'font' => ['color' => ['rgb' => '64748B'], 'italic' => true],
                'borders' => [
                    'allBorders' => [
                        'borderStyle' => Border::BORDER_THIN,
                        'color'       => ['rgb' => 'DBEAFE'],
                    ],
                ],
            ]);
        }

        return [
            // Baris 1 - Judul utama
            1 => [
                'font'      => ['bold' => true, 'size' => 15, 'color' => ['rgb' => 'FFFFFF']],
                'fill'      => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['rgb' => '065F46']],
                'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER, 'vertical' => Alignment::VERTICAL_CENTER],
            ],
            // Baris 2 - Sub-judul
            2 => [
                'font'      => ['size' => 10, 'color' => ['rgb' => 'FFFFFF'], 'italic' => true],
                'fill'      => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['rgb' => '047857']],
                'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER],
            ],
            // Baris 3 - Petunjuk singkat
            3 => [
                'font'      => ['size' => 9, 'color' => ['rgb' => '374151'], 'italic' => true],
                'fill'      => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['rgb' => 'D1FAE5']],
                'alignment' => ['horizontal' => Alignment::HORIZONTAL_LEFT, 'wrapText' => true, 'vertical' => Alignment::VERTICAL_CENTER],
            ],
            // Baris 4 - Header kolom
            4 => [
                'font'      => ['bold' => true, 'size' => 11, 'color' => ['rgb' => 'FFFFFF']],
                'fill'      => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['rgb' => '064E3B']],
                'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER, 'vertical' => Alignment::VERTICAL_CENTER, 'wrapText' => true],
                'borders'   => [
                    'allBorders' => [
                        'borderStyle' => Border::BORDER_THIN,
                        'color'       => ['rgb' => '6EE7B7'],
                    ],
                ],
            ],
        ];
    }

    public function columnWidths(): array
    {
        return [
            'A' => 30, // Nama Kordinator
            'B' => 24, // NIP Kordinator
            'C' => 28, // Email Kordinator
            'D' => 24, // Password Kordinator
            'E' => 30, // Nama Pengawas
            'F' => 24, // NIP Pengawas
            'G' => 30, // Nama Petugas
            'H' => 22, // NIK KTP Petugas
            'I' => 22, // NIP Petugas
            'J' => 18, // Shift Petugas
        ];
    }

    public function columnFormats(): array
    {
        return [
            'B' => NumberFormat::FORMAT_TEXT, // NIP Kordinator
            'F' => NumberFormat::FORMAT_TEXT, // NIP Pengawas
            'H' => NumberFormat::FORMAT_TEXT, // NIK KTP Petugas
            'I' => NumberFormat::FORMAT_TEXT, // NIP Petugas
        ];
    }
}
