import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, usePage } from '@inertiajs/react';
import DataTable from '@/Components/DataTable';
import { IconMapPin, IconRoad, IconTree, IconRulerMeasure } from '@tabler/icons-react';

export default function Index({ lokasis, filters, stats }) {
    const { flash } = usePage().props;

    const getDistance = (lat1, lon1, lat2, lon2) => {
        const R = 6371e3;
        const p1 = lat1 * Math.PI/180;
        const p2 = lat2 * Math.PI/180;
        const dp = (lat2-lat1) * Math.PI/180;
        const dl = (lon2-lon1) * Math.PI/180;
        const a = Math.sin(dp/2) * Math.sin(dp/2) +
                Math.cos(p1) * Math.cos(p2) *
                Math.sin(dl/2) * Math.sin(dl/2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        return R * c;
    };

    const calculateLength = (path) => {
        if (!path || path.length < 2) return 0;
        let total = 0;
        for (let i = 0; i < path.length - 1; i++) {
            total += getDistance(parseFloat(path[i].lat), parseFloat(path[i].lng), parseFloat(path[i+1].lat), parseFloat(path[i+1].lng));
        }
        return total;
    };

    const formatDistance = (meters) => {
        if (meters >= 1000) {
            return (meters / 1000).toFixed(2) + ' km';
        }
        return Math.round(meters) + ' m';
    };

    const columns = [
        { label: 'Lokasi', key: 'lokasi' },
        { 
            label: 'Kategori', 
            key: 'kategori',
            render: (kategori) => (
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${kategori === 'taman' ? 'bg-emerald-50 text-emerald-600 border-emerald-200' : 'bg-slate-50 text-slate-600 border-slate-200'}`}>
                    {kategori || 'Jalan'}
                </span>
            )
        },
        {
            label: 'Panjang Jalan / Titik',
            key: 'type',
            render: (type, row) => {
                if (type === 'line' && row.path && row.path.length > 0) {
                    const len = calculateLength(row.path);
                    return <span className="text-blue-600 font-medium">{formatDistance(len)} ({row.path.length} titik)</span>;
                }
                return <span className="text-slate-500">Titik Tunggal</span>;
            }
        },
        {
            label: 'Pengawas (Mandor)',
            key: 'pengawas', // Key doesn't perfectly map to single column now, but render receives row
            render: (_, row) => {
                const hasPengawas = row.pengawas_pagi || row.pengawas_siang || row.pengawas_malam;
                if (!hasPengawas) return <span className="text-slate-400 italic text-xs">Belum ditentukan</span>;
                
                return (
                    <div className="flex flex-col gap-1">
                        {row.pengawas_pagi && <div className="text-xs"><span className="font-bold text-emerald-700">Pagi:</span> {row.pengawas_pagi.nama}</div>}
                        {row.pengawas_siang && <div className="text-xs"><span className="font-bold text-blue-700">Siang:</span> {row.pengawas_siang.nama}</div>}
                        {row.pengawas_malam && <div className="text-xs"><span className="font-bold text-indigo-700">Malam:</span> {row.pengawas_malam.nama}</div>}
                    </div>
                );
            }
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

                    {stats && (
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                            <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex items-center gap-4">
                                <div className="w-12 h-12 rounded-full bg-indigo-50 flex items-center justify-center">
                                    <IconMapPin className="text-indigo-600" size={24} stroke={2} />
                                </div>
                                <div>
                                    <div className="text-sm font-bold text-slate-500 uppercase tracking-wider">Total Lokasi</div>
                                    <div className="text-2xl font-black text-slate-800 mt-1">{stats.total} <span className="text-sm font-medium text-slate-400">titik</span></div>
                                </div>
                            </div>
                            
                            <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex items-center gap-4">
                                <div className="w-12 h-12 rounded-full bg-emerald-50 flex items-center justify-center">
                                    <IconTree className="text-emerald-600" size={24} stroke={2} />
                                </div>
                                <div>
                                    <div className="text-sm font-bold text-slate-500 uppercase tracking-wider">Taman</div>
                                    <div className="text-2xl font-black text-slate-800 mt-1">{stats.taman} <span className="text-sm font-medium text-slate-400">titik</span></div>
                                </div>
                            </div>

                            <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex items-center gap-4">
                                <div className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center">
                                    <IconRoad className="text-slate-600" size={24} stroke={2} />
                                </div>
                                <div>
                                    <div className="text-sm font-bold text-slate-500 uppercase tracking-wider">Jalan</div>
                                    <div className="text-2xl font-black text-slate-800 mt-1">{stats.jalan} <span className="text-sm font-medium text-slate-400">titik</span></div>
                                </div>
                            </div>

                            <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex items-center gap-4">
                                <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center">
                                    <IconRulerMeasure className="text-blue-600" size={24} stroke={2} />
                                </div>
                                <div>
                                    <div className="text-sm font-bold text-slate-500 uppercase tracking-wider">Total Panjang</div>
                                    <div className="text-2xl font-black text-slate-800 mt-1">{formatDistance(stats.panjang)}</div>
                                </div>
                            </div>
                        </div>
                    )}
                    
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
