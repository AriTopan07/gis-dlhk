<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Intervention\Image\ImageManager;
use Intervention\Image\Drivers\Gd\Driver;
use Intervention\Image\Encoders\WebpEncoder;
use App\Exports\UlasanExport;
use Maatwebsite\Excel\Facades\Excel;

class UlasanController extends Controller
{
    public function index(Request $request)
    {
        $query = \App\Models\Ulasan::query();

        // Clone query for stats
        $total = (clone $query)->count();
        $sumRating = (clone $query)->sum('rating');
        $avg = $total > 0 ? number_format($sumRating / $total, 1) : 0;
        $positive = (clone $query)->where('rating', '>=', 4)->count();
        $pending = (clone $query)->where('status', 'menunggu')->count();

        $stats = [
            'total' => $total,
            'avg' => $avg,
            'positive' => $positive,
            'negative' => (clone $query)->where('rating', '<=', 3)->count(),
            'pending' => $pending,
        ];

        $lokasis = \App\Models\Lokasi::orderBy('lokasi', 'asc')->get(['id', 'lokasi']);

        return Inertia::render('Ulasan/Index', [
            'lokasis' => $lokasis,
            'stats'   => $stats,
        ]);
    }

    public function data(Request $request)
    {
        $query = \App\Models\Ulasan::with(['user', 'kordinator.user', 'lokasi'])
            ->orderBy('created_at', 'desc');

        if ($request->filled('rating') && $request->rating !== 'all') {
            $query->where('rating', $request->rating);
        }

        if ($request->filled('status') && $request->status !== 'all') {
            $query->where('status', $request->status);
        }

        if ($request->filled('lokasi_id') && $request->lokasi_id !== 'null' && $request->lokasi_id !== '') {
            $query->where('lokasi_id', $request->lokasi_id);
        }

        return app('datatables')->of($query)
            ->addColumn('nama', function ($ulasan) {
                return $ulasan->nama_pengulas ?? $ulasan->user->name ?? $ulasan->kordinator->user->name ?? $ulasan->kordinator->nama ?? 'Anonim';
            })
            ->addColumn('avatar', function ($ulasan) {
                $nama = $ulasan->nama_pengulas ?? $ulasan->user->name ?? $ulasan->kordinator->user->name ?? $ulasan->kordinator->nama ?? 'Anonim';
                return 'https://ui-avatars.com/api/?name=' . urlencode($nama) . '&background=random';
            })
            ->addColumn('lokasi_nama', function ($ulasan) {
                return $ulasan->lokasi->lokasi ?? 'Unknown';
            })
            ->addColumn('foto_url', function ($ulasan) {
                return $ulasan->foto ? asset('storage/' . $ulasan->foto) : null;
            })
            ->addColumn('tanggal', function ($ulasan) {
                return \Carbon\Carbon::parse($ulasan->created_at)->translatedFormat('d F Y');
            })
            ->addColumn('jam', function ($ulasan) {
                return \Carbon\Carbon::parse($ulasan->created_at)->format('H:i');
            })
            ->make(true);
    }

    public function export(Request $request)
    {
        $filters  = $request->only(['search', 'rating', 'status', 'lokasi_id']);
        $filename = 'ulasan-' . now()->format('Ymd-His') . '.xlsx';

        return Excel::download(new UlasanExport($filters), $filename);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'nama_pengulas' => 'nullable|string|max:255',
            'lokasi_id' => 'required|exists:lokasis,id',
            'rating'    => 'required|integer|min:1|max:5',
            'komentar'  => 'nullable|string',
            'foto'      => 'required|image|mimes:jpg,jpeg,png,webp',
        ]);

        $user = auth()->user();

        // Find kordinator record if user is a kordinator
        $kordinatorId = null;
        if ($user && $user->hasRole('kordinator')) {
            $kordinator = \App\Models\Kordinator::where('user_id', $user->id)->first();
            $kordinatorId = $kordinator?->id;
        }

        $fotoPath = null;
        if ($request->hasFile('foto')) {
            $file    = $request->file('foto');
            $manager = new ImageManager(new Driver());
            $image   = $manager->decode($file->getRealPath());

            // Scale down jika lebar > 1920px
            $image->scaleDown(width: 1920);

            // Encode ke webp dengan kualitas awal 85
            $quality = 85;
            $encoded = $image->encode(new WebpEncoder(quality: $quality));

            // Turunkan kualitas sampai < 1MB jika masih terlalu besar
            while (strlen((string) $encoded) > 1 * 1024 * 1024 && $quality > 20) {
                $quality -= 5;
                $encoded  = $image->encode(new WebpEncoder(quality: $quality));
            }

            $filename = 'ulasan/' . Str::uuid() . '.webp';
            Storage::disk('public')->put($filename, (string) $encoded);
            $fotoPath = $filename;
        }

        \App\Models\Ulasan::create([
            'user_id' => $user?->id,
            'nama_pengulas' => $request->nama_pengulas ?: ($user?->name ?? 'Anonim'),
            'kordinator_id' => $kordinatorId,
            'lokasi_id' => $request->lokasi_id,
            'tanggal' => now()->toDateString(),
            'rating' => $request->rating,
            'komentar' => $request->komentar,
            'foto' => $fotoPath,
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

        if ($ulasan->foto) {
            Storage::disk('public')->delete($ulasan->foto);
        }
        $ulasan->delete();

        return redirect()->back()->with('success', 'Ulasan berhasil dihapus');
    }

    public function reset()
    {
        $user = auth()->user();
        if (!$user->hasRole(['superadmin', 'admin'])) {
            return redirect()->back()->with('error', 'Anda tidak memiliki akses untuk mereset ulasan.');
        }

        // Hapus semua foto dari storage
        $ulasans = \App\Models\Ulasan::whereNotNull('foto')->get();
        foreach ($ulasans as $ulasan) {
            Storage::disk('public')->delete($ulasan->foto);
        }

        // Hapus semua data
        \App\Models\Ulasan::truncate();

        return redirect()->back()->with('success', 'Semua ulasan berhasil dihapus.');
    }
}
