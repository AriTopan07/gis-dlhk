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

class TemplateImportPetunjukSheet implements FromArray, WithTitle, WithStyles, WithColumnWidths
{
    public function title(): string
    {
        return 'PETUNJUK';
    }

    public function array(): array
    {
        return [
            ['PANDUAN PENGISIAN TEMPLATE IMPORT DATA HIERARKI DLHK', ''],
            [''],
            ['STRUKTUR HIERARKI', ''],
            ['Kordinator  →  Pengawas (Mandor)  →  Petugas', ''],
            [''],
            ['ATURAN PENGISIAN', ''],
            ['Kolom',           'Keterangan'],
            ['NAMA KORDINATOR', 'Wajib diisi di baris pertama kordinator. Biarkan KOSONG jika baris berikutnya masih milik kordinator yang sama.'],
            ['NIP KORDINATOR',  'Wajib diisi bersama nama kordinator. Digunakan sebagai username login. Harus unik.'],
            ['EMAIL KORDINATOR','Opsional. Bisa dikosongkan.'],
            ['PASSWORD KORDINATOR', 'Opsional. Jika dikosongkan, password default = NIP Kordinator.'],
            ['NAMA PENGAWAS',   'Wajib diisi di baris pertama pengawas. Biarkan KOSONG jika baris berikutnya masih milik pengawas yang sama.'],
            ['NAMA PETUGAS',    'Wajib diisi. Satu baris = satu petugas.'],
            ['NIK KTP PETUGAS', 'Opsional. Nomor Induk Kependudukan (Maksimal 20 digit).'],
            ['NIP PETUGAS',     'Opsional. Nomor Induk Pegawai Petugas (Maksimal 30 digit).'],
            ['SHIFT PETUGAS',   'Opsional. Isi dengan salah satu: Pagi, Siang, atau Malam.'],
            [''],
            ['CONTOH PENGISIAN', ''],
            ['Baris', 'NAMA KORDINATOR | NIP KORDINATOR | EMAIL | PASSWORD | NAMA PENGAWAS | NAMA PETUGAS | NIK KTP PETUGAS | NIP PETUGAS | SHIFT PETUGAS'],
            ['5',     'Andi Sumarno | 198501012020011001 | andi@dlhk.go.id | password123 | Budi Santoso | Fatchul Muin | 3515072211860001 | 198611222025211088 | Pagi'],
            ['6',     '(kosong) | (kosong) | (kosong) | (kosong) | (kosong) | Ian Anugrish | 3515811110190900002 | 199001112025211122 | Siang'],
            ['7',     '(kosong) | (kosong) | (kosong) | (kosong) | Desi Ariani | Brilian Salsabina | 3578014805030200012 | 200303080252501012 | Malam'],
            ['8',     'Siti Rahayu | 197803152019012002 | (kosong) | (kosong) | Ahmad Yusuf | Rian Maulana | 3515011503850001 | (kosong) | Pagi'],
            [''],
            ['CATATAN PENTING', ''],
            ['1.', 'Data mulai diisi dari BARIS KE-5 (baris 1-4 adalah header template).'],
            ['2.', 'Kordinator yang NIP-nya sudah terdaftar di sistem tidak akan diduplikasi.'],
            ['3.', 'Pengawas yang sudah terdaftar di bawah kordinator yang sama tidak akan diduplikasi.'],
            ['4.', 'Jika ada error pada satu baris, baris lain tetap diproses.'],
            ['5.', 'Setelah upload, sistem akan menampilkan laporan hasil import per baris.'],
        ];
    }

    public function styles(Worksheet $sheet): array
    {
        $sheet->mergeCells('A1:B1');
        $sheet->mergeCells('A3:B3');
        $sheet->mergeCells('A4:B4');
        $sheet->mergeCells('A6:B6');
        $sheet->mergeCells('A17:B17');
        $sheet->mergeCells('A23:B23');

        return [
            1  => ['font' => ['bold' => true, 'size' => 14, 'color' => ['rgb' => 'FFFFFF']], 'fill' => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['rgb' => '065F46']], 'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER]],
            3  => ['font' => ['bold' => true, 'size' => 12, 'color' => ['rgb' => 'FFFFFF']], 'fill' => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['rgb' => '047857']], 'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER]],
            6  => ['font' => ['bold' => true, 'size' => 11, 'color' => ['rgb' => 'FFFFFF']], 'fill' => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['rgb' => '047857']]],
            7  => ['font' => ['bold' => true], 'fill' => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['rgb' => 'D1FAE5']]],
            17 => ['font' => ['bold' => true, 'size' => 11, 'color' => ['rgb' => 'FFFFFF']], 'fill' => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['rgb' => '047857']]],
            18 => ['font' => ['bold' => true], 'fill' => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['rgb' => 'D1FAE5']]],
            23 => ['font' => ['bold' => true, 'size' => 11, 'color' => ['rgb' => 'FFFFFF']], 'fill' => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['rgb' => '047857']]],
        ];
    }

    public function columnWidths(): array
    {
        return ['A' => 10, 'B' => 90];
    }
}
