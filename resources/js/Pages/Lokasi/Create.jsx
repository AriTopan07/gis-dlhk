import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, Link } from '@inertiajs/react';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import MapPicker from '@/Components/MapPicker';
import Select from 'react-select';

export default function Create({ pengawas }) {
    const { data, setData, post, processing, errors } = useForm({
        lokasis: [{ id: Date.now(), lokasi: '', latitude: '', longitude: '', type: 'point', path: [], pengawas_id: '' }],
    });

    const addLokasi = () => {
        setData('lokasis', [...data.lokasis, { id: Date.now(), lokasi: '', latitude: '', longitude: '', type: 'point', path: [], pengawas_id: '' }]);
    };

    const removeLokasi = (index) => {
        const newLokasis = [...data.lokasis];
        newLokasis.splice(index, 1);
        setData('lokasis', newLokasis);
    };

    const updateLokasiField = (index, field, value) => {
        const newLokasis = [...data.lokasis];
        newLokasis[index][field] = value;
        setData('lokasis', newLokasis);
    };

    const submit = (e) => {
        e.preventDefault();
        post(route('lokasi.store'));
    };

    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-bold leading-tight text-black">
                    Tambah Lokasi
                </h2>
            }
        >
            <Head title="Tambah Lokasi" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl space-y-6 sm:px-6 lg:px-8">
                    <div className="bg-white p-10 border border-slate-100 rounded-[2rem]">
                        <div className="text-slate-900">
                            <form onSubmit={submit} className="space-y-6">
                                {data.lokasis.map((item, index) => (
                                    <div key={item.id} className="flex flex-col gap-6 border p-6 rounded-[1rem] bg-slate-50 relative">
                                        <div className="w-full flex flex-col">
                                            <InputLabel htmlFor={`lokasi-${index}`} value={`Deskripsi Lokasi ${index + 1}`} />
                                            <textarea
                                                id={`lokasi-${index}`}
                                                className="mt-1 block w-full border-slate-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm h-32"
                                                value={item.lokasi}
                                                onChange={(e) => updateLokasiField(index, 'lokasi', e.target.value)}
                                                required
                                                placeholder="Contoh: Taman ASA - Fly Over Jenggolo Atas..."
                                            />
                                            {errors[`lokasis.${index}.lokasi`] && (
                                                <InputError message={errors[`lokasis.${index}.lokasi`]} className="mt-2" />
                                            )}
                                        </div>

                                        <div>
                                            <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-500">
                                                Pengawas (Mandor)
                                            </label>
                                            <Select
                                                id={`pengawas_id-${index}`}
                                                options={pengawas.map(p => ({
                                                    value: p.id,
                                                    label: `${p.nama} ${p.lokasi_exists && p.id !== item.pengawas_id ? '(Sudah Ada Lokasi)' : ''}`.trim()
                                                }))}
                                                value={pengawas.map(p => ({
                                                    value: p.id,
                                                    label: `${p.nama} ${p.lokasi_exists && p.id !== item.pengawas_id ? '(Sudah Ada Lokasi)' : ''}`.trim()
                                                })).find(o => o.value === item.pengawas_id) || null}
                                                onChange={(option) => updateLokasiField(index, 'pengawas_id', option ? option.value : '')}
                                                placeholder="-- Pilih Pengawas --"
                                                isClearable
                                                menuPortalTarget={document.body}
                                                menuPosition="fixed"
                                                className="mt-1"
                                                styles={{
                                                    control: (base, state) => ({
                                                        ...base,
                                                        borderColor: state.isFocused ? '#6366f1' : '#cbd5e1',
                                                        borderRadius: '0.75rem',
                                                        padding: '0.25rem',
                                                        boxShadow: state.isFocused ? '0 0 0 1px #6366f1' : '0 1px 2px 0 rgba(0,0,0,0.05)',
                                                        '&:hover': { borderColor: state.isFocused ? '#6366f1' : '#94a3b8' },
                                                    }),
                                                    menuPortal: (base) => ({ ...base, zIndex: 9999 }),
                                                }}
                                            />
                                            {errors[`lokasis.${index}.pengawas_id`] && (
                                                <p className="mt-2 text-xs font-medium text-red-500">
                                                    {errors[`lokasis.${index}.pengawas_id`]}
                                                </p>
                                            )}
                                        </div>

                                        <div className="w-full flex flex-col">
                                            <InputLabel value={`Pin Peta Lokasi ${index + 1}`} />
                                            <div className="mt-1 flex-1">
                                                <MapPicker 
                                                    position={item.latitude ? { lat: parseFloat(item.latitude), lng: parseFloat(item.longitude) } : null}
                                                    type={item.type || 'point'}
                                                    path={item.path || []}
                                                    onChange={(pos) => {
                                                        updateLokasiField(index, 'latitude', pos.lat ? pos.lat.toString() : '');
                                                        updateLokasiField(index, 'longitude', pos.lng ? pos.lng.toString() : '');
                                                        updateLokasiField(index, 'type', pos.type);
                                                        updateLokasiField(index, 'path', pos.path);
                                                    }}
                                                />
                                            </div>
                                        </div>
                                        {data.lokasis.length > 1 && (
                                            <button 
                                                type="button" 
                                                onClick={() => removeLokasi(index)}
                                                className="text-red-500 hover:text-red-700 font-bold px-2 py-1 absolute top-2 right-2 bg-white rounded-md shadow-sm border border-red-100"
                                                title="Hapus baris ini"
                                            >
                                                ✕ Hapus
                                            </button>
                                        )}
                                    </div>
                                ))}

                                <div>
                                    <button 
                                        type="button" 
                                        onClick={addLokasi}
                                        className="inline-flex items-center justify-center rounded-2xl border border-indigo-600 px-4 py-2 text-xs font-bold text-indigo-600 transition-all duration-300 hover:bg-indigo-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                                    >
                                        + Tambah Baris Lokasi
                                    </button>
                                </div>

                                <div className="flex items-center justify-end gap-4 pt-4 border-t border-slate-100">
                                    <PrimaryButton disabled={processing}>Simpan Semua</PrimaryButton>
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
