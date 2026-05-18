import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, Link } from '@inertiajs/react';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import Select from 'react-select';

export default function Edit({ pengawas, kordinators }) {
    const { data, setData, patch, processing, errors } = useForm({
        nama: pengawas.nama || '',
        kordinator_id: pengawas.kordinator_id || '',
    });

    const submit = (e) => {
        e.preventDefault();
        patch(route('pengawas.update', pengawas.id));
    };

    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-bold leading-tight text-black">
                    Edit Pengawas: {pengawas.nama}
                </h2>
            }
        >
            <Head title="Edit Pengawas" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl space-y-6 sm:px-6 lg:px-8">
                    <div className="bg-white p-10 border border-slate-100 rounded-[2rem]">
                        <form onSubmit={submit} className="space-y-6">
                            <div>
                                <InputLabel htmlFor="nama" value="Nama Lengkap" />
                                <TextInput
                                    id="nama"
                                    name="nama"
                                    value={data.nama}
                                    className="mt-1 block w-full"
                                    onChange={(e) => setData('nama', e.target.value)}
                                    required
                                />
                                <InputError message={errors.nama} className="mt-2" />
                            </div>

                            <div>
                                <InputLabel htmlFor="kordinator_id" value="Pilih Kordinator" />
                                <Select
                                    id="kordinator_id"
                                    name="kordinator_id"
                                    options={kordinators.map(k => ({ value: k.id, label: k.nama }))}
                                    value={kordinators.map(k => ({ value: k.id, label: k.nama })).find(option => option.value === data.kordinator_id) || null}
                                    onChange={(option) => setData('kordinator_id', option ? option.value : '')}
                                    placeholder="-- Pilih Kordinator --"
                                    isClearable
                                    className="mt-1"
                                    styles={{
                                        control: (baseStyles, state) => ({
                                            ...baseStyles,
                                            borderColor: state.isFocused ? '#6366f1' : '#e2e8f0', // indigo-500 : slate-200
                                            borderRadius: '0.75rem', // rounded-xl
                                            padding: '0.125rem',
                                            boxShadow: state.isFocused ? '0 0 0 1px #6366f1' : '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
                                            '&:hover': {
                                                borderColor: state.isFocused ? '#6366f1' : '#cbd5e1'
                                            }
                                        }),
                                        menu: (baseStyles) => ({
                                            ...baseStyles,
                                            borderRadius: '0.75rem',
                                            overflow: 'hidden',
                                        })
                                    }}
                                />
                                <InputError message={errors.kordinator_id} className="mt-2" />
                            </div>

                            <div className="flex items-center justify-end gap-4 pt-4 border-t border-slate-50">
                                <Link
                                    href={route('pengawas.index')}
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
