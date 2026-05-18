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

        $lokasis = Lokasi::with('pengawas')->when($search, function ($query, $search) {
            return $query->where('lokasi', 'like', "%{$search}%");
        })
            ->orderBy('created_at', 'desc')
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('Lokasi/Index', [
            'lokasis'    => $lokasis,
            'filters'    => $request->only(['search']),
            'pengawas'   => Pengawas::orderBy('nama')->get(['id', 'nama']),
        ]);
    }

    public function create()
    {
        return Inertia::render('Lokasi/Create', [
            'pengawas' => Pengawas::withExists('lokasi')->orderBy('nama')->get(['id', 'nama']),
        ]);
    }

    public function store(Request $request)
    {
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
        return Inertia::render('Lokasi/Edit', [
            'lokasi'      => $lokasi,
            'pengawas'    => Pengawas::withExists('lokasi')->orderBy('nama')->get(['id', 'nama']),
        ]);
    }

    public function update(Request $request, Lokasi $lokasi)
    {
        $validated = $request->validate([
            'lokasi'        => 'required|string',
            'latitude'      => 'nullable|string',
            'longitude'     => 'nullable|string',
            'type'          => 'nullable|string',
            'path'          => 'nullable|array',
            'pengawas_id'   => 'nullable|uuid|exists:pengawas,id',
        ]);

        $lokasi->update($validated);

        return redirect()->route('lokasi.index')->with('message', 'Lokasi berhasil diperbarui.');
    }

    public function destroy(Lokasi $lokasi)
    {
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
