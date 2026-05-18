import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, Link } from '@inertiajs/react';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import Select from 'react-select';

export default function Edit({ petugas, pengawas }) {
    const { data, setData, patch, processing, errors } = useForm({
        nama:        petugas.nama        || '',
        pengawas_id: petugas.pengawas_id || '',
        nik_ktp:     petugas.nik_ktp     || '',
        nip:         petugas.nip         || '',
    });

    const submit = (e) => {
        e.preventDefault();
        patch(route('petugas.update', petugas.id));
    };

    const selectStyles = {
        control: (base, state) => ({
            ...base,
            borderColor: state.isFocused ? '#6366f1' : '#e2e8f0',
            borderRadius: '0.75rem',
            padding: '0.125rem',
            boxShadow: state.isFocused ? '0 0 0 1px #6366f1' : '0 1px 2px 0 rgba(0,0,0,0.05)',
            '&:hover': { borderColor: state.isFocused ? '#6366f1' : '#cbd5e1' },
        }),
        menu: (base) => ({ ...base, borderRadius: '0.75rem', overflow: 'hidden', zIndex: 50 }),
    };

    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-bold leading-tight text-black">
                    Edit Petugas: {petugas.nama}
                </h2>
            }
        >
            <Head title="Edit Petugas" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl space-y-6 sm:px-6 lg:px-8">
                    <div className="bg-white p-10 border border-slate-100 rounded-[2rem]">
                        <form onSubmit={submit} className="space-y-6">

                            {/* Nama */}
                            <div>
                                <InputLabel htmlFor="nama" value="Nama Lengkap" />
                                <TextInput
                                    id="nama"
                                    value={data.nama}
                                    className="mt-1 block w-full"
                                    onChange={(e) => setData('nama', e.target.value)}
                                    required
                                />
                                <InputError message={errors.nama} className="mt-2" />
                            </div>

                            {/* NIK KTP & NIP side by side */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <InputLabel htmlFor="nik_ktp" value="NIK KTP" />
                                    <TextInput
                                        id="nik_ktp"
                                        value={data.nik_ktp}
                                        className="mt-1 block w-full"
                                        onChange={(e) => setData('nik_ktp', e.target.value)}
                                        placeholder="Contoh: 3515072211860001"
                                        maxLength={20}
                                    />
                                    <InputError message={errors.nik_ktp} className="mt-2" />
                                </div>
                                <div>
                                    <InputLabel htmlFor="nip" value="NIP" />
                                    <TextInput
                                        id="nip"
                                        value={data.nip}
                                        className="mt-1 block w-full"
                                        onChange={(e) => setData('nip', e.target.value)}
                                        placeholder="Contoh: 198611222025211088"
                                        maxLength={30}
                                    />
                                    <InputError message={errors.nip} className="mt-2" />
                                </div>
                            </div>

                            {/* Pengawas */}
                            <div>
                                <InputLabel htmlFor="pengawas_id" value="Pilih Pengawas (Mandor)" />
                                <Select
                                    id="pengawas_id"
                                    options={pengawas.map(p => ({ value: p.id, label: p.nama }))}
                                    value={pengawas.map(p => ({ value: p.id, label: p.nama })).find(o => o.value === data.pengawas_id) || null}
                                    onChange={(option) => setData('pengawas_id', option ? option.value : '')}
                                    placeholder="-- Pilih Pengawas --"
                                    isClearable
                                    className="mt-1"
                                    styles={selectStyles}
                                />
                                <InputError message={errors.pengawas_id} className="mt-2" />
                            </div>

                            <div className="flex items-center justify-end gap-4 pt-4 border-t border-slate-50">
                                <Link
                                    href={route('petugas.index')}
                                    className="text-sm font-bold text-slate-500 hover:text-slate-700 transition-colors"
                                >
                                    Batal
                                </Link>
                                <PrimaryButton disabled={processing}>
                                    Update Data
                                </PrimaryButton>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
