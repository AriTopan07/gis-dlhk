import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, usePage, useForm, router } from '@inertiajs/react';
import ServerSideDataTable from '@/Components/ServerSideDataTable';
import Modal from '@/Components/Modal';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import TextInput from '@/Components/TextInput';
import Select from 'react-select';
import { IconSunrise, IconSun, IconMoonStars } from '@tabler/icons-react';

import { useState } from 'react';

export default function Index({ pengawas_list, kordinator_list }) {
    const { flash } = usePage().props;

    // ── CREATE ───────────────────────────────────────────────
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const createForm = useForm({ nama: '', pengawas_id: '', nik_ktp: '', nip: '', shift: '' });

    const openCreateModal = () => setIsCreateModalOpen(true);
    const closeCreateModal = () => { setIsCreateModalOpen(false); createForm.reset(); createForm.clearErrors(); };
    const submitCreate = (e) => {
        e.preventDefault();
        createForm.post(route('petugas.store'), { onSuccess: () => closeCreateModal() });
    };

    // ── EDIT ─────────────────────────────────────────────────
    const [isEditModalOpen, setIsEditModalOpen]   = useState(false);
    const [editingPetugas, setEditingPetugas]     = useState(null);
    const editForm = useForm({ nama: '', pengawas_id: '', nik_ktp: '', nip: '', shift: '' });

    const openEditModal = (item) => {
        setEditingPetugas(item);
        editForm.setData({
            nama:        item.nama        || '',
            pengawas_id: item.pengawas_id || '',
            nik_ktp:     item.nik_ktp     || '',
            nip:         item.nip         || '',
            shift:       item.shift       || '',
        });
        setIsEditModalOpen(true);
    };
    const closeEditModal = () => { setIsEditModalOpen(false); setEditingPetugas(null); editForm.reset(); editForm.clearErrors(); };
    const submitEdit = (e) => {
        e.preventDefault();
        editForm.patch(route('petugas.update', editingPetugas.id), { onSuccess: () => closeEditModal() });
    };

    const shiftOptions = [
        { value: 'pagi',   label: 'Pagi' },
        { value: 'siang',  label: 'Siang' },
        { value: 'malam',  label: 'Malam' },
    ];

    const shiftBadge = (shift) => {
        if (!shift) return <span className="text-slate-400 text-xs italic">-</span>;
        const map = { pagi: 'bg-amber-50 text-amber-700', siang: 'bg-blue-50 text-blue-700', malam: 'bg-indigo-50 text-indigo-700' };
        const icons = { 
            pagi: <IconSunrise size={14} className="mr-1" />, 
            siang: <IconSun size={14} className="mr-1" />, 
            malam: <IconMoonStars size={14} className="mr-1" /> 
        };
        const label = { pagi: 'Pagi', siang: 'Siang', malam: 'Malam' };
        return (
            <span className={`inline-flex items-center text-[11px] font-bold px-2.5 py-0.5 rounded-full ${map[shift]}`}>
                {icons[shift]}
                {label[shift]}
            </span>
        );
    };

    const columns = [
        { data: 'nama', name: 'nama', label: 'Nama' },
        { data: 'nik_ktp', name: 'nik_ktp', label: 'NIK KTP',
            render: (v) => v || '<span class="text-slate-400 text-xs italic">-</span>'
        },
        { data: 'nip', name: 'nip', label: 'NIP',
            render: (v) => v || '<span class="text-slate-400 text-xs italic">-</span>'
        },
        { data: 'shift', name: 'shift', label: 'Shift',
            render: (shift) => shiftBadge(shift)
        },
        {
            data: 'pengawas', name: 'pengawas.nama', label: 'Pengawas (Mandor)',
            orderable: false, searchable: false,
            render: (pengawas) => pengawas ? pengawas.nama : '<span class="text-slate-400 text-xs italic">-</span>'
        }
    ];

    const selectStyles = {
        control: (base, state) => ({
            ...base,
            borderColor: state.isFocused ? '#6366f1' : '#e2e8f0',
            borderRadius: '0.75rem',
            padding: '0.125rem',
            boxShadow: state.isFocused ? '0 0 0 1px #6366f1' : '0 1px 2px 0 rgba(0,0,0,0.05)',
            '&:hover': { borderColor: state.isFocused ? '#6366f1' : '#cbd5e1' },
            minHeight: '42px',
        }),
        menu: (base) => ({ ...base, borderRadius: '0.75rem', overflow: 'hidden' }),
        menuPortal: (base) => ({ ...base, zIndex: 9999 }),
    };



    const pengawasOptions = pengawas_list?.map(p => ({ value: p.id, label: p.nama })) || [];

    return (
        <AuthenticatedLayout
            header={
                <div className="flex justify-between items-center">
                    <h2 className="text-xl font-bold leading-tight text-black">Data Petugas</h2>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={openCreateModal}
                            className="inline-flex items-center justify-center rounded-2xl border border-transparent bg-[#047857] px-6 py-4 text-xs font-black uppercase tracking-[0.2em] text-white transition-all duration-300 hover:bg-[#065f46] hover:shadow-lg"
                        >
                            Tambah Petugas
                        </button>
                    </div>
                </div>
            }
        >
            <Head title="Data Petugas" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl space-y-6 sm:px-6 lg:px-8">
                    <ServerSideDataTable
                        ajaxUrl={route('petugas.data')}
                        onEdit={openEditModal}
                        routeDestroy="petugas.destroy"
                        columns={columns}
                    />
                </div>
            </div>

            {/* ── MODAL TAMBAH ─────────────────────────────── */}
            <Modal show={isCreateModalOpen} onClose={closeCreateModal}>
                <div className="p-6">
                    <h2 className="text-lg font-bold text-gray-900 mb-6">Tambah Petugas</h2>
                    <form onSubmit={submitCreate} className="space-y-5">

                        <div>
                            <InputLabel htmlFor="c_nama" value="Nama Lengkap" />
                            <TextInput id="c_nama" value={createForm.data.nama} className="mt-1 block w-full"
                                onChange={(e) => createForm.setData('nama', e.target.value)} required />
                            <InputError message={createForm.errors.nama} className="mt-2" />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <InputLabel htmlFor="c_nik_ktp" value="NIK KTP" />
                                <TextInput id="c_nik_ktp" value={createForm.data.nik_ktp} className="mt-1 block w-full"
                                    onChange={(e) => createForm.setData('nik_ktp', e.target.value)}
                                    placeholder="16 digit" maxLength={20} />
                                <InputError message={createForm.errors.nik_ktp} className="mt-2" />
                            </div>
                            <div>
                                <InputLabel htmlFor="c_nip" value="NIP" />
                                <TextInput id="c_nip" value={createForm.data.nip} className="mt-1 block w-full"
                                    onChange={(e) => createForm.setData('nip', e.target.value)}
                                    placeholder="18 digit" maxLength={30} />
                                <InputError message={createForm.errors.nip} className="mt-2" />
                            </div>
                        </div>

                        <div>
                            <InputLabel htmlFor="c_shift" value="Shift" />
                            <Select
                                id="c_shift"
                                options={shiftOptions}
                                value={shiftOptions.find(o => o.value === createForm.data.shift) || null}
                                onChange={(opt) => createForm.setData('shift', opt ? opt.value : '')}
                                placeholder="-- Pilih Shift --"
                                isClearable menuPortalTarget={document.body} menuPosition="fixed"
                                className="mt-1" styles={selectStyles}
                            />
                            <InputError message={createForm.errors.shift} className="mt-2" />
                        </div>

                        <div>
                            <InputLabel htmlFor="c_pengawas_id" value="Pilih Pengawas (Mandor)" />
                            <Select
                                id="c_pengawas_id"
                                options={pengawasOptions}
                                value={pengawasOptions.find(o => o.value === createForm.data.pengawas_id) || null}
                                onChange={(opt) => createForm.setData('pengawas_id', opt ? opt.value : '')}
                                placeholder="-- Pilih Pengawas --"
                                isClearable menuPortalTarget={document.body} menuPosition="fixed"
                                className="mt-1" styles={selectStyles}
                            />
                            <InputError message={createForm.errors.pengawas_id} className="mt-2" />
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
                        Edit Petugas: <span className="text-indigo-600">{editingPetugas?.nama}</span>
                    </h2>
                    <form onSubmit={submitEdit} className="space-y-5">

                        <div>
                            <InputLabel htmlFor="e_nama" value="Nama Lengkap" />
                            <TextInput id="e_nama" value={editForm.data.nama} className="mt-1 block w-full"
                                onChange={(e) => editForm.setData('nama', e.target.value)} required />
                            <InputError message={editForm.errors.nama} className="mt-2" />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <InputLabel htmlFor="e_nik_ktp" value="NIK KTP" />
                                <TextInput id="e_nik_ktp" value={editForm.data.nik_ktp} className="mt-1 block w-full"
                                    onChange={(e) => editForm.setData('nik_ktp', e.target.value)}
                                    placeholder="16 digit" maxLength={20} />
                                <InputError message={editForm.errors.nik_ktp} className="mt-2" />
                            </div>
                            <div>
                                <InputLabel htmlFor="e_nip" value="NIP" />
                                <TextInput id="e_nip" value={editForm.data.nip} className="mt-1 block w-full"
                                    onChange={(e) => editForm.setData('nip', e.target.value)}
                                    placeholder="18 digit" maxLength={30} />
                                <InputError message={editForm.errors.nip} className="mt-2" />
                            </div>
                        </div>

                        <div>
                            <InputLabel htmlFor="e_shift" value="Shift" />
                            <Select
                                id="e_shift"
                                options={shiftOptions}
                                value={shiftOptions.find(o => o.value === editForm.data.shift) || null}
                                onChange={(opt) => editForm.setData('shift', opt ? opt.value : '')}
                                placeholder="-- Pilih Shift --"
                                isClearable menuPortalTarget={document.body} menuPosition="fixed"
                                className="mt-1" styles={selectStyles}
                            />
                            <InputError message={editForm.errors.shift} className="mt-2" />
                        </div>

                        <div>
                            <InputLabel htmlFor="e_pengawas_id" value="Pilih Pengawas (Mandor)" />
                            <Select
                                id="e_pengawas_id"
                                options={pengawasOptions}
                                value={pengawasOptions.find(o => o.value === editForm.data.pengawas_id) || null}
                                onChange={(opt) => editForm.setData('pengawas_id', opt ? opt.value : '')}
                                placeholder="-- Pilih Pengawas --"
                                isClearable menuPortalTarget={document.body} menuPosition="fixed"
                                className="mt-1" styles={selectStyles}
                            />
                            <InputError message={editForm.errors.pengawas_id} className="mt-2" />
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
