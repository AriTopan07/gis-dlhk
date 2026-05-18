import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, usePage } from '@inertiajs/react';
import DataTable from '@/Components/DataTable';

export default function Index({ lokasis, filters }) {
    const { flash } = usePage().props;

    const columns = [
        { label: 'Lokasi', key: 'lokasi' },
        {
            label: 'Pengawas (Mandor)',
            key: 'pengawas',
            render: (pengawas) => pengawas
                ? <span className="font-medium text-emerald-700">{pengawas.nama}</span>
                : <span className="text-slate-400 italic text-xs">Belum ditentukan</span>
        }
    ];

    return (
        <AuthenticatedLayout
            header={
                <div className="flex justify-between items-center">
                    <h2 className="text-xl font-bold leading-tight text-black">
                        Data Lokasi
                    </h2>
                    <Link
                        href={route('lokasi.create')}
                        className="inline-flex items-center justify-center rounded-2xl border border-transparent bg-[#047857] px-6 py-4 text-xs font-black uppercase tracking-[0.2em] text-white transition-all duration-300 hover:bg-[#065f46] hover:shadow-lg hover:shadow-green-900/10 focus:outline-none focus:ring-2 focus:ring-[#10B981] focus:ring-offset-2 active:bg-[#064e3b]"
                    >
                        Tambah Lokasi
                    </Link>
                </div>
            }
        >
            <Head title="Data Lokasi" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8 space-y-6">

                    
                    <DataTable 
                        data={lokasis}
                        filters={filters}
                        routeEdit="lokasi.edit"
                        routeDestroy="lokasi.destroy"
                        columns={columns}
                    />
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
