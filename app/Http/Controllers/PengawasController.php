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
        $user = auth()->user();
        $isKordinator = $user->hasRole('kordinator');
        $kordinatorId = $isKordinator ? $user->kordinator?->id : null;

        $query = Pengawas::with('kordinator');

        if ($isKordinator) {
            $query->where('kordinator_id', $kordinatorId);
        }

        if ($request->has('search')) {
            $search = $request->search;
            $query->where('nama', 'like', "%{$search}%");
        }

        if ($request->filled('kordinator_id')) {
            $query->where('kordinator_id', $request->kordinator_id);
        }

        $kordinatorsQuery = Kordinator::query();
        if ($isKordinator) {
            $kordinatorsQuery->where('id', $kordinatorId);
        }
        $kordinators = $kordinatorsQuery->get();

        return Inertia::render('Pengawas/Index', [
            'pengawas' => $query->latest()->paginate(10)->withQueryString(),
            'kordinators' => $kordinators,
            'filters' => $request->only(['search', 'kordinator_id']),
        ]);
    }

    public function create()
    {
        $user = auth()->user();
        $isKordinator = $user->hasRole('kordinator');
        $kordinatorId = $isKordinator ? $user->kordinator?->id : null;

        $kordinatorsQuery = Kordinator::query();
        if ($isKordinator) {
            $kordinatorsQuery->where('id', $kordinatorId);
        }
        $kordinators = $kordinatorsQuery->get();

        return Inertia::render('Pengawas/Create', [
            'kordinators' => $kordinators,
        ]);
    }

    public function store(Request $request)
    {
        $user = auth()->user();
        $isKordinator = $user->hasRole('kordinator');
        $kordinatorId = $isKordinator ? $user->kordinator?->id : null;

        if ($isKordinator) {
            $request->merge(['kordinator_id' => $kordinatorId]);
        }

        $request->validate([
            'nama' => 'required|string|max:255',
            'nip'  => 'nullable|string|max:255',
            'kordinator_id' => 'required|uuid|exists:kordinators,id',
        ]);

        Pengawas::create($request->all());

        return redirect()->route('pengawas.index')->with('success', 'Pengawas berhasil ditambahkan.');
    }

    public function edit(Pengawas $pengawas)
    {
        $user = auth()->user();
        $isKordinator = $user->hasRole('kordinator');
        $kordinatorId = $isKordinator ? $user->kordinator?->id : null;

        if ($isKordinator && $pengawas->kordinator_id !== $kordinatorId) {
            abort(403, 'Unauthorized.');
        }

        $kordinatorsQuery = Kordinator::query();
        if ($isKordinator) {
            $kordinatorsQuery->where('id', $kordinatorId);
        }
        $kordinators = $kordinatorsQuery->get();

        return Inertia::render('Pengawas/Edit', [
            'pengawas' => $pengawas,
            'kordinators' => $kordinators,
        ]);
    }

    public function update(Request $request, Pengawas $pengawas)
    {
        $user = auth()->user();
        $isKordinator = $user->hasRole('kordinator');
        $kordinatorId = $isKordinator ? $user->kordinator?->id : null;

        if ($isKordinator && $pengawas->kordinator_id !== $kordinatorId) {
            abort(403, 'Unauthorized.');
        }

        if ($isKordinator) {
            $request->merge(['kordinator_id' => $kordinatorId]);
        }

        $request->validate([
            'nama' => 'required|string|max:255',
            'nip'  => 'nullable|string|max:255',
            'kordinator_id' => 'required|uuid|exists:kordinators,id',
        ]);

        $pengawas->update($request->all());

        return redirect()->route('pengawas.index')->with('success', 'Pengawas berhasil diupdate.');
    }

    public function destroy(Pengawas $pengawas)
    {
        $user = auth()->user();
        $isKordinator = $user->hasRole('kordinator');
        $kordinatorId = $isKordinator ? $user->kordinator?->id : null;

        if ($isKordinator && $pengawas->kordinator_id !== $kordinatorId) {
            abort(403, 'Unauthorized.');
        }

        $pengawas->delete();
        return redirect()->route('pengawas.index')->with('success', 'Pengawas berhasil dihapus.');
    }
}
