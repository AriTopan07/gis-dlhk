import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, usePage, useForm } from '@inertiajs/react';
import ServerSideDataTable from '@/Components/ServerSideDataTable';
import Modal from '@/Components/Modal';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import TextInput from '@/Components/TextInput';
import { IconCheck } from '@tabler/icons-react';
import { useState } from 'react';

export default function Index({ permissions }) {

    // Group permissions by prefix (e.g. "view users" → group "users")
    const grouped = permissions.reduce((acc, perm) => {
        const parts = perm.name.split(' ');
        const group = parts.length > 1 ? parts.slice(1).join(' ') : perm.name;
        if (!acc[group]) acc[group] = [];
        acc[group].push(perm);
        return acc;
    }, {});

    // ── CREATE ────────────────────────────────────────────────
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const createForm = useForm({ name: '', permissions: [] });

    const openCreate = () => setIsCreateOpen(true);
    const closeCreate = () => { setIsCreateOpen(false); createForm.reset(); createForm.clearErrors(); };
    const submitCreate = (e) => {
        e.preventDefault();
        createForm.post(route('roles.store'), { onSuccess: () => closeCreate() });
    };

    // ── EDIT ──────────────────────────────────────────────────
    const [isEditOpen, setIsEditOpen]   = useState(false);
    const [editingRole, setEditingRole] = useState(null);
    const editForm = useForm({ name: '', permissions: [] });

    const openEdit = (item) => {
        setEditingRole(item);
        editForm.setData({
            name:        item.name,
            permissions: item.permissions?.map(p => p.name) || [],
        });
        setIsEditOpen(true);
    };
    const closeEdit = () => { setIsEditOpen(false); setEditingRole(null); editForm.reset(); editForm.clearErrors(); };
    const submitEdit = (e) => {
        e.preventDefault();
        editForm.patch(route('roles.update', editingRole.id), { onSuccess: () => closeEdit() });
    };

    const togglePermission = (form, permName) => {
        const current = form.data.permissions;
        form.setData('permissions',
            current.includes(permName)
                ? current.filter(p => p !== permName)
                : [...current, permName]
        );
    };

    // ── TABLE ─────────────────────────────────────────────────
    const columns = [
        { data: 'name', name: 'name', label: 'Nama Role' },
        {
            data: 'permissions', name: 'permissions', label: 'Jumlah Permission',
            orderable: false, searchable: false,
            render: (perms) => {
                if (!perms) return '0 permission';
                return `<span class="px-2.5 py-1 text-xs font-bold rounded-full bg-indigo-100 text-indigo-700">${perms.length} permission</span>`;
            }
        },
        {
            data: 'permissions', name: 'permissions_list', label: 'Permissions',
            orderable: false, searchable: false,
            render: (perms) => {
                if (!perms || !perms.length) return '-';
                let html = '<div class="flex flex-wrap gap-1 max-w-sm">';
                perms.slice(0, 5).forEach(p => {
                    html += `<span class="px-2 py-0.5 text-[10px] font-bold rounded-md bg-slate-100 text-slate-600 uppercase">${p.name}</span>`;
                });
                if (perms.length > 5) {
                    html += `<span class="px-2 py-0.5 text-[10px] font-bold rounded-md bg-slate-200 text-slate-500">+${perms.length - 5} lainnya</span>`;
                }
                html += '</div>';
                return html;
            }
        },
    ];

    // Reusable permission picker
    const PermissionPicker = ({ form }) => (
        <div className="space-y-3">
            <div className="flex items-center justify-between">
                <InputLabel value="Permissions" />
                <span className="text-xs text-indigo-600 font-semibold">
                    {form.data.permissions.length} dipilih
                </span>
            </div>
            <div className="border border-slate-200 rounded-xl overflow-hidden divide-y divide-slate-100 max-h-64 overflow-y-auto">
                {Object.entries(grouped).map(([group, perms]) => (
                    <div key={group} className="p-3">
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">{group}</p>
                        <div className="flex flex-wrap gap-2">
                            {perms.map(perm => {
                                const checked = form.data.permissions.includes(perm.name);
                                return (
                                    <button
                                        key={perm.id}
                                        type="button"
                                        onClick={() => togglePermission(form, perm.name)}
                                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-150
                                            ${checked
                                                ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-200'
                                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                            }`}
                                    >
                                        {checked && <IconCheck size={12} stroke={3} />}
                                        {perm.name.split(' ')[0]}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                ))}
                {Object.keys(grouped).length === 0 && (
                    <p className="p-4 text-sm text-slate-400 text-center">Belum ada permission yang tersedia.</p>
                )}
            </div>
            <InputError message={form.errors.permissions} className="mt-1" />
        </div>
    );

    return (
        <AuthenticatedLayout
            header={
                <div className="flex justify-between items-center">
                    <h2 className="text-xl font-bold leading-tight text-black">Manajemen Role</h2>
                    <button onClick={openCreate}
                        className="inline-flex items-center justify-center rounded-2xl border border-transparent bg-[#047857] px-6 py-4 text-xs font-black uppercase tracking-[0.2em] text-white transition-all duration-300 hover:bg-[#065f46] hover:shadow-lg">
                        Tambah Role
                    </button>
                </div>
            }
        >
            <Head title="Manajemen Role" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl space-y-6 sm:px-6 lg:px-8">
                    <ServerSideDataTable
                        ajaxUrl={route('roles.data')}
                        onEdit={openEdit}
                        routeDestroy="roles.destroy"
                        columns={columns}
                    />
                </div>
            </div>

            {/* ── MODAL TAMBAH ─────────────────────────────── */}
            <Modal show={isCreateOpen} onClose={closeCreate}>
                <div className="p-6">
                    <h2 className="text-lg font-bold text-gray-900 mb-6">Tambah Role</h2>
                    <form onSubmit={submitCreate} className="space-y-5">
                        <div>
                            <InputLabel htmlFor="c_name" value="Nama Role" />
                            <TextInput id="c_name" value={createForm.data.name} className="mt-1 block w-full"
                                onChange={(e) => createForm.setData('name', e.target.value)}
                                required placeholder="Contoh: operator" />
                            <InputError message={createForm.errors.name} className="mt-2" />
                        </div>

                        <PermissionPicker form={createForm} />

                        <div className="flex items-center justify-end gap-4 pt-4 border-t border-slate-50">
                            <SecondaryButton onClick={closeCreate}>Batal</SecondaryButton>
                            <PrimaryButton disabled={createForm.processing}>Simpan Role</PrimaryButton>
                        </div>
                    </form>
                </div>
            </Modal>

            {/* ── MODAL EDIT ───────────────────────────────── */}
            <Modal show={isEditOpen} onClose={closeEdit}>
                <div className="p-6">
                    <h2 className="text-lg font-bold text-gray-900 mb-6">
                        Edit Role: <span className="text-indigo-600">{editingRole?.name}</span>
                    </h2>
                    <form onSubmit={submitEdit} className="space-y-5">
                        <div>
                            <InputLabel htmlFor="e_name" value="Nama Role" />
                            <TextInput id="e_name" value={editForm.data.name} className="mt-1 block w-full"
                                onChange={(e) => editForm.setData('name', e.target.value)} required />
                            <InputError message={editForm.errors.name} className="mt-2" />
                        </div>

                        <PermissionPicker form={editForm} />

                        <div className="flex items-center justify-end gap-4 pt-4 border-t border-slate-50">
                            <SecondaryButton onClick={closeEdit}>Batal</SecondaryButton>
                            <PrimaryButton disabled={editForm.processing}>Simpan Perubahan</PrimaryButton>
                        </div>
                    </form>
                </div>
            </Modal>
        </AuthenticatedLayout>
    );
}
