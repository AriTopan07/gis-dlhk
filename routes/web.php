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

// Public routes for Ulasan
Route::post('/ulasan', [App\Http\Controllers\UlasanController::class, 'store'])->name('ulasan.store');

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
    
    Route::get('/lokasi/data', [App\Http\Controllers\LokasiController::class, 'data'])->name('lokasi.data');
    Route::resource('lokasi', App\Http\Controllers\LokasiController::class);
    Route::get('/users/data', [App\Http\Controllers\UserController::class, 'data'])->name('users.data');
    Route::resource('users', App\Http\Controllers\UserController::class);
    Route::get('/roles/data', [App\Http\Controllers\RoleController::class, 'data'])->name('roles.data');
    Route::resource('roles', App\Http\Controllers\RoleController::class);
    Route::get('/kordinators/data', [App\Http\Controllers\KordinatorController::class, 'data'])->name('kordinators.data');
    Route::resource('kordinators', App\Http\Controllers\KordinatorController::class);
    Route::get('/pengawas/data', [App\Http\Controllers\PengawasController::class, 'data'])->name('pengawas.data');
    Route::resource('pengawas', App\Http\Controllers\PengawasController::class)->parameters(['pengawas' => 'pengawas']);
    Route::get('/petugas/data', [App\Http\Controllers\PetugasController::class, 'data'])->name('petugas.data');
    Route::resource('petugas', App\Http\Controllers\PetugasController::class)->parameters(['petugas' => 'petugas']);
    Route::get('/petugas/template/download', [App\Http\Controllers\PetugasController::class, 'downloadTemplate'])->name('petugas.template');
    
    // Ulasan (Reviews) - Other methods are auth protected
    Route::get('/ulasan', [App\Http\Controllers\UlasanController::class, 'index'])->name('ulasan.index');
    Route::get('/ulasan/export', [App\Http\Controllers\UlasanController::class, 'export'])->name('ulasan.export');
    Route::get('/ulasan/data', [App\Http\Controllers\UlasanController::class, 'data'])->name('ulasan.data');
    Route::get('/ulasan/export', [App\Http\Controllers\UlasanController::class, 'export'])->name('ulasan.export');
    Route::delete('/ulasan/reset', [App\Http\Controllers\UlasanController::class, 'reset'])->name('ulasan.reset');
    Route::resource('ulasan', App\Http\Controllers\UlasanController::class)->only(['index', 'store', 'update', 'destroy'])->parameters(['ulasan' => 'ulasan']);

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
