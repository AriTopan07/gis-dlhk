import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, usePage, useForm } from '@inertiajs/react';
import DataTable from '@/Components/DataTable';
import Modal from '@/Components/Modal';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import TextInput from '@/Components/TextInput';
import Select from 'react-select';
import { useState } from 'react';

export default function Index({ users, roles }) {
    const roleOptions = roles.map(r => ({ value: r.name, label: r.name.toUpperCase() }));

    const selectStyles = {
        control: (base, state) => ({
            ...base,
            borderColor: state.isFocused ? '#6366f1' : '#e2e8f0',
            borderRadius: '0.75rem',
            padding: '0.125rem',
            boxShadow: state.isFocused ? '0 0 0 1px #6366f1' : '0 1px 2px 0 rgba(0,0,0,0.05)',
            '&:hover': { borderColor: state.isFocused ? '#6366f1' : '#cbd5e1' },
        }),
        menu: (base) => ({ ...base, borderRadius: '0.75rem', overflow: 'hidden' }),
        menuPortal: (base) => ({ ...base, zIndex: 9999 }),
    };

    // ── CREATE ────────────────────────────────────────────────
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const createForm = useForm({ name: '', nip: '', email: '', password: '', password_confirmation: '', role: '' });

    const openCreate = () => setIsCreateOpen(true);
    const closeCreate = () => { setIsCreateOpen(false); createForm.reset(); createForm.clearErrors(); };
    const submitCreate = (e) => {
        e.preventDefault();
        createForm.post(route('users.store'), {
            onSuccess: () => closeCreate(),
            onFinish: () => createForm.reset('password', 'password_confirmation'),
        });
    };

    // ── EDIT ──────────────────────────────────────────────────
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const editForm = useForm({ name: '', nip: '', email: '', password: '', password_confirmation: '', role: '' });

    const openEdit = (item) => {
        setEditingUser(item);
        editForm.setData({
            name:                  item.name  || '',
            nip:                   item.nip   || '',
            email:                 item.email || '',
            password:              '',
            password_confirmation: '',
            role:                  item.roles?.[0]?.name || '',
        });
        setIsEditOpen(true);
    };
    const closeEdit = () => { setIsEditOpen(false); setEditingUser(null); editForm.reset(); editForm.clearErrors(); };
    const submitEdit = (e) => {
        e.preventDefault();
        editForm.patch(route('users.update', editingUser.id), {
            onSuccess: () => closeEdit(),
            onFinish: () => editForm.reset('password', 'password_confirmation'),
        });
    };

    // ── TABLE ─────────────────────────────────────────────────
    const columns = [
        { label: 'Nama', key: 'name' },
        { label: 'NIP', key: 'nip' },
        { label: 'Email', key: 'email', render: (v) => v || <span className="text-slate-400 text-xs italic">-</span> },
        {
            label: 'Role',
            key: 'roles',
            render: (roles) => (
                <div className="flex flex-wrap gap-1">
                    {roles.map(role => (
                        <span key={role.id} className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-indigo-100 text-indigo-700 uppercase">
                            {role.name}
                        </span>
                    ))}
                </div>
            )
        },
    ];

    // Reusable form body
    const renderFormBody = (form, formType) => (
        <div className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <InputLabel htmlFor={`${formType}_name`} value="Nama Lengkap" />
                    <TextInput id={`${formType}_name`} value={form.data.name} className="mt-1 block w-full"
                        onChange={(e) => form.setData('name', e.target.value)} required />
                    <InputError message={form.errors.name} className="mt-2" />
                </div>
                <div>
                    <InputLabel htmlFor={`${formType}_nip`} value="NIP" />
                    <TextInput id={`${formType}_nip`} value={form.data.nip} className="mt-1 block w-full"
                        onChange={(e) => form.setData('nip', e.target.value)} required />
                    <InputError message={form.errors.nip} className="mt-2" />
                </div>
            </div>

            <div>
                <InputLabel htmlFor={`${formType}_email`} value="Email (Opsional)" />
                <TextInput id={`${formType}_email`} type="email" value={form.data.email} className="mt-1 block w-full"
                    onChange={(e) => form.setData('email', e.target.value)} />
                <InputError message={form.errors.email} className="mt-2" />
            </div>

            <div>
                <InputLabel htmlFor={`${formType}_role`} value="Role" />
                <Select
                    id={`${formType}_role`}
                    options={roleOptions}
                    value={roleOptions.find(o => o.value === form.data.role) || null}
                    onChange={(opt) => form.setData('role', opt ? opt.value : '')}
                    placeholder="-- Pilih Role --"
                    menuPortalTarget={document.body} menuPosition="fixed"
                    className="mt-1" styles={selectStyles}
                />
                <InputError message={form.errors.role} className="mt-2" />
            </div>

            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 space-y-4">
                <h3 className="text-sm font-bold text-slate-700">
                    Password {formType === 'edit' && <span className="font-normal text-slate-400">(kosongkan jika tidak diubah)</span>}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <InputLabel htmlFor={`${formType}_password`} value="Password" />
                        <TextInput id={`${formType}_password`} type="password" value={form.data.password}
                            className="mt-1 block w-full bg-white"
                            onChange={(e) => form.setData('password', e.target.value)}
                            required={formType === 'create'} />
                        <InputError message={form.errors.password} className="mt-2" />
                    </div>
                    <div>
                        <InputLabel htmlFor={`${formType}_password_confirmation`} value="Konfirmasi Password" />
                        <TextInput id={`${formType}_password_confirmation`} type="password"
                            value={form.data.password_confirmation} className="mt-1 block w-full bg-white"
                            onChange={(e) => form.setData('password_confirmation', e.target.value)}
                            required={formType === 'create'} />
                        <InputError message={form.errors.password_confirmation} className="mt-2" />
                    </div>
                </div>
            </div>
        </div>
    );

    return (
        <AuthenticatedLayout
            header={
                <div className="flex justify-between items-center">
                    <h2 className="text-xl font-bold leading-tight text-black">Manajemen User</h2>
                    <button onClick={openCreate}
                        className="inline-flex items-center justify-center rounded-2xl border border-transparent bg-[#047857] px-6 py-4 text-xs font-black uppercase tracking-[0.2em] text-white transition-all duration-300 hover:bg-[#065f46] hover:shadow-lg">
                        Tambah User
                    </button>
                </div>
            }
        >
            <Head title="Manajemen User" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl space-y-6 sm:px-6 lg:px-8">
                    <DataTable
                        data={users}
                        onEdit={openEdit}
                        routeDestroy="users.destroy"
                        columns={columns}
                    />
                </div>
            </div>

            {/* ── MODAL TAMBAH ─────────────────────────────── */}
            <Modal show={isCreateOpen} onClose={closeCreate}>
                <div className="p-6">
                    <h2 className="text-lg font-bold text-gray-900 mb-6">Tambah User</h2>
                    <form onSubmit={submitCreate}>
                        {renderFormBody(createForm, 'create')}
                        <div className="flex items-center justify-end gap-4 pt-6 mt-2 border-t border-slate-50">
                            <SecondaryButton onClick={closeCreate}>Batal</SecondaryButton>
                            <PrimaryButton disabled={createForm.processing}>Simpan</PrimaryButton>
                        </div>
                    </form>
                </div>
            </Modal>

            {/* ── MODAL EDIT ───────────────────────────────── */}
            <Modal show={isEditOpen} onClose={closeEdit}>
                <div className="p-6">
                    <h2 className="text-lg font-bold text-gray-900 mb-6">
                        Edit User: <span className="text-indigo-600">{editingUser?.name}</span>
                    </h2>
                    <form onSubmit={submitEdit}>
                        {renderFormBody(editForm, 'edit')}
                        <div className="flex items-center justify-end gap-4 pt-6 mt-2 border-t border-slate-50">
                            <SecondaryButton onClick={closeEdit}>Batal</SecondaryButton>
                            <PrimaryButton disabled={editForm.processing}>Simpan Perubahan</PrimaryButton>
                        </div>
                    </form>
                </div>
            </Modal>
        </AuthenticatedLayout>
    );
}
