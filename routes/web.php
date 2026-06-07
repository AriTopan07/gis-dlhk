<?php

use App\Http\Controllers\ProfileController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
        'canReview' => auth()->check(),
    ]);
});

Route::get('/dashboard', function () {
    $user = auth()->user();
    $canReview = $user->hasRole(['superadmin', 'admin', 'kordinator']);

    return Inertia::render('Dashboard', [
        'canReview' => $canReview,
    ]);
})->middleware(['auth', 'verified'])->name('dashboard');

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
    
    Route::resource('lokasi', App\Http\Controllers\LokasiController::class);
    Route::resource('users', App\Http\Controllers\UserController::class);
    Route::resource('roles', App\Http\Controllers\RoleController::class);
    Route::resource('kordinators', App\Http\Controllers\KordinatorController::class);
    Route::resource('pengawas', App\Http\Controllers\PengawasController::class)->parameters(['pengawas' => 'pengawas']);
    Route::resource('petugas', App\Http\Controllers\PetugasController::class)->parameters(['petugas' => 'petugas']);
    Route::get('/petugas/template/download', [App\Http\Controllers\PetugasController::class, 'downloadTemplate'])->name('petugas.template');
    
    // Ulasan (Reviews)
    Route::get('/ulasan', [App\Http\Controllers\UlasanController::class, 'index'])->name('ulasan.index');
    Route::post('/ulasan', [App\Http\Controllers\UlasanController::class, 'store'])->name('ulasan.store');
    Route::put('/ulasan/{ulasan}', [App\Http\Controllers\UlasanController::class, 'update'])->name('ulasan.update');
    Route::delete('/ulasan/{ulasan}', [App\Http\Controllers\UlasanController::class, 'destroy'])->name('ulasan.destroy');

    // Import Data Hierarki
    Route::get('/import', [App\Http\Controllers\ImportController::class, 'index'])->name('import.index');
    Route::get('/import/template', [App\Http\Controllers\ImportController::class, 'downloadTemplate'])->name('import.template');
    Route::post('/import/preview', [App\Http\Controllers\ImportController::class, 'preview'])->name('import.preview');
    Route::post('/import/process', [App\Http\Controllers\ImportController::class, 'process'])->name('import.process');
    Route::post('/import/cancel', [App\Http\Controllers\ImportController::class, 'cancel'])->name('import.cancel');
});

// Public API for map
Route::get('/api/lokasi-markers', [App\Http\Controllers\LokasiController::class, 'apiMarkers']);
Route::get('/api/lokasi/{id}/detail', [App\Http\Controllers\LokasiController::class, 'apiDetail']);

require __DIR__.'/auth.php';
