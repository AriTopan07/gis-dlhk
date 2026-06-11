import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, Link } from '@inertiajs/react';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import MapPicker from '@/Components/MapPicker';
import Select from 'react-select';

export default function Edit({ lokasi, pengawas }) {
    const { data, setData, put, processing, errors } = useForm({
        lokasi: lokasi.lokasi || '',
        kategori: lokasi.kategori || 'jalan',
        latitude: lokasi.latitude || '',
        longitude: lokasi.longitude || '',
        type: lokasi.type || 'point',
        path: lokasi.path || [],
        pengawas_pagi_id: lokasi.pengawas_pagi_id || '',
        pengawas_siang_id: lokasi.pengawas_siang_id || '',
        pengawas_malam_id: lokasi.pengawas_malam_id || '',
    });

    const submit = (e) => {
        e.preventDefault();
        put(route('lokasi.update', lokasi.id));
    };

    const getPengawasOptions = (currentId) => pengawas.map(p => ({
        value: p.id,
        label: `${p.nama} ${p.lokasi_exists && p.id !== currentId ? '(Sudah Ada Lokasi)' : ''}`.trim()
    }));

    const selectStyles = {
        control: (base, state) => ({
            ...base,
            borderColor: state.isFocused ? '#6366f1' : '#cbd5e1',
            borderRadius: '0.375rem',
            padding: '0.1rem',
            boxShadow: state.isFocused ? '0 0 0 1px #6366f1' : '0 1px 2px 0 rgba(0,0,0,0.05)',
            '&:hover': { borderColor: state.isFocused ? '#6366f1' : '#94a3b8' },
        }),
        menu: (base) => ({ ...base }),
        menuPortal: (base) => ({ ...base, zIndex: 9999 }),
    };

    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-bold leading-tight text-black">
                    Edit Lokasi
                </h2>
            }
        >
            <Head title="Edit Lokasi" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl space-y-6 sm:px-6 lg:px-8">
                    <div className="bg-white p-10 border border-slate-100 rounded-[2rem]">
                        <div className="text-slate-900">
                            <form onSubmit={submit} className="space-y-6">
                                <div className="flex flex-col gap-6">
                                    <div className="w-full flex flex-col">
                                        <InputLabel htmlFor="lokasi" value="Deskripsi Lokasi" />
                                        <textarea
                                            id="lokasi"
                                            className="mt-1 block w-full border-slate-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm h-32"
                                            value={data.lokasi}
                                            onChange={(e) => setData('lokasi', e.target.value)}
                                            required
                                            placeholder="Contoh: Taman ASA - Fly Over Jenggolo Atas..."
                                        />
                                        <InputError message={errors.lokasi} className="mt-2" />
                                    </div>

                                    <div className="w-full flex flex-col">
                                        <InputLabel htmlFor="kategori" value="Kategori Lokasi" />
                                        <Select
                                            id="kategori"
                                            options={[
                                                { value: 'jalan', label: 'Jalan' },
                                                { value: 'taman', label: 'Taman' },
                                            ]}
                                            value={{ value: data.kategori, label: data.kategori === 'taman' ? 'Taman' : 'Jalan' }}
                                            onChange={(option) => setData('kategori', option ? option.value : 'jalan')}
                                            placeholder="-- Pilih Kategori --"
                                            menuPortalTarget={document.body}
                                            menuPosition="fixed"
                                            className="mt-1"
                                            styles={selectStyles}
                                        />
                                        <InputError message={errors.kategori} className="mt-2" />
                                    </div>

                                    <div className="flex flex-col md:flex-row gap-4">
                                        <div className="flex-1">
                                            <InputLabel htmlFor="pengawas_pagi_id" value="Mandor Shift Pagi" />
                                            <Select
                                                id="pengawas_pagi_id"
                                                options={getPengawasOptions(data.pengawas_pagi_id)}
                                                value={getPengawasOptions(data.pengawas_pagi_id).find(o => o.value === data.pengawas_pagi_id) || null}
                                                onChange={(option) => setData('pengawas_pagi_id', option ? option.value : '')}
                                                placeholder="-- Pilih Mandor --"
                                                isClearable
                                                menuPortalTarget={document.body}
                                                menuPosition="fixed"
                                                className="mt-1"
                                                styles={selectStyles}
                                            />
                                            <InputError message={errors.pengawas_pagi_id} className="mt-2" />
                                        </div>

                                        <div className="flex-1">
                                            <InputLabel htmlFor="pengawas_siang_id" value="Mandor Shift Siang" />
                                            <Select
                                                id="pengawas_siang_id"
                                                options={getPengawasOptions(data.pengawas_siang_id)}
                                                value={getPengawasOptions(data.pengawas_siang_id).find(o => o.value === data.pengawas_siang_id) || null}
                                                onChange={(option) => setData('pengawas_siang_id', option ? option.value : '')}
                                                placeholder="-- Pilih Mandor --"
                                                isClearable
                                                menuPortalTarget={document.body}
                                                menuPosition="fixed"
                                                className="mt-1"
                                                styles={selectStyles}
                                            />
                                            <InputError message={errors.pengawas_siang_id} className="mt-2" />
                                        </div>

                                        <div className="flex-1">
                                            <InputLabel htmlFor="pengawas_malam_id" value="Mandor Shift Malam" />
                                            <Select
                                                id="pengawas_malam_id"
                                                options={getPengawasOptions(data.pengawas_malam_id)}
                                                value={getPengawasOptions(data.pengawas_malam_id).find(o => o.value === data.pengawas_malam_id) || null}
                                                onChange={(option) => setData('pengawas_malam_id', option ? option.value : '')}
                                                placeholder="-- Pilih Mandor --"
                                                isClearable
                                                menuPortalTarget={document.body}
                                                menuPosition="fixed"
                                                className="mt-1"
                                                styles={selectStyles}
                                            />
                                            <InputError message={errors.pengawas_malam_id} className="mt-2" />
                                        </div>
                                    </div>

                                    <div className="w-full flex flex-col">
                                        <InputLabel value="Pin Peta Lokasi" />
                                        <div className="mt-1 flex-1">
                                            <MapPicker 
                                                position={data.latitude ? { lat: parseFloat(data.latitude), lng: parseFloat(data.longitude) } : null}
                                                type={data.type || 'point'}
                                                path={data.path || []}
                                                onChange={(pos) => {
                                                    setData((prev) => ({
                                                        ...prev,
                                                        latitude: pos.lat ? pos.lat.toString() : '',
                                                        longitude: pos.lng ? pos.lng.toString() : '',
                                                        type: pos.type,
                                                        path: pos.path
                                                    }));
                                                }}
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center justify-end gap-4 pt-4 border-t border-slate-100">
                                    <PrimaryButton disabled={processing}>Perbarui</PrimaryButton>
                                    <Link 
                                        href={route('lokasi.index')} 
                                        className="inline-flex items-center justify-center rounded-2xl border border-slate-300 bg-white px-6 py-4 text-xs font-black uppercase tracking-[0.2em] text-slate-700 transition-all duration-300 hover:bg-slate-50 hover:shadow-lg hover:shadow-slate-200/50 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2"
                                    >
                                        Batal
                                    </Link>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
