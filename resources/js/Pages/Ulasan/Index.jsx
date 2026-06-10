import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, usePage, router } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import Modal from '@/Components/Modal';
import Select from 'react-select';
import {
    IconStar,
    IconStarFilled,
    IconSearch,
    IconMessage2,
    IconTrash,
    IconThumbUp,
    IconAlertCircle,
    IconFilter,
    IconPhoto,
    IconEye,
    IconChevronDown,
    IconDownload,
    IconRefresh,
} from '@tabler/icons-react';
import Pagination from '@/Components/Pagination';

// ── Bintang mini ─────────────────────────────────────────
const StarRow = ({ rating }) => (
    <div className="flex items-center gap-0.5">
        {[...Array(5)].map((_, i) =>
            i < rating
                ? <IconStarFilled key={i} size={14} className="text-amber-400" />
                : <IconStar key={i} size={14} className="text-slate-200" />
        )}
        <span className="ml-1 text-xs font-bold text-slate-700">{rating}</span>
    </div>
);

// ── Badge status ──────────────────────────────────────────
const StatusBadge = ({ status }) => {
    const map = {
        disetujui: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
        menunggu: 'bg-amber-50  text-amber-700  ring-amber-200',
        ditolak: 'bg-red-50    text-red-700    ring-red-200',
    };
    const label = {
        disetujui: 'Disetujui',
        menunggu: 'Menunggu',
        ditolak: 'Ditolak',
    };
    return (
        <span className={`inline-flex items-center text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full ring-1 ${map[status] ?? 'bg-slate-50 text-slate-500 ring-slate-200'}`}>
            {label[status] ?? status}
        </span>
    );
};

export default function Index({ ulasans: initialUlasans, lokasis, stats, filters }) {
    const { auth } = usePage().props;
    const isKordinator = auth.user.roles?.includes('kordinator');
    const isAdminOrSuper = auth.user.roles?.includes('admin') || auth.user.roles?.includes('superadmin');

    const [ulasans, setUlasans] = useState(initialUlasans);
    const [searchTerm, setSearchTerm] = useState(filters?.search || '');
    const [selectedRating, setSelectedRating] = useState(filters?.rating || 'all');
    const [selectedStatus, setSelectedStatus] = useState(filters?.status || 'all');
    const [selectedLokasi, setSelectedLokasi] = useState(filters?.lokasi_id || null);

    const [isModalOpen, setIsModalOpen]   = useState(false);
    const [isResetModalOpen, setIsResetModalOpen] = useState(false);
    const [isResetting, setIsResetting] = useState(false);
    const [selectedPhoto, setSelectedPhoto] = useState(null);
    
    // State untuk Modal Hapus Satuan
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [itemToDelete, setItemToDelete] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const { data, setData, post, processing, errors, reset } = useForm({
        lokasi_id: '',
        rating: 5,
        komentar: '',
    });

    useEffect(() => { setUlasans(initialUlasans); }, [initialUlasans]);

    useEffect(() => {
        const t = setTimeout(() => {
            router.get(route('ulasan.index'), {
                search: searchTerm,
                rating: selectedRating,
                status: selectedStatus,
                lokasi_id: selectedLokasi || '',
            }, { preserveState: true, preserveScroll: true, replace: true });
        }, 400);
        return () => clearTimeout(t);
    }, [searchTerm, selectedRating, selectedStatus, selectedLokasi]);

    const submitReview = (e) => {
        e.preventDefault();
        post(route('ulasan.store'), { onSuccess: () => closeModal() });
    };

    const closeModal = () => { setIsModalOpen(false); reset(); };

    const handleStatusChange = (id, newStatus) => {
        router.put(route('ulasan.update', id), { status: newStatus }, {
            preserveScroll: true,
            onSuccess: () => setUlasans(prev => ({
                ...prev,
                data: prev.data.map(u => u.id === id ? { ...u, status: newStatus } : u)
            }))
        });
    };

    const confirmDelete = (id) => {
        setItemToDelete(id);
        setIsDeleteModalOpen(true);
    };

    const executeDelete = () => {
        if (!itemToDelete) return;
        setIsDeleting(true);
        router.delete(route('ulasan.destroy', itemToDelete), {
            preserveScroll: true,
            onSuccess: () => {
                setIsDeleteModalOpen(false);
                setItemToDelete(null);
                setUlasans(prev => ({
                    ...prev,
                    data: prev.data.filter(u => u.id !== itemToDelete)
                }));
            },
            onFinish: () => setIsDeleting(false)
        });
    };

    const handleResetData = () => {
        setIsResetModalOpen(true);
    };

    const confirmResetData = () => {
        setIsResetting(true);
        router.delete(route('ulasan.reset'), {
            preserveScroll: true,
            onSuccess: () => {
                setIsResetModalOpen(false);
                setUlasans({ ...ulasans, data: [], total: 0 });
            },
            onFinish: () => setIsResetting(false),
        });
    };

    const displayUlasans = ulasans.data || [];

    const hasActiveFilter = searchTerm || selectedRating !== 'all' || selectedStatus !== 'all' || selectedLokasi;

    const handleReset = () => {
        setSearchTerm('');
        setSelectedRating('all');
        setSelectedStatus('all');
        setSelectedLokasi(null);
    };

    const buildExportUrl = () => {
        const params = new URLSearchParams();
        if (searchTerm) params.set('search', searchTerm);
        if (selectedRating && selectedRating !== 'all') params.set('rating', selectedRating);
        if (selectedStatus && selectedStatus !== 'all') params.set('status', selectedStatus);
        if (selectedLokasi) params.set('lokasi_id', selectedLokasi);
        const qs = params.toString();
        return route('ulasan.export') + (qs ? '?' + qs : '');
    };

    const selectStyles = {
        control: (b, s) => ({
            ...b,
            borderColor: s.isFocused ? '#10B981' : '#cbd5e1',
            borderRadius: '0.75rem',
            padding: '0.25rem',
            boxShadow: s.isFocused ? '0 0 0 1px #10B981' : '0 1px 2px 0 rgba(0,0,0,0.05)',
            '&:hover': { borderColor: '#94a3b8' },
        }),
        menuPortal: (b) => ({ ...b, zIndex: 9999 }),
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h2 className="text-xl font-bold leading-tight text-black">Ulasan &amp; Feedback</h2>
                        <p className="text-xs text-slate-500 mt-1">Kelola masukan dan ulasan masyarakat terhadap kebersihan TPS</p>
                    </div>
                    <div className="flex items-center gap-2">
                        {/* Reset All Data (Hanya Admin) */}
                        {isAdminOrSuper && (
                            <button
                                onClick={handleResetData}
                                className="inline-flex items-center gap-2 rounded-2xl border border-red-600 bg-white px-5 py-3.5 text-xs font-black uppercase tracking-[0.15em] text-red-600 transition-all hover:bg-red-50 hover:shadow-md"
                                title="Hapus Semua Ulasan"
                            >
                                <IconTrash size={15} stroke={2.5} />
                                Reset Data
                            </button>
                        )}

                        {/* Download Excel */}
                        <a
                            href={buildExportUrl()}
                            className="inline-flex items-center gap-2 rounded-2xl border border-emerald-600 bg-white px-5 py-3.5 text-xs font-black uppercase tracking-[0.15em] text-emerald-700 transition-all hover:bg-emerald-50 hover:shadow-md"
                        >
                            <IconDownload size={15} stroke={2.5} />
                            Excel
                        </a>

                        {isKordinator && (
                            <button
                                onClick={() => setIsModalOpen(true)}
                                className="inline-flex items-center justify-center rounded-2xl border border-transparent bg-[#047857] px-6 py-4 text-xs font-black uppercase tracking-[0.2em] text-white transition-all duration-300 hover:bg-[#065f46] hover:shadow-lg"
                            >
                                Tambah Ulasan
                            </button>
                        )}
                    </div>
                </div>
            }
        >
            <Head title="Ulasan & Feedback" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-6">

                    {/* ── STATS CARDS ─────────────────────────────────── */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                        {[
                            { label: 'Rata-rata Rating', value: <span className="flex items-center gap-1">{stats.avg} <IconStarFilled size={18} className="text-amber-400" /></span>, bg: 'bg-amber-50', icon: <IconStar size={20} className="text-amber-500" /> },
                            { label: 'Total Ulasan', value: stats.total, bg: 'bg-emerald-50', icon: <IconMessage2 size={20} className="text-emerald-500" /> },
                            { label: 'Ulasan Positif', value: stats.positive, bg: 'bg-teal-50', icon: <IconThumbUp size={20} className="text-teal-500" /> },
                            { label: 'Menunggu Moderasi', value: stats.pending, bg: 'bg-amber-50', icon: <IconAlertCircle size={20} className="text-amber-500" /> },
                        ].map((s, i) => (
                            <div key={i} className="bg-white border border-slate-100 p-5 rounded-2xl shadow-sm flex items-center gap-4">
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${s.bg}`}>{s.icon}</div>
                                <div>
                                    <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest leading-tight">{s.label}</p>
                                    <p className="text-2xl font-black text-slate-900 mt-0.5 leading-none">{s.value}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* ── FILTER BAR ───────────────────────────────────── */}
                    <div className="bg-white border border-slate-100 rounded-2xl shadow-sm p-4">
                        <div className="flex flex-col lg:flex-row gap-3 items-stretch lg:items-center">
                            {/* Search */}
                            <div className="relative flex-1">
                                <IconSearch size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                                <input
                                    type="text"
                                    placeholder="Cari nama, komentar, atau lokasi..."
                                    className="w-full bg-slate-50 border border-slate-100 rounded-xl py-2.5 pl-9 pr-4 text-sm focus:ring-2 focus:ring-[#10B981] focus:border-transparent outline-none transition-all"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>

                            {/* Lokasi Select2 */}
                            <div className="min-w-[220px]">
                                <Select
                                    options={lokasis?.map(l => ({ value: l.id, label: l.lokasi }))}
                                    value={lokasis?.map(l => ({ value: l.id, label: l.lokasi })).find(o => o.value === selectedLokasi) || null}
                                    onChange={(opt) => setSelectedLokasi(opt ? opt.value : null)}
                                    placeholder="Semua Lokasi"
                                    isClearable
                                    menuPortalTarget={document.body}
                                    menuPosition="fixed"
                                    styles={{
                                        control: (b, s) => ({
                                            ...b,
                                            borderColor: s.isFocused ? '#10B981' : '#e2e8f0',
                                            borderRadius: '0.75rem',
                                            backgroundColor: '#f8fafc',
                                            minHeight: '42px',
                                            boxShadow: s.isFocused ? '0 0 0 2px #10B98133' : 'none',
                                            '&:hover': { borderColor: '#94a3b8' },
                                        }),
                                        menu: (b) => ({ ...b, borderRadius: '0.75rem', overflow: 'hidden', fontSize: '13px' }),
                                        menuPortal: (b) => ({ ...b, zIndex: 9999 }),
                                        placeholder: (b) => ({ ...b, color: '#94a3b8', fontSize: '14px' }),
                                        singleValue: (b) => ({ ...b, fontSize: '14px' }),
                                    }}
                                />
                            </div>

                            {/* Rating filter */}
                            <div className="relative">
                                <IconFilter size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                                <select
                                    className="appearance-none bg-slate-50 border border-slate-100 rounded-xl py-2.5 pl-8 pr-8 text-sm focus:ring-2 focus:ring-[#10B981] outline-none cursor-pointer"
                                    value={selectedRating}
                                    onChange={(e) => setSelectedRating(e.target.value)}
                                >
                                    <option value="all">Semua Rating</option>
                                    {[5, 4, 3, 2, 1].map(r => <option key={r} value={r}>{r} Bintang</option>)}
                                </select>
                                <IconChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                            </div>

                            {/* Status filter */}
                            <div className="relative">
                                <select
                                    className="appearance-none bg-slate-50 border border-slate-100 rounded-xl py-2.5 pl-4 pr-8 text-sm focus:ring-2 focus:ring-[#10B981] outline-none cursor-pointer"
                                    value={selectedStatus}
                                    onChange={(e) => setSelectedStatus(e.target.value)}
                                >
                                    <option value="all">Semua Status</option>
                                    <option value="disetujui">Disetujui</option>
                                    <option value="menunggu">Menunggu</option>
                                    <option value="ditolak">Ditolak</option>
                                </select>
                                <IconChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                            </div>

                            {/* Reset Button */}
                            {hasActiveFilter && (
                                <button
                                    onClick={handleReset}
                                    className="inline-flex items-center gap-2 justify-center rounded-xl bg-slate-100 px-4 py-2.5 text-sm font-bold text-slate-600 transition-all hover:bg-slate-200 hover:text-slate-800"
                                >
                                    <IconRefresh size={16} stroke={2} />
                                    Reset
                                </button>
                            )}
                        </div>
                    </div>

                    {/* ── TABLE ─────────────────────────────────────────── */}
                    <div className="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden">
                        {displayUlasans.length > 0 ? (
                            <>
                                <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-slate-100 text-sm">
                                        <thead className="bg-slate-50">
                                            <tr>
                                                <th className="px-4 py-3 text-left text-[11px] font-bold text-slate-400 uppercase tracking-wider w-8">#</th>
                                                <th className="px-4 py-3 text-left text-[11px] font-bold text-slate-400 uppercase tracking-wider">Nama</th>
                                                <th className="px-4 py-3 text-left text-[11px] font-bold text-slate-400 uppercase tracking-wider">Lokasi</th>
                                                <th className="px-4 py-3 text-left text-[11px] font-bold text-slate-400 uppercase tracking-wider">Rating</th>
                                                <th className="px-4 py-3 text-left text-[11px] font-bold text-slate-400 uppercase tracking-wider">Komentar</th>
                                                <th className="px-4 py-3 text-left text-[11px] font-bold text-slate-400 uppercase tracking-wider">Tanggal</th>
                                                <th className="px-4 py-3 text-left text-[11px] font-bold text-slate-400 uppercase tracking-wider">Status</th>
                                                <th className="px-4 py-3 text-center text-[11px] font-bold text-slate-400 uppercase tracking-wider">Aksi</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-50">
                                            {displayUlasans.map((ulasan, idx) => {
                                                const pageStart = ((ulasans.current_page ?? 1) - 1) * (ulasans.per_page ?? 15);
                                                return (
                                                    <tr key={ulasan.id} className="hover:bg-slate-50/60 transition-colors group">
                                                        {/* No */}
                                                        <td className="px-4 py-3 text-slate-400 text-xs font-medium">{pageStart + idx + 1}</td>

                                                        {/* Nama + avatar */}
                                                        <td className="px-4 py-3">
                                                            <div className="flex items-center gap-2.5">
                                                                <img
                                                                    src={ulasan.avatar}
                                                                    alt={ulasan.nama}
                                                                    className="w-8 h-8 rounded-full object-cover ring-2 ring-emerald-100 shrink-0"
                                                                />
                                                                <span className="font-semibold text-slate-800 whitespace-nowrap">{ulasan.nama}</span>
                                                            </div>
                                                        </td>

                                                        {/* Lokasi */}
                                                        <td className="px-4 py-3">
                                                            <span className="inline-flex items-center gap-1 text-xs font-medium text-slate-600 bg-slate-100 px-2.5 py-1 rounded-full whitespace-nowrap max-w-[180px] truncate">
                                                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
                                                                {ulasan.lokasi}
                                                            </span>
                                                        </td>

                                                        {/* Rating */}
                                                        <td className="px-4 py-3">
                                                            <StarRow rating={ulasan.rating} />
                                                        </td>

                                                        {/* Komentar */}
                                                        <td className="px-4 py-3 max-w-xs">
                                                            <p className="text-slate-600 text-xs leading-relaxed line-clamp-2">
                                                                {ulasan.komentar || <span className="text-slate-300 italic">— tidak ada komentar —</span>}
                                                            </p>
                                                        </td>

                                                        {/* Tanggal + Jam */}
                                                        <td className="px-4 py-3 whitespace-nowrap">
                                                            <p className="text-xs text-slate-600 font-medium">{ulasan.tanggal}</p>
                                                            <p className="text-[10px] text-slate-400">{ulasan.jam} WIB</p>
                                                        </td>

                                                        {/* Status */}
                                                        <td className="px-4 py-3">
                                                            {isAdminOrSuper ? (
                                                                <div className="relative">
                                                                    <select
                                                                        className={`appearance-none text-[10px] font-extrabold uppercase tracking-wider pl-2.5 pr-6 py-1 rounded-full border-none focus:ring-0 cursor-pointer outline-none ${ulasan.status === 'disetujui' ? 'bg-emerald-50 text-emerald-700' :
                                                                                ulasan.status === 'ditolak' ? 'bg-red-50 text-red-700' :
                                                                                    'bg-amber-50 text-amber-700'
                                                                            }`}
                                                                        value={ulasan.status}
                                                                        onChange={(e) => handleStatusChange(ulasan.id, e.target.value)}
                                                                    >
                                                                        <option value="disetujui">Disetujui</option>
                                                                        <option value="menunggu">Menunggu</option>
                                                                        <option value="ditolak">Ditolak</option>
                                                                    </select>
                                                                </div>
                                                            ) : (
                                                                <StatusBadge status={ulasan.status} />
                                                            )}
                                                        </td>

                                                        {/* Aksi */}
                                                        <td className="px-4 py-3">
                                                            <div className="flex items-center justify-center gap-1.5">
                                                                {ulasan.foto && (
                                                                    <button
                                                                        onClick={() => setSelectedPhoto(ulasan.foto)}
                                                                        title="Lihat Foto"
                                                                        className="p-1.5 text-blue-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                                    >
                                                                        <IconPhoto size={15} stroke={2} />
                                                                    </button>
                                                                )}
                                                                {isAdminOrSuper && (
                                                                    <button
                                                                        onClick={() => confirmDelete(ulasan.id)}
                                                                        title="Hapus Ulasan"
                                                                        className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                                                    >
                                                                        <IconTrash size={15} stroke={2} />
                                                                    </button>
                                                                )}
                                                                {!ulasan.foto && !isAdminOrSuper && (
                                                                    <span className="text-slate-300 text-xs italic">—</span>
                                                                )}
                                                            </div>
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>

                                {/* Footer: count + pagination */}
                                <div className="px-5 py-3 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-50/50">
                                    <p className="text-xs text-slate-400">
                                        Menampilkan <span className="font-bold text-slate-600">{displayUlasans.length}</span> dari <span className="font-bold text-slate-600">{ulasans.total}</span> ulasan
                                    </p>
                                    {ulasans.last_page > 1 && (
                                        <Pagination links={ulasans.links} />
                                    )}
                                </div>
                            </>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-20 text-center">
                                <div className="w-14 h-14 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                                    <IconMessage2 size={28} className="text-slate-300" stroke={1.5} />
                                </div>
                                <h3 className="text-base font-bold text-slate-700">Tidak ada ulasan ditemukan</h3>
                                <p className="text-sm text-slate-400 mt-1">Coba sesuaikan filter atau kata kunci pencarian.</p>
                            </div>
                        )}
                    </div>

                </div>
            </div>

            {/* ── MODAL FOTO ───────────────────────────────────────── */}
            <Modal show={!!selectedPhoto} onClose={() => setSelectedPhoto(null)} maxWidth="2xl">
                <div className="relative bg-white rounded-[2rem] p-4 flex flex-col items-center justify-center min-h-[50vh]">
                    <button
                        onClick={() => setSelectedPhoto(null)}
                        className="absolute top-4 right-4 bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-700 rounded-full p-2 transition-colors z-10"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                    {selectedPhoto && (
                        <img
                            src={selectedPhoto}
                            alt="Foto Ulasan"
                            className="max-w-full max-h-[80vh] object-contain rounded-xl mt-8"
                        />
                    )}
                </div>
            </Modal>

            {/* ── MODAL TAMBAH ULASAN ──────────────────────────────── */}
            <Modal show={isModalOpen} onClose={closeModal} maxWidth="md">
                <div className="p-6">
                    <h2 className="text-lg font-bold text-slate-900 mb-4">Tambah Ulasan Baru</h2>
                    <form onSubmit={submitReview} className="space-y-4">

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Lokasi TPS <span className="text-red-500">*</span></label>
                            <Select
                                id="lokasi_id"
                                options={lokasis?.map(l => ({ value: l.id, label: l.lokasi }))}
                                value={lokasis?.map(l => ({ value: l.id, label: l.lokasi })).find(o => o.value === data.lokasi_id) || null}
                                onChange={(opt) => setData('lokasi_id', opt ? opt.value : '')}
                                placeholder="-- Pilih Lokasi TPS --"
                                isClearable menuPortalTarget={document.body} menuPosition="fixed"
                                className="mt-1" styles={selectStyles}
                            />
                            {errors.lokasi_id && <p className="text-red-500 text-xs mt-1">{errors.lokasi_id}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">Rating <span className="text-red-500">*</span></label>
                            <div className="flex items-center gap-2">
                                {[1, 2, 3, 4, 5].map(star => (
                                    <button key={star} type="button" onClick={() => setData('rating', star)} className="focus:outline-none transition-transform hover:scale-110">
                                        {star <= data.rating
                                            ? <IconStarFilled size={32} className="text-amber-400" />
                                            : <IconStar size={32} className="text-slate-300 hover:text-amber-200" />
                                        }
                                    </button>
                                ))}
                            </div>
                            {errors.rating && <p className="text-red-500 text-xs mt-1">{errors.rating}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Komentar</label>
                            <textarea
                                className="w-full bg-slate-50 border-none rounded-xl py-3 px-4 text-sm focus:ring-2 focus:ring-[#10B981] transition-all resize-none"
                                rows="4"
                                placeholder="Tulis komentar atau pengalaman Anda di sini..."
                                value={data.komentar}
                                onChange={e => setData('komentar', e.target.value)}
                            />
                            {errors.komentar && <p className="text-red-500 text-xs mt-1">{errors.komentar}</p>}
                        </div>

                        <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                            <button type="button" onClick={closeModal} className="px-5 py-2.5 rounded-xl text-sm font-bold text-slate-600 border border-slate-200 hover:bg-slate-50 transition-colors">Batal</button>
                            <button type="submit" disabled={processing} className="px-5 py-2.5 rounded-xl text-sm font-bold text-white bg-[#047857] hover:bg-[#065f46] transition-colors disabled:opacity-50">
                                {processing ? 'Menyimpan...' : 'Simpan Ulasan'}
                            </button>
                        </div>
                    </form>
                </div>
            </Modal>
            {/* ── MODAL KONFIRMASI RESET ────────────────────────────── */}
            <Modal show={isResetModalOpen} onClose={() => setIsResetModalOpen(false)} maxWidth="sm">
                <div className="p-6 text-center">
                    <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
                        <IconAlertCircle size={32} className="text-red-500" stroke={2} />
                    </div>
                    <h2 className="text-lg font-bold text-slate-900 mb-2">Hapus Semua Ulasan?</h2>
                    <p className="text-sm text-slate-500 mb-6">
                        Tindakan ini akan menghapus <strong>seluruh data ulasan beserta fotonya</strong> secara permanen. Anda tidak dapat mengembalikan data yang sudah dihapus.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-3 justify-center">
                        <button
                            onClick={() => setIsResetModalOpen(false)}
                            className="px-5 py-2.5 rounded-xl text-sm font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors w-full sm:w-auto"
                        >
                            Batal
                        </button>
                        <button
                            onClick={confirmResetData}
                            disabled={isResetting}
                            className="px-5 py-2.5 rounded-xl text-sm font-bold text-white bg-red-600 hover:bg-red-700 transition-colors shadow-sm shadow-red-200 w-full sm:w-auto disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {isResetting ? (
                                <>
                                    <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Menghapus...
                                </>
                            ) : (
                                'Ya, Hapus Semua'
                            )}
                        </button>
                    </div>
                </div>
            </Modal>

            {/* ── MODAL KONFIRMASI HAPUS SATUAN ────────────────────────────── */}
            <Modal show={isDeleteModalOpen} onClose={() => !isDeleting && setIsDeleteModalOpen(false)} maxWidth="sm">
                <div className="p-6 text-center">
                    <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
                        <IconAlertCircle size={32} className="text-red-500" stroke={2} />
                    </div>
                    <h2 className="text-lg font-bold text-slate-900 mb-2">Hapus Ulasan Ini?</h2>
                    <p className="text-sm text-slate-500 mb-6">
                        Ulasan ini akan dihapus permanen dan tidak dapat dikembalikan.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-3 justify-center">
                        <button
                            onClick={() => setIsDeleteModalOpen(false)}
                            disabled={isDeleting}
                            className="px-5 py-2.5 rounded-xl text-sm font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors w-full sm:w-auto"
                        >
                            Batal
                        </button>
                        <button
                            onClick={executeDelete}
                            disabled={isDeleting}
                            className="px-5 py-2.5 rounded-xl text-sm font-bold text-white bg-red-600 hover:bg-red-700 transition-colors shadow-sm shadow-red-200 w-full sm:w-auto disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {isDeleting ? (
                                <>
                                    <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Menghapus...
                                </>
                            ) : (
                                'Ya, Hapus'
                            )}
                        </button>
                    </div>
                </div>
            </Modal>
        </AuthenticatedLayout>
    );
}
