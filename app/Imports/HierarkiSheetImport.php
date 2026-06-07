<?php

namespace App\Imports;

use App\Models\Kordinator;
use App\Models\Pengawas;
use App\Models\Petugas;
use App\Models\User;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Maatwebsite\Excel\Concerns\ToCollection;
use Maatwebsite\Excel\Concerns\WithStartRow;
use Maatwebsite\Excel\Concerns\WithCustomValueBinder;
use PhpOffice\PhpSpreadsheet\Cell\StringValueBinder;

class HierarkiSheetImport extends StringValueBinder implements ToCollection, WithStartRow, WithCustomValueBinder
{
    public array $results = [];
    public int $created_kordinators = 0;
    public int $created_pengawas   = 0;
    public int $created_petugas    = 0;
    public int $skipped            = 0;

    private ?Kordinator $lastKordinator = null;
    private ?Pengawas   $lastPengawas   = null;

    // Data mulai dari baris 5
    public function startRow(): int
    {
        return 5;
    }

    public function collection(Collection $rows)
    {
        foreach ($rows as $index => $row) {
            $rowNum = $index + 5; 

            // Konversi ke array string & trim
            $r = $row->toArray();

            $namaKordinator  = trim($r[0] ?? '');
            $nipKordinator   = trim($r[1] ?? '');
            $emailKordinator = trim($r[2] ?? '');
            $passKordinator  = trim($r[3] ?? '');
            $namaPengawas    = trim($r[4] ?? '');
            $nipPengawas     = trim($r[5] ?? '');
            $namaPetugas     = trim($r[6] ?? '');
            $nikKtpPetugas   = trim($r[7] ?? '');
            $nipPetugas      = trim($r[8] ?? '');

            // Lewati baris kosong total
            if (!$namaKordinator && !$namaPengawas && !$namaPetugas) {
                continue;
            }

            try {
                DB::beginTransaction();

                // ── KORDINATOR ──────────────────────────────────────────
                if ($namaKordinator) {
                    if (!$nipKordinator) {
                        $this->addResult($rowNum, 'warning', "Baris $rowNum: NIP Kordinator '$namaKordinator' kosong, dilewati.");
                        $this->skipped++;
                        DB::rollBack();
                        continue;
                    }

                    // Cek apakah user dengan NIP ini sudah ada
                    $user = User::where('nip', $nipKordinator)->first();

                    if (!$user && $emailKordinator) {
                        // Coba cari berdasarkan email jika NIP tidak ketemu (mungkin karena NIP lama terpotong oleh Excel)
                        $user = User::where('email', $emailKordinator)->first();
                        
                        // Jika ketemu, update NIP-nya ke NIP yang benar (Self-Healing)
                        if ($user && $user->nip !== $nipKordinator) {
                            $user->update(['nip' => $nipKordinator]);
                        }
                    }

                    if (!$user) {
                        // Buat user baru
                        $password = $passKordinator ?: $nipKordinator; // default = NIP
                        $user = User::create([
                            'name'     => $namaKordinator,
                            'nip'      => $nipKordinator,
                            'email'    => $emailKordinator ?: null,
                            'password' => Hash::make($password),
                        ]);
                        $user->assignRole('kordinator');

                        $kordinator = Kordinator::create([
                            'nama'    => $namaKordinator,
                            'user_id' => $user->id,
                        ]);
                        $this->created_kordinators++;
                    } else {
                        // Gunakan kordinator yang sudah ada
                        $kordinator = Kordinator::where('user_id', $user->id)->first();
                        if (!$kordinator) {
                            $kordinator = Kordinator::create([
                                'nama'    => $namaKordinator,
                                'user_id' => $user->id,
                            ]);
                            $this->created_kordinators++;
                        }
                    }

                    $this->lastKordinator = $kordinator;
                    $this->lastPengawas   = null; // reset pengawas saat kordinator berganti
                }

                // ── PENGAWAS ─────────────────────────────────────────────
                if ($namaPengawas) {
                    if (!$this->lastKordinator) {
                        $this->addResult($rowNum, 'warning', "Baris $rowNum: Pengawas '$namaPengawas' tidak memiliki Kordinator, dilewati.");
                        $this->skipped++;
                        DB::rollBack();
                        continue;
                    }

                    $pengawas = Pengawas::firstOrCreate(
                        [
                            'nama'          => $namaPengawas,
                            'kordinator_id' => $this->lastKordinator->id,
                        ],
                        [
                            'nip'           => $nipPengawas ?: null,
                        ]
                    );

                    if ($pengawas->wasRecentlyCreated) {
                        $this->created_pengawas++;
                    }

                    $this->lastPengawas = $pengawas;
                }

                // ── PETUGAS ──────────────────────────────────────────────
                if ($namaPetugas) {
                    if (!$this->lastPengawas) {
                        $this->addResult($rowNum, 'warning', "Baris $rowNum: Petugas '$namaPetugas' tidak memiliki Pengawas, dilewati.");
                        $this->skipped++;
                        DB::rollBack();
                        continue;
                    }

                    Petugas::create([
                        'nama'        => $namaPetugas,
                        'pengawas_id' => $this->lastPengawas->id,
                        'nik_ktp'     => $nikKtpPetugas ?: null,
                        'nip'         => $nipPetugas    ?: null,
                    ]);
                    $this->created_petugas++;
                }

                DB::commit();

            } catch (\Throwable $e) {
                DB::rollBack();
                $this->addResult($rowNum, 'error', "Baris $rowNum: Error — " . $e->getMessage());
                $this->skipped++;
            }
        }
    }

    private function addResult(int $row, string $type, string $message): void
    {
        $this->results[] = compact('row', 'type', 'message');
    }
}
