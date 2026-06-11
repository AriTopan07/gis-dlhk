<?php

namespace App\Http\Controllers;

use App\Models\Lokasi;
use App\Models\Pengawas;
use Illuminate\Http\Request;
use Inertia\Inertia;

class LokasiController extends Controller
{
    public function index(Request $request)
    {
        $search = $request->input('search');
        $user = auth()->user();
        $isKordinator = $user->hasRole('kordinator');
        $kordinatorId = $isKordinator ? $user->kordinator?->id : null;

        $lokasis = Lokasi::with(['pengawasPagi', 'pengawasSiang', 'pengawasMalam'])
            ->when($isKordinator, function ($query) use ($kordinatorId) {
                return $query->where(function ($q) use ($kordinatorId) {
                    $q->whereHas('pengawasPagi', function ($q2) use ($kordinatorId) {
                        $q2->where('kordinator_id', $kordinatorId);
                    })->orWhereHas('pengawasSiang', function ($q2) use ($kordinatorId) {
                        $q2->where('kordinator_id', $kordinatorId);
                    })->orWhereHas('pengawasMalam', function ($q2) use ($kordinatorId) {
                        $q2->where('kordinator_id', $kordinatorId);
                    });
                });
            })
            ->when($search, function ($query, $search) {
                return $query->where('lokasi', 'like', "%{$search}%");
            })
            ->orderBy('created_at', 'desc')
            ->paginate(10)
            ->withQueryString();

        $pengawasQuery = Pengawas::query();
        if ($isKordinator) {
            $pengawasQuery->where('kordinator_id', $kordinatorId);
        }
        $pengawas = $pengawasQuery->orderBy('nama')->get(['id', 'nama']);

        // Calculate summary stats
        $statsLokasi = Lokasi::when($isKordinator, function ($query) use ($kordinatorId) {
                return $query->where(function ($q) use ($kordinatorId) {
                    $q->whereHas('pengawasPagi', function ($q2) use ($kordinatorId) {
                        $q2->where('kordinator_id', $kordinatorId);
                    })->orWhereHas('pengawasSiang', function ($q2) use ($kordinatorId) {
                        $q2->where('kordinator_id', $kordinatorId);
                    })->orWhereHas('pengawasMalam', function ($q2) use ($kordinatorId) {
                        $q2->where('kordinator_id', $kordinatorId);
                    });
                });
        })->get(['kategori', 'type', 'path']);

        $totalLokasi = $statsLokasi->count();
        $totalJalan = $statsLokasi->where('kategori', 'jalan')->count();
        $totalTaman = $statsLokasi->where('kategori', 'taman')->count();

        $totalPanjang = 0;
        foreach ($statsLokasi->where('type', 'line') as $lok) {
            $path = $lok->path;
            if (is_array($path) && count($path) > 1) {
                for ($i = 0; $i < count($path) - 1; $i++) {
                    $lat1 = floatval($path[$i]['lat'] ?? 0);
                    $lng1 = floatval($path[$i]['lng'] ?? 0);
                    $lat2 = floatval($path[$i+1]['lat'] ?? 0);
                    $lng2 = floatval($path[$i+1]['lng'] ?? 0);
                    
                    if ($lat1 && $lng1 && $lat2 && $lng2) {
                        $R = 6371e3;
                        $p1 = $lat1 * pi() / 180;
                        $p2 = $lat2 * pi() / 180;
                        $dp = ($lat2 - $lat1) * pi() / 180;
                        $dl = ($lng2 - $lng1) * pi() / 180;
                        $a = sin($dp/2) * sin($dp/2) + cos($p1) * cos($p2) * sin($dl/2) * sin($dl/2);
                        $c = 2 * atan2(sqrt($a), sqrt(1-$a));
                        $totalPanjang += ($R * $c);
                    }
                }
            }
        }

        return Inertia::render('Lokasi/Index', [
            'lokasis'    => $lokasis,
            'filters'    => $request->only(['search']),
            'pengawas'   => $pengawas,
            'stats'      => [
                'total' => $totalLokasi,
                'jalan' => $totalJalan,
                'taman' => $totalTaman,
                'panjang' => $totalPanjang,
            ]
        ]);
    }

    public function create()
    {
        $user = auth()->user();
        $isKordinator = $user->hasRole('kordinator');
        $kordinatorId = $isKordinator ? $user->kordinator?->id : null;

        $pengawasQuery = Pengawas::withExists(['lokasiPagi', 'lokasiSiang', 'lokasiMalam']);
        if ($isKordinator) {
            $pengawasQuery->where('kordinator_id', $kordinatorId);
        }
        $pengawas = $pengawasQuery->orderBy('nama')->get(['id', 'nama']);

        return Inertia::render('Lokasi/Create', [
            'pengawas' => $pengawas,
        ]);
    }

    public function store(Request $request)
    {
        $user = auth()->user();
        $isKordinator = $user->hasRole('kordinator');
        $kordinatorId = $isKordinator ? $user->kordinator?->id : null;

        $validated = $request->validate([
            'lokasis'              => 'required|array',
            'lokasis.*.lokasi'     => 'required|string',
            'lokasis.*.kategori'   => 'required|in:jalan,taman',
            'lokasis.*.latitude'   => 'nullable|string',
            'lokasis.*.longitude'  => 'nullable|string',
            'lokasis.*.type'       => 'nullable|string',
            'lokasis.*.path'       => 'nullable|array',
            'lokasis.*.pengawas_pagi_id' => 'nullable|uuid|exists:pengawas,id',
            'lokasis.*.pengawas_siang_id' => 'nullable|uuid|exists:pengawas,id',
            'lokasis.*.pengawas_malam_id' => 'nullable|uuid|exists:pengawas,id',
        ]);

        foreach ($validated['lokasis'] as $item) {
            $pengawas_ids = array_filter([
                $item['pengawas_pagi_id'] ?? null, 
                $item['pengawas_siang_id'] ?? null, 
                $item['pengawas_malam_id'] ?? null
            ]);
            
            if ($isKordinator && count($pengawas_ids) > 0) {
                $invalidPengawas = Pengawas::whereIn('id', $pengawas_ids)->where('kordinator_id', '!=', $kordinatorId)->exists();
                if ($invalidPengawas) {
                    abort(403, 'Unauthorized.');
                }
            }

            Lokasi::create([
                'lokasi'        => $item['lokasi'],
                'kategori'      => $item['kategori'] ?? 'jalan',
                'type'          => $item['type'] ?? 'point',
                'latitude'      => $item['latitude'] ?? null,
                'longitude'     => $item['longitude'] ?? null,
                'path'          => $item['path'] ?? null,
                'pengawas_pagi_id'   => $item['pengawas_pagi_id'] ?? null,
                'pengawas_siang_id'  => $item['pengawas_siang_id'] ?? null,
                'pengawas_malam_id'  => $item['pengawas_malam_id'] ?? null,
            ]);
        }

        return redirect()->route('lokasi.index')->with('message', count($validated['lokasis']) . ' Lokasi berhasil ditambahkan.');
    }

    public function edit(Lokasi $lokasi)
    {
        $user = auth()->user();
        $isKordinator = $user->hasRole('kordinator');
        $kordinatorId = $isKordinator ? $user->kordinator?->id : null;

        if ($isKordinator) {
            $unauthorized = ($lokasi->pengawasPagi && $lokasi->pengawasPagi->kordinator_id !== $kordinatorId) ||
                            ($lokasi->pengawasSiang && $lokasi->pengawasSiang->kordinator_id !== $kordinatorId) ||
                            ($lokasi->pengawasMalam && $lokasi->pengawasMalam->kordinator_id !== $kordinatorId);
            if ($unauthorized) abort(403, 'Unauthorized.');
        }

        $pengawasQuery = Pengawas::withExists(['lokasiPagi', 'lokasiSiang', 'lokasiMalam']);
        if ($isKordinator) {
            $pengawasQuery->where('kordinator_id', $kordinatorId);
        }
        $pengawas = $pengawasQuery->orderBy('nama')->get(['id', 'nama']);

        return Inertia::render('Lokasi/Edit', [
            'lokasi'      => $lokasi,
            'pengawas'    => $pengawas,
        ]);
    }

    public function update(Request $request, Lokasi $lokasi)
    {
        $user = auth()->user();
        $isKordinator = $user->hasRole('kordinator');
        $kordinatorId = $isKordinator ? $user->kordinator?->id : null;

        if ($isKordinator) {
            $unauthorized = ($lokasi->pengawasPagi && $lokasi->pengawasPagi->kordinator_id !== $kordinatorId) ||
                            ($lokasi->pengawasSiang && $lokasi->pengawasSiang->kordinator_id !== $kordinatorId) ||
                            ($lokasi->pengawasMalam && $lokasi->pengawasMalam->kordinator_id !== $kordinatorId);
            if ($unauthorized) abort(403, 'Unauthorized.');
        }

        $validated = $request->validate([
            'lokasi'        => 'required|string',
            'kategori'      => 'required|in:jalan,taman',
            'latitude'      => 'nullable|string',
            'longitude'     => 'nullable|string',
            'type'          => 'nullable|string',
            'path'          => 'nullable|array',
            'pengawas_pagi_id'   => 'nullable|uuid|exists:pengawas,id',
            'pengawas_siang_id'  => 'nullable|uuid|exists:pengawas,id',
            'pengawas_malam_id'  => 'nullable|uuid|exists:pengawas,id',
        ]);

        $pengawas_ids = array_filter([
            $validated['pengawas_pagi_id'] ?? null, 
            $validated['pengawas_siang_id'] ?? null, 
            $validated['pengawas_malam_id'] ?? null
        ]);
        
        if ($isKordinator && count($pengawas_ids) > 0) {
            $invalidPengawas = Pengawas::whereIn('id', $pengawas_ids)->where('kordinator_id', '!=', $kordinatorId)->exists();
            if ($invalidPengawas) {
                abort(403, 'Unauthorized.');
            }
        }

        $lokasi->update($validated);

        return redirect()->route('lokasi.index')->with('message', 'Lokasi berhasil diperbarui.');
    }

    public function destroy(Lokasi $lokasi)
    {
        $user = auth()->user();
        $isKordinator = $user->hasRole('kordinator');
        $kordinatorId = $isKordinator ? $user->kordinator?->id : null;

        if ($isKordinator) {
            $unauthorized = ($lokasi->pengawasPagi && $lokasi->pengawasPagi->kordinator_id !== $kordinatorId) ||
                            ($lokasi->pengawasSiang && $lokasi->pengawasSiang->kordinator_id !== $kordinatorId) ||
                            ($lokasi->pengawasMalam && $lokasi->pengawasMalam->kordinator_id !== $kordinatorId);
            if ($unauthorized) abort(403, 'Unauthorized.');
        }

        $lokasi->delete();
        return redirect()->route('lokasi.index')->with('message', 'Lokasi berhasil dihapus.');
    }

    public function apiMarkers()
    {
        $lokasis = Lokasi::whereNotNull('latitude')
            ->whereNotNull('longitude')
            ->withCount('ulasan')
            ->withAvg('ulasan', 'rating')
            ->get(['id', 'lokasi', 'kategori', 'type', 'latitude', 'longitude', 'path'])
            ->map(function ($lokasi) {
                $lokasi->ulasan_avg = $lokasi->ulasan_avg_rating ? round($lokasi->ulasan_avg_rating, 1) : 0;
                $lokasi->ulasan_total = $lokasi->ulasan_count;
                return $lokasi;
            });

        return response()->json($lokasis);
    }

    public function apiDetail($id)
    {
        $lokasi = Lokasi::with(['pengawasPagi.petugas', 'pengawasSiang.petugas', 'pengawasMalam.petugas'])->find($id);

        if (!$lokasi) {
            return response()->json(['message' => 'Lokasi tidak ditemukan'], 404);
        }

        return response()->json($lokasi);
    }
}
