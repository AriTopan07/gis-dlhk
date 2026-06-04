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

        $lokasis = Lokasi::with('pengawas')
            ->when($isKordinator, function ($query) use ($kordinatorId) {
                return $query->whereHas('pengawas', function ($q) use ($kordinatorId) {
                    $q->where('kordinator_id', $kordinatorId);
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

        return Inertia::render('Lokasi/Index', [
            'lokasis'    => $lokasis,
            'filters'    => $request->only(['search']),
            'pengawas'   => $pengawas,
        ]);
    }

    public function create()
    {
        $user = auth()->user();
        $isKordinator = $user->hasRole('kordinator');
        $kordinatorId = $isKordinator ? $user->kordinator?->id : null;

        $pengawasQuery = Pengawas::withExists('lokasi');
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
            'lokasis.*.latitude'   => 'nullable|string',
            'lokasis.*.longitude'  => 'nullable|string',
            'lokasis.*.type'       => 'nullable|string',
            'lokasis.*.path'       => 'nullable|array',
            'lokasis.*.pengawas_id' => 'nullable|uuid|exists:pengawas,id',
        ]);

        foreach ($validated['lokasis'] as $item) {
            if (!empty($item['pengawas_id'])) {
                $pengawas = Pengawas::find($item['pengawas_id']);
                if ($isKordinator && (!$pengawas || $pengawas->kordinator_id !== $kordinatorId)) {
                    abort(403, 'Unauthorized.');
                }
            }

            Lokasi::create([
                'lokasi'        => $item['lokasi'],
                'type'          => $item['type'] ?? 'point',
                'latitude'      => $item['latitude'] ?? null,
                'longitude'     => $item['longitude'] ?? null,
                'path'          => $item['path'] ?? null,
                'pengawas_id'   => $item['pengawas_id'] ?? null,
            ]);
        }

        return redirect()->route('lokasi.index')->with('message', count($validated['lokasis']) . ' Lokasi berhasil ditambahkan.');
    }

    public function edit(Lokasi $lokasi)
    {
        $user = auth()->user();
        $isKordinator = $user->hasRole('kordinator');
        $kordinatorId = $isKordinator ? $user->kordinator?->id : null;

        if ($isKordinator && $lokasi->pengawas?->kordinator_id !== $kordinatorId) {
            abort(403, 'Unauthorized.');
        }

        $pengawasQuery = Pengawas::withExists('lokasi');
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

        if ($isKordinator && $lokasi->pengawas?->kordinator_id !== $kordinatorId) {
            abort(403, 'Unauthorized.');
        }

        $validated = $request->validate([
            'lokasi'        => 'required|string',
            'latitude'      => 'nullable|string',
            'longitude'     => 'nullable|string',
            'type'          => 'nullable|string',
            'path'          => 'nullable|array',
            'pengawas_id'   => 'nullable|uuid|exists:pengawas,id',
        ]);

        if ($isKordinator && !empty($validated['pengawas_id'])) {
            $pengawas = Pengawas::find($validated['pengawas_id']);
            if (!$pengawas || $pengawas->kordinator_id !== $kordinatorId) {
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

        if ($isKordinator && $lokasi->pengawas?->kordinator_id !== $kordinatorId) {
            abort(403, 'Unauthorized.');
        }

        $lokasi->delete();
        return redirect()->route('lokasi.index')->with('message', 'Lokasi berhasil dihapus.');
    }

    public function apiMarkers()
    {
        $lokasis = Lokasi::whereNotNull('latitude')
            ->whereNotNull('longitude')
            ->get(['id', 'lokasi', 'type', 'latitude', 'longitude', 'path']);

        return response()->json($lokasis);
    }

    public function apiDetail($id)
    {
        $lokasi = Lokasi::with(['pengawas.petugas'])->find($id);

        if (!$lokasi) {
            return response()->json(['message' => 'Lokasi tidak ditemukan'], 404);
        }

        return response()->json($lokasi);
    }
}
