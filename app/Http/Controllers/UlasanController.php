<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;

class UlasanController extends Controller
{
    public function index(Request $request)
    {
        $query = \App\Models\Ulasan::with(['kordinator.user', 'lokasi'])
            ->orderBy('created_at', 'desc');

        // Filter: Search (by name, komentar, or lokasi)
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('komentar', 'like', "%{$search}%")
                  ->orWhereHas('kordinator.user', function ($q2) use ($search) {
                      $q2->where('name', 'like', "%{$search}%");
                  })
                  ->orWhereHas('kordinator', function ($q2) use ($search) {
                      $q2->where('nama', 'like', "%{$search}%");
                  })
                  ->orWhereHas('lokasi', function ($q2) use ($search) {
                      $q2->where('lokasi', 'like', "%{$search}%");
                  });
            });
        }

        // Filter: Rating
        if ($request->filled('rating') && $request->rating !== 'all') {
            $query->where('rating', $request->rating);
        }

        // Filter: Status
        if ($request->filled('status') && $request->status !== 'all') {
            $query->where('status', $request->status);
        }

        // Clone query for stats before pagination
        $statsQuery = clone $query;
        $total = $statsQuery->count();
        $sumRating = $statsQuery->sum('rating');
        $avg = $total > 0 ? number_format($sumRating / $total, 1) : 0;
        
        $positive = (clone $query)->where('rating', '>=', 4)->count();
        $negative = (clone $query)->where('rating', '<=', 3)->count();
        $pending = (clone $query)->where('status', 'menunggu')->count();

        $stats = [
            'total' => $total,
            'avg' => $avg,
            'positive' => $positive,
            'negative' => $negative,
            'pending' => $pending,
        ];

        // Pagination
        $ulasans = $query->paginate(12)->through(function ($ulasan) {
            $nama = $ulasan->kordinator->user->name ?? $ulasan->kordinator->nama ?? 'Unknown';
            return [
                'id' => $ulasan->id,
                'nama' => $nama,
                'avatar' => 'https://ui-avatars.com/api/?name=' . urlencode($nama) . '&background=random',
                'rating' => $ulasan->rating,
                'komentar' => $ulasan->komentar,
                'lokasi' => $ulasan->lokasi->lokasi ?? 'Unknown',
                'tanggal' => \Carbon\Carbon::parse($ulasan->tanggal)->translatedFormat('d F Y'),
                'status' => $ulasan->status,
            ];
        });

        $lokasis = \App\Models\Lokasi::orderBy('lokasi', 'asc')->get(['id', 'lokasi']);

        return Inertia::render('Ulasan/Index', [
            'ulasans' => $ulasans,
            'lokasis' => $lokasis,
            'stats' => $stats,
            'filters' => $request->only(['search', 'rating', 'status']),
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'lokasi_id' => 'required|exists:lokasis,id',
            'rating' => 'required|integer|min:1|max:5',
            'komentar' => 'nullable|string',
        ]);

        $user = auth()->user();
        if (!$user->hasRole('kordinator')) {
            return redirect()->back()->with('error', 'Hanya kordinator yang dapat memberikan ulasan.');
        }

        $kordinator = \App\Models\Kordinator::where('user_id', $user->id)->first();
        if (!$kordinator) {
            return redirect()->back()->with('error', 'Data kordinator tidak ditemukan.');
        }

        \App\Models\Ulasan::create([
            'kordinator_id' => $kordinator->id,
            'lokasi_id' => $request->lokasi_id,
            'tanggal' => now()->toDateString(),
            'rating' => $request->rating,
            'komentar' => $request->komentar,
            'status' => 'disetujui',
        ]);

        return redirect()->back()->with('success', 'Ulasan berhasil ditambahkan.');
    }

    public function update(Request $request, \App\Models\Ulasan $ulasan)
    {
        $user = auth()->user();
        if (!$user->hasRole(['superadmin', 'admin'])) {
            return redirect()->back()->with('error', 'Anda tidak memiliki akses untuk mengubah status ulasan.');
        }

        $request->validate([
            'status' => 'required|in:disetujui,ditolak,menunggu',
        ]);

        $ulasan->update([
            'status' => $request->status,
        ]);

        return redirect()->back()->with('success', 'Status ulasan berhasil diubah.');
    }

    public function destroy(\App\Models\Ulasan $ulasan)
    {
        $user = auth()->user();
        if (!$user->hasRole(['superadmin', 'admin'])) {
            return redirect()->back()->with('error', 'Anda tidak memiliki akses untuk menghapus ulasan.');
        }

        $ulasan->delete();

        return redirect()->back()->with('success', 'Ulasan berhasil dihapus.');
    }
}
