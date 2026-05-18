<?php

namespace App\Http\Controllers;

use App\Models\Kordinator;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules;
use Illuminate\Support\Facades\DB;

class KordinatorController extends Controller
{
    public function index()
    {
        return Inertia::render('Kordinators/Index', [
            'kordinators' => Kordinator::with('user')->paginate(10),
        ]);
    }

    public function create()
    {
        return Inertia::render('Kordinators/Create');
    }

    public function store(Request $request)
    {
        $request->validate([
            'nama' => 'required|string|max:255',
            'nip' => 'required|string|max:255|unique:users,nip',
            'email' => 'nullable|string|lowercase|email|max:255|unique:users,email',
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
        ]);

        DB::transaction(function () use ($request) {
            $user = User::create([
                'name' => $request->nama,
                'nip' => $request->nip,
                'email' => $request->email,
                'password' => Hash::make($request->password),
            ]);

            $user->assignRole('kordinator');

            Kordinator::create([
                'nama' => $request->nama,
                'user_id' => $user->id,
            ]);
        });

        return redirect()->route('kordinators.index')->with('success', 'Kordinator dan Akun User berhasil dibuat.');
    }

    public function edit(Kordinator $kordinator)
    {
        return Inertia::render('Kordinators/Edit', [
            'kordinator' => $kordinator->load('user'),
        ]);
    }

    public function update(Request $request, Kordinator $kordinator)
    {
        $request->validate([
            'nama' => 'required|string|max:255',
            'nip' => 'required|string|max:255|unique:users,nip,'.$kordinator->user_id,
            'email' => 'nullable|string|lowercase|email|max:255|unique:users,email,'.$kordinator->user_id,
            'password' => ['nullable', 'confirmed', Rules\Password::defaults()],
        ]);

        DB::transaction(function () use ($request, $kordinator) {
            $kordinator->update([
                'nama' => $request->nama,
            ]);

            $user = $kordinator->user;
            $user->update([
                'name' => $request->nama,
                'nip' => $request->nip,
                'email' => $request->email,
            ]);

            if ($request->password) {
                $user->update(['password' => Hash::make($request->password)]);
            }
        });

        return redirect()->route('kordinators.index')->with('success', 'Data Kordinator dan Akun berhasil diupdate.');
    }

    public function destroy(Kordinator $kordinator)
    {
        DB::transaction(function () use ($kordinator) {
            $user = $kordinator->user;
            $kordinator->delete();
            if ($user) {
                $user->delete();
            }
        });
        
        return redirect()->route('kordinators.index')->with('success', 'Kordinator dan Akun berhasil dihapus.');
    }
}
