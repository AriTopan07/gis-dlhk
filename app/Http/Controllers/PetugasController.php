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
        $query = Petugas::with('pengawas.kordinator');

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

        return Inertia::render('Petugas/Index', [
            'petugas' => $query->latest()->paginate(10)->withQueryString(),
            'pengawas_list' => Pengawas::all(),
            'kordinator_list' => Kordinator::all(),
            'filters' => $request->only(['search', 'pengawas_id', 'kordinator_id']),
        ]);
    }

    public function create()
    {
        return Inertia::render('Petugas/Create', [
            'pengawas' => Pengawas::all(),
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'nama'        => 'required|string|max:255',
            'pengawas_id' => 'required|uuid|exists:pengawas,id',
            'nik_ktp'     => 'nullable|string|max:20',
            'nip'         => 'nullable|string|max:30',
        ]);

        Petugas::create($request->only(['nama', 'pengawas_id', 'nik_ktp', 'nip']));

        return redirect()->route('petugas.index')->with('success', 'Petugas berhasil ditambahkan.');
    }

    public function edit(Petugas $petugas)
    {
        return Inertia::render('Petugas/Edit', [
            'petugas' => $petugas,
            'pengawas' => Pengawas::all(),
        ]);
    }

    public function update(Request $request, Petugas $petugas)
    {
        $request->validate([
            'nama'        => 'required|string|max:255',
            'pengawas_id' => 'required|uuid|exists:pengawas,id',
            'nik_ktp'     => 'nullable|string|max:20',
            'nip'         => 'nullable|string|max:30',
        ]);

        $petugas->update($request->only(['nama', 'pengawas_id', 'nik_ktp', 'nip']));

        return redirect()->route('petugas.index')->with('success', 'Petugas berhasil diupdate.');
    }

    public function destroy(Petugas $petugas)
    {
        $petugas->delete();
        return redirect()->route('petugas.index')->with('success', 'Petugas berhasil dihapus.');
    }

    public function downloadTemplate()
    {
        return Excel::download(new TemplatePetugasExport(), 'template-import-petugas.xlsx');
    }
}
