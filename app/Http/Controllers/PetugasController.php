<?php

namespace App\Http\Controllers;

use App\Models\Kordinator;
use App\Models\Petugas;
use App\Models\Pengawas;
use App\Exports\TemplatePetugasExport;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Maatwebsite\Excel\Facades\Excel;

class PetugasController extends Controller
{
    public function index(Request $request)
    {
        $user = auth()->user();
        $isKordinator = $user->hasRole('kordinator');
        $kordinatorId = $isKordinator ? $user->kordinator?->id : null;

        $query = Petugas::with('pengawas.kordinator');

        if ($isKordinator) {
            $query->whereHas('pengawas', function ($q) use ($kordinatorId) {
                $q->where('kordinator_id', $kordinatorId);
            });
        }

        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('nama', 'like', "%{$search}%")
                  ->orWhere('nik_ktp', 'like', "%{$search}%")
                  ->orWhere('nip', 'like', "%{$search}%");
            });
        }
        
        if ($request->filled('pengawas_id')) {
            $query->where('pengawas_id', $request->pengawas_id);
        }

        if ($request->filled('kordinator_id')) {
            $query->whereHas('pengawas', function($q) use ($request) {
                $q->where('kordinator_id', $request->kordinator_id);
            });
        }

        $pengawasQuery = Pengawas::query();
        if ($isKordinator) {
            $pengawasQuery->where('kordinator_id', $kordinatorId);
        }
        $pengawas_list = $pengawasQuery->get();

        $kordinatorsQuery = Kordinator::query();
        if ($isKordinator) {
            $kordinatorsQuery->where('id', $kordinatorId);
        }
        $kordinator_list = $kordinatorsQuery->get();

        return Inertia::render('Petugas/Index', [
            'petugas' => $query->latest()->paginate(10)->withQueryString(),
            'pengawas_list' => $pengawas_list,
            'kordinator_list' => $kordinator_list,
            'filters' => $request->only(['search', 'pengawas_id', 'kordinator_id']),
        ]);
    }

    public function create()
    {
        $user = auth()->user();
        $isKordinator = $user->hasRole('kordinator');
        $kordinatorId = $isKordinator ? $user->kordinator?->id : null;

        $pengawasQuery = Pengawas::query();
        if ($isKordinator) {
            $pengawasQuery->where('kordinator_id', $kordinatorId);
        }
        $pengawas = $pengawasQuery->get();

        return Inertia::render('Petugas/Create', [
            'pengawas' => $pengawas,
        ]);
    }

    public function store(Request $request)
    {
        $user = auth()->user();
        $isKordinator = $user->hasRole('kordinator');
        $kordinatorId = $isKordinator ? $user->kordinator?->id : null;

        $request->validate([
            'nama'        => 'required|string|max:255',
            'pengawas_id' => 'required|uuid|exists:pengawas,id',
            'nik_ktp'     => 'nullable|string|max:20',
            'nip'         => 'nullable|string|max:30',
            'shift'       => 'nullable|in:pagi,siang,malam',
        ]);

        if ($isKordinator) {
            $pengawas = Pengawas::find($request->pengawas_id);
            if (!$pengawas || $pengawas->kordinator_id !== $kordinatorId) {
                abort(403, 'Unauthorized.');
            }
        }

        Petugas::create($request->only(['nama', 'pengawas_id', 'nik_ktp', 'nip', 'shift']));

        return redirect()->route('petugas.index')->with('success', 'Petugas berhasil ditambahkan.');
    }

    public function edit(Petugas $petugas)
    {
        $user = auth()->user();
        $isKordinator = $user->hasRole('kordinator');
        $kordinatorId = $isKordinator ? $user->kordinator?->id : null;

        if ($isKordinator && $petugas->pengawas?->kordinator_id !== $kordinatorId) {
            abort(403, 'Unauthorized.');
        }

        $pengawasQuery = Pengawas::query();
        if ($isKordinator) {
            $pengawasQuery->where('kordinator_id', $kordinatorId);
        }
        $pengawas = $pengawasQuery->get();

        return Inertia::render('Petugas/Edit', [
            'petugas' => $petugas,
            'pengawas' => $pengawas,
        ]);
    }

    public function update(Request $request, Petugas $petugas)
    {
        $user = auth()->user();
        $isKordinator = $user->hasRole('kordinator');
        $kordinatorId = $isKordinator ? $user->kordinator?->id : null;

        if ($isKordinator && $petugas->pengawas?->kordinator_id !== $kordinatorId) {
            abort(403, 'Unauthorized.');
        }

        $request->validate([
            'nama'        => 'required|string|max:255',
            'pengawas_id' => 'required|uuid|exists:pengawas,id',
            'nik_ktp'     => 'nullable|string|max:20',
            'nip'         => 'nullable|string|max:30',
            'shift'       => 'nullable|in:pagi,siang,malam',
        ]);

        if ($isKordinator) {
            $pengawas = Pengawas::find($request->pengawas_id);
            if (!$pengawas || $pengawas->kordinator_id !== $kordinatorId) {
                abort(403, 'Unauthorized.');
            }
        }

        $petugas->update($request->only(['nama', 'pengawas_id', 'nik_ktp', 'nip', 'shift']));

        return redirect()->route('petugas.index')->with('success', 'Petugas berhasil diupdate.');
    }

    public function destroy(Petugas $petugas)
    {
        $user = auth()->user();
        $isKordinator = $user->hasRole('kordinator');
        $kordinatorId = $isKordinator ? $user->kordinator?->id : null;

        if ($isKordinator && $petugas->pengawas?->kordinator_id !== $kordinatorId) {
            abort(403, 'Unauthorized.');
        }

        $petugas->delete();
        return redirect()->route('petugas.index')->with('success', 'Petugas berhasil dihapus.');
    }

    public function downloadTemplate()
    {
        return Excel::download(new TemplatePetugasExport(), 'template-import-petugas.xlsx');
    }
}
