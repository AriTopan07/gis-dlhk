<?php

namespace App\Http\Controllers;

use App\Exports\TemplateImportExport;
use App\Imports\HierarkiImport;
use App\Imports\HierarkiPreviewImport;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Maatwebsite\Excel\Facades\Excel;

class ImportController extends Controller
{
    public function index()
    {
        return Inertia::render('Import/Index');
    }

    public function downloadTemplate()
    {
        return Excel::download(new TemplateImportExport(), 'template-import-data-hierarki.xlsx');
    }

    public function preview(Request $request)
    {
        $request->validate([
            'file' => 'required|file|mimes:xlsx,xls|max:10240',
        ], [
            'file.required' => 'File wajib dipilih.',
            'file.mimes'    => 'File harus berformat Excel (.xlsx atau .xls).',
            'file.max'      => 'Ukuran file maksimal 10MB.',
        ]);

        try {
            // Simpan file sementara
            $path = $request->file('file')->store('temp_imports');
            
            // Baca data tanpa menyimpan ke DB
            $array = Excel::toArray(new HierarkiPreviewImport(), $path);
            
            $rows = $array[0] ?? []; // Sheet pertama
            $previewData = [];
            
            foreach ($rows as $index => $row) {
                $rowNum = $index + 5;
                $namaKordinator  = trim($row[0] ?? '');
                $nipKordinator   = trim($row[1] ?? '');
                $emailKordinator = trim($row[2] ?? '');
                $passKordinator  = trim($row[3] ?? '');
                $namaPengawas    = trim($row[4] ?? '');
                $nipPengawas     = trim($row[5] ?? '');
                $namaPetugas     = trim($row[6] ?? '');
                $nikKtpPetugas   = trim($row[7] ?? '');
                $nipPetugas      = trim($row[8] ?? '');

                if (!$namaKordinator && !$namaPengawas && !$namaPetugas) {
                    continue; // Skip baris kosong
                }

                $errors = [];
                if ($namaKordinator && !$nipKordinator) {
                    $errors[] = "NIP Kordinator kosong";
                }
                
                if ($nipKordinator) {
                    // Beri peringatan jika user sudah ada
                    $userByNip = User::where('nip', $nipKordinator)->first();
                    if ($userByNip) {
                        $errors[] = "(Info) NIP sudah terdaftar, akan ditautkan.";
                    } else if ($emailKordinator) {
                        $userByEmail = User::where('email', $emailKordinator)->first();
                        if ($userByEmail) {
                            $errors[] = "(Info) Email sudah terdaftar, NIP akan diupdate.";
                        }
                    }
                }
                
                if ($nipPengawas) {
                    $pengawasByNip = \App\Models\Pengawas::where('nip', $nipPengawas)->first();
                    if ($pengawasByNip) {
                        $errors[] = "(Info) NIP Pengawas terdaftar, akan ditautkan.";
                    }
                }

                if ($nikKtpPetugas) {
                    $petugasByNik = \App\Models\Petugas::where('nik_ktp', $nikKtpPetugas)->first();
                    if ($petugasByNik) {
                        $errors[] = "(Skip) NIK Petugas sudah terdaftar";
                    }
                }

                if ($nipPetugas) {
                    $petugasByNip = \App\Models\Petugas::where('nip', $nipPetugas)->first();
                    if ($petugasByNip) {
                        $errors[] = "(Skip) NIP Petugas sudah terdaftar";
                    }
                }

                $previewData[] = [
                    'row'        => $rowNum,
                    'kordinator' => $namaKordinator,
                    'nip_kord'   => $nipKordinator,
                    'pengawas'   => $namaPengawas,
                    'nip_pengawas'=> $nipPengawas,
                    'petugas'    => $namaPetugas,
                    'nik_petugas'=> $nikKtpPetugas,
                    'nip_petugas'=> $nipPetugas,
                    'status'     => count($errors) > 0 ? implode(', ', $errors) : 'Valid',
                    'is_error'   => count($errors) > 0 && strpos($errors[0], '(Info)') === false && strpos($errors[0], '(Skip)') === false,
                ];
            }

            return back()->with([
                'previewData' => $previewData,
                'filePath'    => $path,
            ]);

        } catch (\Maatwebsite\Excel\Validators\ValidationException $e) {
            return back()->withErrors(['file' => 'Format file tidak valid.']);
        } catch (\Throwable $e) {
            return back()->withErrors(['file' => 'Gagal membaca file: ' . $e->getMessage()]);
        }
    }

    public function process(Request $request)
    {
        $request->validate([
            'file_path' => 'required|string',
        ]);

        $path = $request->file_path;

        if (!Storage::exists($path)) {
            return back()->withErrors(['file' => 'File sementara tidak ditemukan. Silakan upload ulang.']);
        }

        $import = new HierarkiImport();

        try {
            Excel::import($import, $path);
            Storage::delete($path); // Hapus setelah selesai
        } catch (\Throwable $e) {
            return back()->withErrors(['file' => 'Gagal mengimport data: ' . $e->getMessage()]);
        }

        $summary = [
            'kordinators' => $import->sheetImport->created_kordinators ?? 0,
            'pengawas'    => $import->sheetImport->created_pengawas ?? 0,
            'petugas'     => $import->sheetImport->created_petugas ?? 0,
            'skipped'     => $import->sheetImport->skipped ?? 0,
            'results'     => $import->sheetImport->results ?? [],
        ];

        return back()->with([
            'success'       => "Import selesai! {$summary['kordinators']} kordinator, {$summary['pengawas']} pengawas, {$summary['petugas']} petugas berhasil diimport.",
            'importSummary' => $summary,
        ]);
    }

    public function cancel(Request $request)
    {
        $path = $request->file_path;
        if ($path && Storage::exists($path)) {
            Storage::delete($path);
        }
        return back();
    }
}
