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
            'ulasan',
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
        $admin      = Role::firstOrCreate(['name' => 'admin',             'guard_name' => 'web']);
        $kordinator = Role::firstOrCreate(['name' => 'kordinator',        'guard_name' => 'web']);

        // Superadmin → semua permission
        $superadmin->syncPermissions(Permission::all());

        // Admin → semua permission kecuali kelola roles
        $adminPermissions = Permission::whereNotIn('name', [
            'view roles', 'create roles', 'edit roles', 'delete roles'
        ])->get();
        $admin->syncPermissions($adminPermissions);

        // Kordinator → hanya view
        $kordinator->syncPermissions([
            'view dashboard',
            'view lokasi',
            'view petugas',
            'view pengawas',
            'view ulasan',
        ]);

        // Pengawas → view saja, lebih terbatas
        $pengawas->syncPermissions([
            'view dashboard',
            'view lokasi',
            'view petugas',
            'view ulasan',
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
