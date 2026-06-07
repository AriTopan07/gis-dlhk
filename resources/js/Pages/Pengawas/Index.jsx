import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, usePage, useForm, router } from '@inertiajs/react';
import DataTable from '@/Components/DataTable';
import Modal from '@/Components/Modal';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import TextInput from '@/Components/TextInput';
import Select from 'react-select';
import { useState, useEffect } from 'react';

export default function Index({ pengawas, kordinators, filters }) {
    const { flash } = usePage().props;

    const [filterKordinator, setFilterKordinator] = useState(filters?.kordinator_id || '');

    const handleFilterChange = (kordinator_id) => {
        setFilterKordinator(kordinator_id);
        const currentParams = new URLSearchParams(window.location.search);
        if (kordinator_id) {
            currentParams.set('kordinator_id', kordinator_id);
        } else {
            currentParams.delete('kordinator_id');
        }
        router.get(window.location.pathname, Object.fromEntries(currentParams.entries()), { preserveState: true, replace: true });
    };

    const kordinatorOptions = kordinators.map(k => ({ value: k.id, label: k.nama }));

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
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const createForm = useForm({ nama: '', nip: '', kordinator_id: '' });

    const openCreateModal = () => setIsCreateModalOpen(true);
    const closeCreateModal = () => { setIsCreateModalOpen(false); createForm.reset(); createForm.clearErrors(); };
    const submitCreate = (e) => {
        e.preventDefault();
        createForm.post(route('pengawas.store'), { onSuccess: () => closeCreateModal() });
    };

    // ── EDIT ──────────────────────────────────────────────────
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingItem, setEditingItem]         = useState(null);
    const editForm = useForm({ nama: '', nip: '', kordinator_id: '' });

    const openEditModal = (item) => {
        setEditingItem(item);
        editForm.setData({
            nama:          item.nama          || '',
            nip:           item.nip           || '',
            kordinator_id: item.kordinator_id || '',
        });
        setIsEditModalOpen(true);
    };
    const closeEditModal = () => { setIsEditModalOpen(false); setEditingItem(null); editForm.reset(); editForm.clearErrors(); };
    const submitEdit = (e) => {
        e.preventDefault();
        editForm.patch(route('pengawas.update', editingItem.id), { onSuccess: () => closeEditModal() });
    };

    // ── TABLE ─────────────────────────────────────────────────
    const columns = [
        { label: 'Nama', key: 'nama' },
        { label: 'NIP', key: 'nip', render: (n) => n || <span className="text-slate-400 italic text-xs">-</span> },
        {
            label: 'Kordinator',
            key: 'kordinator',
            render: (k) => k ? k.nama : <span className="text-slate-400 italic text-xs">-</span>
        },
    ];

    return (
        <AuthenticatedLayout
            header={
                <div className="flex justify-between items-center">
                    <h2 className="text-xl font-bold leading-tight text-black">Data Pengawas</h2>
                    <button
                        onClick={openCreateModal}
                        className="inline-flex items-center justify-center rounded-2xl border border-transparent bg-[#047857] px-6 py-4 text-xs font-black uppercase tracking-[0.2em] text-white transition-all duration-300 hover:bg-[#065f46] hover:shadow-lg hover:shadow-green-900/10 focus:outline-none focus:ring-2 focus:ring-[#10B981] focus:ring-offset-2 active:bg-[#064e3b]"
                    >
                        Tambah Pengawas
                    </button>
                </div>
            }
        >
            <Head title="Data Pengawas" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl space-y-6 sm:px-6 lg:px-8">
                    <DataTable
                        data={pengawas}
                        onEdit={openEditModal}
                        routeDestroy="pengawas.destroy"
                        columns={columns}
                        filters={filters}
                        filterSlot={
                            <div className="w-48 sm:w-64">
                                <Select
                                    options={kordinatorOptions}
                                    value={kordinatorOptions.find(o => o.value === filterKordinator) || null}
                                    onChange={(opt) => handleFilterChange(opt ? opt.value : '')}
                                    placeholder="Semua Kordinator"
                                    isClearable
                                    styles={selectStyles}
                                />
                            </div>
                        }
                    />
                </div>
            </div>

            {/* ── MODAL TAMBAH ─────────────────────────────── */}
            <Modal show={isCreateModalOpen} onClose={closeCreateModal}>
                <div className="p-6">
                    <h2 className="text-lg font-bold text-gray-900 mb-6">Tambah Pengawas</h2>
                    <form onSubmit={submitCreate} className="space-y-5">
                        <div>
                            <InputLabel htmlFor="c_nama" value="Nama Lengkap" />
                            <TextInput id="c_nama" value={createForm.data.nama} className="mt-1 block w-full"
                                onChange={(e) => createForm.setData('nama', e.target.value)} required />
                            <InputError message={createForm.errors.nama} className="mt-2" />
                        </div>

                        <div>
                            <InputLabel htmlFor="c_nip" value="NIP (Opsional)" />
                            <TextInput id="c_nip" value={createForm.data.nip} className="mt-1 block w-full"
                                onChange={(e) => createForm.setData('nip', e.target.value)} />
                            <InputError message={createForm.errors.nip} className="mt-2" />
                        </div>

                        <div>
                            <InputLabel htmlFor="c_kordinator_id" value="Pilih Kordinator" />
                            <Select
                                id="c_kordinator_id"
                                options={kordinatorOptions}
                                value={kordinatorOptions.find(o => o.value === createForm.data.kordinator_id) || null}
                                onChange={(opt) => createForm.setData('kordinator_id', opt ? opt.value : '')}
                                placeholder="-- Pilih Kordinator --"
                                isClearable menuPortalTarget={document.body} menuPosition="fixed"
                                className="mt-1" styles={selectStyles}
                            />
                            <InputError message={createForm.errors.kordinator_id} className="mt-2" />
                        </div>

                        <div className="flex items-center justify-end gap-4 pt-4 border-t border-slate-50">
                            <SecondaryButton onClick={closeCreateModal}>Batal</SecondaryButton>
                            <PrimaryButton disabled={createForm.processing}>Simpan Data</PrimaryButton>
                        </div>
                    </form>
                </div>
            </Modal>

            {/* ── MODAL EDIT ───────────────────────────────── */}
            <Modal show={isEditModalOpen} onClose={closeEditModal}>
                <div className="p-6">
                    <h2 className="text-lg font-bold text-gray-900 mb-6">
                        Edit Pengawas: <span className="text-indigo-600">{editingItem?.nama}</span>
                    </h2>
                    <form onSubmit={submitEdit} className="space-y-5">
                        <div>
                            <InputLabel htmlFor="e_nama" value="Nama Lengkap" />
                            <TextInput id="e_nama" value={editForm.data.nama} className="mt-1 block w-full"
                                onChange={(e) => editForm.setData('nama', e.target.value)} required />
                            <InputError message={editForm.errors.nama} className="mt-2" />
                        </div>

                        <div>
                            <InputLabel htmlFor="e_nip" value="NIP (Opsional)" />
                            <TextInput id="e_nip" value={editForm.data.nip} className="mt-1 block w-full"
                                onChange={(e) => editForm.setData('nip', e.target.value)} />
                            <InputError message={editForm.errors.nip} className="mt-2" />
                        </div>

                        <div>
                            <InputLabel htmlFor="e_kordinator_id" value="Pilih Kordinator" />
                            <Select
                                id="e_kordinator_id"
                                options={kordinatorOptions}
                                value={kordinatorOptions.find(o => o.value === editForm.data.kordinator_id) || null}
                                onChange={(opt) => editForm.setData('kordinator_id', opt ? opt.value : '')}
                                placeholder="-- Pilih Kordinator --"
                                isClearable menuPortalTarget={document.body} menuPosition="fixed"
                                className="mt-1" styles={selectStyles}
                            />
                            <InputError message={editForm.errors.kordinator_id} className="mt-2" />
                        </div>

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
