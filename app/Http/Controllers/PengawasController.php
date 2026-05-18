<?php

namespace App\Http\Controllers;

use App\Models\Pengawas;
use App\Models\Kordinator;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PengawasController extends Controller
{
    public function index(Request $request)
    {
        $query = Pengawas::with('kordinator');

        if ($request->has('search')) {
            $search = $request->search;
            $query->where('nama', 'like', "%{$search}%");
        }

        if ($request->filled('kordinator_id')) {
            $query->where('kordinator_id', $request->kordinator_id);
        }

        return Inertia::render('Pengawas/Index', [
            'pengawas' => $query->latest()->paginate(10)->withQueryString(),
            'kordinators' => Kordinator::all(),
            'filters' => $request->only(['search', 'kordinator_id']),
        ]);
    }

    public function create()
    {
        return Inertia::render('Pengawas/Create', [
            'kordinators' => Kordinator::all(),
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'nama' => 'required|string|max:255',
            'kordinator_id' => 'required|uuid|exists:kordinators,id',
        ]);

        Pengawas::create($request->all());

        return redirect()->route('pengawas.index')->with('success', 'Pengawas berhasil ditambahkan.');
    }

    public function edit(Pengawas $pengawas)
    {
        return Inertia::render('Pengawas/Edit', [
            'pengawas' => $pengawas,
            'kordinators' => Kordinator::all(),
        ]);
    }

    public function update(Request $request, Pengawas $pengawas)
    {
        $request->validate([
            'nama' => 'required|string|max:255',
            'kordinator_id' => 'required|uuid|exists:kordinators,id',
        ]);

        $pengawas->update($request->all());

        return redirect()->route('pengawas.index')->with('success', 'Pengawas berhasil diupdate.');
    }

    public function destroy(Pengawas $pengawas)
    {
        $pengawas->delete();
        return redirect()->route('pengawas.index')->with('success', 'Pengawas berhasil dihapus.');
    }
}
