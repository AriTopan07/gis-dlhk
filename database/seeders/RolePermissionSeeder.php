<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;

class RolePermissionSeeder extends Seeder
{
    public function run(): void
    {
        // Reset cached roles and permissions
        app()[\Spatie\Permission\PermissionRegistrar::class]->forgetCachedPermissions();

        // ── PERMISSIONS ──────────────────────────────────────────
        $modules = [
            'dashboard',
            'lokasi',
            'kordinators',
            'pengawas',
            'petugas',
            'users',
            'roles',
            'import',
        ];

        $actions = ['view', 'create', 'edit', 'delete'];

        foreach ($modules as $module) {
            foreach ($actions as $action) {
                Permission::firstOrCreate([
                    'name'       => "$action $module",
                    'guard_name' => 'web',
                ]);
            }
        }

        // ── ROLES ────────────────────────────────────────────────
        $superadmin = Role::firstOrCreate(['name' => 'superadmin',        'guard_name' => 'web']);
        $kordinator = Role::firstOrCreate(['name' => 'kordinator',        'guard_name' => 'web']);
        $pengawas   = Role::firstOrCreate(['name' => 'pengawas',          'guard_name' => 'web']);
        $petugas    = Role::firstOrCreate(['name' => 'tenaga_kebersihan', 'guard_name' => 'web']);

        // Superadmin → semua permission
        $superadmin->syncPermissions(Permission::all());

        // Kordinator → hanya view
        $kordinator->syncPermissions([
            'view dashboard',
            'view lokasi',
            'view petugas',
            'view pengawas',
        ]);

        // Pengawas → view saja, lebih terbatas
        $pengawas->syncPermissions([
            'view dashboard',
            'view lokasi',
            'view petugas',
        ]);

        // Tenaga Kebersihan → minimal
        $petugas->syncPermissions([
            'view dashboard',
        ]);

        // ── DEFAULT SUPERADMIN USER ──────────────────────────────
        $admin = User::firstOrCreate(
            ['email' => 'admin@dlhk.test'],
            [
                'name'     => 'Super Admin',
                'nip'      => '123456789',
                'password' => bcrypt('password'),
            ]
        );

        $admin->assignRole('superadmin');
    }
}
