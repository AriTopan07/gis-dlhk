import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, usePage, useForm } from '@inertiajs/react';
import DataTable from '@/Components/DataTable';
import Modal from '@/Components/Modal';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import TextInput from '@/Components/TextInput';
import { useState } from 'react';

export default function Index({ kordinators }) {
    const { flash } = usePage().props;

    // ── SHARED STYLES ─────────────────────────────────────────
    const inputClass = 'mt-1 block w-full';

    // ── CREATE ────────────────────────────────────────────────
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const createForm = useForm({ nama: '', nip: '', email: '', password: '', password_confirmation: '' });

    const openCreateModal = () => setIsCreateModalOpen(true);
    const closeCreateModal = () => { setIsCreateModalOpen(false); createForm.reset(); createForm.clearErrors(); };
    const submitCreate = (e) => {
        e.preventDefault();
        createForm.post(route('kordinators.store'), {
            onSuccess: () => closeCreateModal(),
            onFinish: () => createForm.reset('password', 'password_confirmation'),
        });
    };

    // ── EDIT ──────────────────────────────────────────────────
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingItem, setEditingItem]         = useState(null);
    const editForm = useForm({ nama: '', nip: '', email: '', password: '', password_confirmation: '' });

    const openEditModal = (item) => {
        setEditingItem(item);
        editForm.setData({
            nama:                  item.nama           || '',
            nip:                   item.user?.nip      || '',
            email:                 item.user?.email    || '',
            password:              '',
            password_confirmation: '',
        });
        setIsEditModalOpen(true);
    };
    const closeEditModal = () => { setIsEditModalOpen(false); setEditingItem(null); editForm.reset(); editForm.clearErrors(); };
    const submitEdit = (e) => {
        e.preventDefault();
        editForm.patch(route('kordinators.update', editingItem.id), {
            onSuccess: () => closeEditModal(),
            onFinish: () => editForm.reset('password', 'password_confirmation'),
        });
    };

    // ── TABLE ─────────────────────────────────────────────────
    const columns = [
        { label: 'Nama', key: 'nama' },
        {
            label: 'NIP',
            key: 'user',
            render: (user) => user?.nip || <span className="text-slate-400 italic text-xs">-</span>
        },
        {
            label: 'Akun / Email',
            key: 'user',
            render: (user) => user?.email || <span className="text-slate-400 italic text-xs">Belum ditautkan</span>
        },
    ];

    const passwordSection = (form) => (
        <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 space-y-4">
            <h3 className="text-sm font-bold text-slate-700">Password Akun</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <InputLabel htmlFor={`${form}_password`} value="Password Baru" />
                    <TextInput
                        id={`${form}_password`}
                        type="password"
                        value={form === 'create' ? createForm.data.password : editForm.data.password}
                        className={`${inputClass} bg-white`}
                        onChange={(e) => form === 'create'
                            ? createForm.setData('password', e.target.value)
                            : editForm.setData('password', e.target.value)
                        }
                        required={form === 'create'}
                        placeholder={form === 'edit' ? 'Kosongkan jika tidak diubah' : ''}
                    />
                    <InputError message={form === 'create' ? createForm.errors.password : editForm.errors.password} className="mt-2" />
                </div>
                <div>
                    <InputLabel htmlFor={`${form}_password_confirmation`} value="Konfirmasi Password" />
                    <TextInput
                        id={`${form}_password_confirmation`}
                        type="password"
                        value={form === 'create' ? createForm.data.password_confirmation : editForm.data.password_confirmation}
                        className={`${inputClass} bg-white`}
                        onChange={(e) => form === 'create'
                            ? createForm.setData('password_confirmation', e.target.value)
                            : editForm.setData('password_confirmation', e.target.value)
                        }
                        required={form === 'create'}
                    />
                    <InputError message={form === 'create' ? createForm.errors.password_confirmation : editForm.errors.password_confirmation} className="mt-2" />
                </div>
            </div>
        </div>
    );

    return (
        <AuthenticatedLayout
            header={
                <div className="flex justify-between items-center">
                    <h2 className="text-xl font-bold leading-tight text-black">Data Kordinator</h2>
                    <button
                        onClick={openCreateModal}
                        className="inline-flex items-center justify-center rounded-2xl border border-transparent bg-[#047857] px-6 py-4 text-xs font-black uppercase tracking-[0.2em] text-white transition-all duration-300 hover:bg-[#065f46] hover:shadow-lg hover:shadow-green-900/10 focus:outline-none focus:ring-2 focus:ring-[#10B981] focus:ring-offset-2 active:bg-[#064e3b]"
                    >
                        Tambah Kordinator
                    </button>
                </div>
            }
        >
            <Head title="Data Kordinator" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl space-y-6 sm:px-6 lg:px-8">
                    <DataTable
                        data={kordinators}
                        onEdit={openEditModal}
                        routeDestroy="kordinators.destroy"
                        columns={columns}
                    />
                </div>
            </div>

            {/* ── MODAL TAMBAH ─────────────────────────────── */}
            <Modal show={isCreateModalOpen} onClose={closeCreateModal}>
                <div className="p-6">
                    <h2 className="text-lg font-bold text-gray-900 mb-6">Tambah Kordinator</h2>
                    <form onSubmit={submitCreate} className="space-y-5">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <InputLabel htmlFor="c_nama" value="Nama Lengkap" />
                                <TextInput id="c_nama" value={createForm.data.nama} className={inputClass}
                                    onChange={(e) => createForm.setData('nama', e.target.value)} required />
                                <InputError message={createForm.errors.nama} className="mt-2" />
                            </div>
                            <div>
                                <InputLabel htmlFor="c_nip" value="NIP (Login)" />
                                <TextInput id="c_nip" value={createForm.data.nip} className={inputClass}
                                    onChange={(e) => createForm.setData('nip', e.target.value)} required />
                                <InputError message={createForm.errors.nip} className="mt-2" />
                            </div>
                        </div>

                        <div>
                            <InputLabel htmlFor="c_email" value="Email (Opsional)" />
                            <TextInput id="c_email" type="email" value={createForm.data.email} className={inputClass}
                                onChange={(e) => createForm.setData('email', e.target.value)} />
                            <InputError message={createForm.errors.email} className="mt-2" />
                        </div>

                        {passwordSection('create')}

                        <div className="flex items-center justify-end gap-4 pt-4 border-t border-slate-50">
                            <SecondaryButton onClick={closeCreateModal}>Batal</SecondaryButton>
                            <PrimaryButton disabled={createForm.processing}>Simpan & Buat Akun</PrimaryButton>
                        </div>
                    </form>
                </div>
            </Modal>

            {/* ── MODAL EDIT ───────────────────────────────── */}
            <Modal show={isEditModalOpen} onClose={closeEditModal}>
                <div className="p-6">
                    <h2 className="text-lg font-bold text-gray-900 mb-6">
                        Edit Kordinator: <span className="text-indigo-600">{editingItem?.nama}</span>
                    </h2>
                    <form onSubmit={submitEdit} className="space-y-5">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <InputLabel htmlFor="e_nama" value="Nama Lengkap" />
                                <TextInput id="e_nama" value={editForm.data.nama} className={inputClass}
                                    onChange={(e) => editForm.setData('nama', e.target.value)} required />
                                <InputError message={editForm.errors.nama} className="mt-2" />
                            </div>
                            <div>
                                <InputLabel htmlFor="e_nip" value="NIP (Login)" />
                                <TextInput id="e_nip" value={editForm.data.nip} className={inputClass}
                                    onChange={(e) => editForm.setData('nip', e.target.value)} required />
                                <InputError message={editForm.errors.nip} className="mt-2" />
                            </div>
                        </div>

                        <div>
                            <InputLabel htmlFor="e_email" value="Email (Opsional)" />
                            <TextInput id="e_email" type="email" value={editForm.data.email} className={inputClass}
                                onChange={(e) => editForm.setData('email', e.target.value)} />
                            <InputError message={editForm.errors.email} className="mt-2" />
                        </div>

                        {passwordSection('edit')}

                        <div className="flex items-center justify-end gap-4 pt-4 border-t border-slate-50">
                            <SecondaryButton onClick={closeEditModal}>Batal</SecondaryButton>
                            <PrimaryButton disabled={editForm.processing}>Simpan Perubahan</PrimaryButton>
                        </div>
                    </form>
                </div>
            </Modal>
        </AuthenticatedLayout>
    );
}
