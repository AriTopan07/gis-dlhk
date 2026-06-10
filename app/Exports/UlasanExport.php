<?php

namespace App\Exports;

use App\Models\Ulasan;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Maatwebsite\Excel\Concerns\FromQuery;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;
use Maatwebsite\Excel\Concerns\WithStyles;
use Maatwebsite\Excel\Concerns\WithColumnWidths;
use Maatwebsite\Excel\Concerns\WithTitle;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;
use PhpOffice\PhpSpreadsheet\Style\Fill;
use PhpOffice\PhpSpreadsheet\Style\Alignment;

class UlasanExport implements FromQuery, WithHeadings, WithMapping, WithStyles, WithColumnWidths, WithTitle
{
    protected array $filters;
    protected int $rowNum = 1;

    public function __construct(array $filters = [])
    {
        $this->filters = $filters;
    }

    public function title(): string
    {
        return 'Data Ulasan';
    }

    public function query()
    {
        $query = Ulasan::with(['user', 'kordinator.user', 'lokasi'])
            ->orderBy('created_at', 'desc');

        if (!empty($this->filters['search'])) {
            $search = $this->filters['search'];
            $query->where(function ($q) use ($search) {
                $q->where('komentar', 'like', "%{$search}%")
                  ->orWhereHas('lokasi', fn($q2) => $q2->where('lokasi', 'like', "%{$search}%"))
                  ->orWhereHas('kordinator', fn($q2) => $q2->where('nama', 'like', "%{$search}%"));
            });
        }

        if (!empty($this->filters['rating']) && $this->filters['rating'] !== 'all') {
            $query->where('rating', $this->filters['rating']);
        }

        if (!empty($this->filters['status']) && $this->filters['status'] !== 'all') {
            $query->where('status', $this->filters['status']);
        }

        if (!empty($this->filters['lokasi_id'])) {
            $query->where('lokasi_id', $this->filters['lokasi_id']);
        }

        return $query;
    }

    public function headings(): array
    {
        return [
            'No',
            'Nama',
            'Lokasi TPS',
            'Rating',
            'Komentar',
            'Tanggal',
            'Jam',
            'Status',
        ];
    }

    public function map($ulasan): array
    {
        $nama = $ulasan->user?->name
            ?? $ulasan->kordinator?->user?->name
            ?? $ulasan->kordinator?->nama
            ?? 'Unknown';

        return [
            $this->rowNum++,
            $nama,
            $ulasan->lokasi?->lokasi ?? '-',
            $ulasan->rating . ' / 5',
            $ulasan->komentar ?? '-',
            Carbon::parse($ulasan->created_at)->translatedFormat('d F Y'),
            Carbon::parse($ulasan->created_at)->format('H:i') . ' WIB',
            ucfirst($ulasan->status),
        ];
    }

    public function styles(Worksheet $sheet): array
    {
        return [
            // Header row
            1 => [
                'font' => ['bold' => true, 'color' => ['rgb' => 'FFFFFF'], 'size' => 11],
                'fill' => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['rgb' => '047857']],
                'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER, 'vertical' => Alignment::VERTICAL_CENTER],
            ],
        ];
    }

    public function columnWidths(): array
    {
        return [
            'A' => 6,
            'B' => 24,
            'C' => 36,
            'D' => 10,
            'E' => 50,
            'F' => 18,
            'G' => 12,
            'H' => 14,
        ];
    }
}
