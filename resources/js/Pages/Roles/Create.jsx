import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, Link } from '@inertiajs/react';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';

export default function Create({ permissions }) {
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        permissions: [],
    });

    const handlePermissionChange = (permName) => {
        const newPermissions = data.permissions.includes(permName)
            ? data.permissions.filter(p => p !== permName)
            : [...data.permissions, permName];
        setData('permissions', newPermissions);
    };

    const submit = (e) => {
        e.preventDefault();
        post(route('roles.store'));
    };

    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-bold leading-tight text-black">
                    Tambah Role
                </h2>
            }
        >
            <Head title="Tambah Role" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl space-y-6 sm:px-6 lg:px-8">
                    <div className="bg-white p-10 border border-slate-100 rounded-[2rem]">
                        <form onSubmit={submit} className="space-y-6">
                            <div>
                                <InputLabel htmlFor="name" value="Nama Role" />
                                <TextInput
                                    id="name"
                                    name="name"
                                    value={data.name}
                                    className="mt-1 block w-full"
                                    onChange={(e) => setData('name', e.target.value)}
                                    required
                                />
                                <InputError message={errors.name} className="mt-2" />
                            </div>

                            <div>
                                <InputLabel value="Permissions" />
                                <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                                    {permissions.map((perm) => (
                                        <label key={perm.id} className="inline-flex items-center p-4 bg-slate-50 rounded-xl border border-slate-100 cursor-pointer transition-all hover:bg-slate-100">
                                            <input
                                                type="checkbox"
                                                className="rounded-md border-slate-300 text-indigo-600 shadow-sm focus:ring-indigo-500"
                                                checked={data.permissions.includes(perm.name)}
                                                onChange={() => handlePermissionChange(perm.name)}
                                            />
                                            <span className="ms-2 text-sm text-slate-700 font-bold uppercase">{perm.name}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            <div className="flex items-center justify-end gap-4 pt-4 border-t border-slate-50">
                                <Link
                                    href={route('roles.index')}
                                    className="text-sm font-bold text-slate-500 hover:text-slate-700 transition-colors"
                                >
                                    Batal
                                </Link>
                                <PrimaryButton disabled={processing}>
                                    Simpan Role
                                </PrimaryButton>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
