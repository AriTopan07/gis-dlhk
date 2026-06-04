import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, usePage, router } from '@inertiajs/react';
import { useState, useMemo, useEffect } from 'react';
import Modal from '@/Components/Modal';
import Select from 'react-select';
import { 
    IconStar, 
    IconStarFilled, 
    IconSearch, 
    IconMessage2, 
    IconCheck, 
    IconTrash, 
    IconThumbUp, 
    IconAlertCircle,
    IconFilter,
    IconPlus
} from '@tabler/icons-react';

import Pagination from '@/Components/Pagination';

export default function Index({ ulasans: initialUlasans, lokasis, stats, filters }) {
    const { auth } = usePage().props;
    const isKordinator = auth.user.roles?.includes('kordinator');
    const isAdminOrSuper = auth.user.roles?.includes('admin') || auth.user.roles?.includes('superadmin');

    const [ulasans, setUlasans] = useState(initialUlasans);
    const [searchTerm, setSearchTerm] = useState(filters?.search || '');
    const [selectedRating, setSelectedRating] = useState(filters?.rating || 'all');
    const [selectedStatus, setSelectedStatus] = useState(filters?.status || 'all');

    const [isModalOpen, setIsModalOpen] = useState(false);

    const { data, setData, post, processing, errors, reset } = useForm({
        lokasi_id: '',
        rating: 5,
        komentar: '',
    });

    useEffect(() => {
        setUlasans(initialUlasans);
    }, [initialUlasans]);

    useEffect(() => {
        // Skip first render if filters are not set (already loaded)
        // Add a debounce for searching and filtering
        const delayBounceFn = setTimeout(() => {
            router.get(route('ulasan.index'), {
                search: searchTerm,
                rating: selectedRating,
                status: selectedStatus,
            }, {
                preserveState: true,
                preserveScroll: true,
                replace: true,
            });
        }, 500);

        return () => clearTimeout(delayBounceFn);
    }, [searchTerm, selectedRating, selectedStatus]);

    const submitReview = (e) => {
        e.preventDefault();
        post(route('ulasan.store'), {
            onSuccess: () => {
                closeModal();
            }
        });
    };

    const closeModal = () => {
        setIsModalOpen(false);
        reset();
    };

    // ── ADMIN ACTIONS ─────────────────────────────────────────
    const handleStatusChange = (id, newStatus) => {
        router.put(route('ulasan.update', id), { status: newStatus }, {
            preserveScroll: true,
            onSuccess: () => {
                setUlasans(prev => prev.map(u => u.id === id ? { ...u, status: newStatus } : u));
            }
        });
    };

    const handleDelete = (id) => {
        if (confirm('Apakah Anda yakin ingin menghapus ulasan ini?')) {
            router.delete(route('ulasan.destroy', id), {
                preserveScroll: true,
                onSuccess: () => {
                    setUlasans(prev => prev.filter(u => u.id !== id));
                }
            });
        }
    };

    // ── LOGIC PINDAH KE SERVER ─────────────────────────────────
    // Filtering and Stats are now handled by UlasanController
    const displayUlasans = ulasans.data || [];

    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h2 className="text-xl font-bold leading-tight text-black">Ulasan & Feedback</h2>
                        <p className="text-xs text-slate-500 mt-1">Kelola masukan dan ulasan masyarakat terhadap kebersihan TPS</p>
                    </div>
                    {isKordinator && (
                        <button
                            onClick={() => setIsModalOpen(true)}
                            className="inline-flex items-center justify-center rounded-2xl border border-transparent bg-[#047857] px-6 py-4 text-xs font-black uppercase tracking-[0.2em] text-white transition-all duration-300 hover:bg-[#065f46] hover:shadow-lg hover:shadow-green-900/10 focus:outline-none focus:ring-2 focus:ring-[#10B981] focus:ring-offset-2 active:bg-[#064e3b]"
                        >
                            Tambah Ulasan
                        </button>
                    )}
                </div>
            }
        >
            <Head title="Ulasan & Feedback" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-8">
                    
                    {/* ── STATS CARDS ─────────────────────────────────────── */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {/* Avg Rating Card */}
                        <div className="bg-white border border-slate-100 p-6 rounded-[2rem] shadow-sm flex items-center justify-between">
                            <div>
                                <span className="text-xs font-semibold text-slate-400 uppercase tracking-widest block">Rata-rata Rating</span>
                                <span className="text-3xl font-black text-slate-900 mt-1 inline-flex items-center gap-2">
                                    {stats.avg}
                                    <IconStarFilled className="text-amber-400" size={24} />
                                </span>
                            </div>
                            <div className="w-12 h-12 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-500">
                                <IconStar size={24} stroke={2} />
                            </div>
                        </div>

                        {/* Total Reviews Card */}
                        <div className="bg-white border border-slate-100 p-6 rounded-[2rem] shadow-sm flex items-center justify-between">
                            <div>
                                <span className="text-xs font-semibold text-slate-400 uppercase tracking-widest block">Total Ulasan</span>
                                <span className="text-3xl font-black text-slate-900 mt-1 block">{stats.total}</span>
                            </div>
                            <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-500">
                                <IconMessage2 size={24} stroke={2} />
                            </div>
                        </div>

                        {/* Positive Reviews Card */}
                        <div className="bg-white border border-slate-100 p-6 rounded-[2rem] shadow-sm flex items-center justify-between">
                            <div>
                                <span className="text-xs font-semibold text-slate-400 uppercase tracking-widest block">Ulasan Positif (≥4★)</span>
                                <span className="text-3xl font-black text-emerald-600 mt-1 block">{stats.positive}</span>
                            </div>
                            <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-500">
                                <IconThumbUp size={24} stroke={2} />
                            </div>
                        </div>

                        {/* Pending Moderation Card */}
                        <div className="bg-white border border-slate-100 p-6 rounded-[2rem] shadow-sm flex items-center justify-between">
                            <div>
                                <span className="text-xs font-semibold text-slate-400 uppercase tracking-widest block">Menunggu Moderasi</span>
                                <span className="text-3xl font-black text-amber-600 mt-1 block">{stats.pending}</span>
                            </div>
                            <div className="w-12 h-12 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-500">
                                <IconAlertCircle size={24} stroke={2} />
                            </div>
                        </div>
                    </div>

                    {/* ── FILTER SECTION ─────────────────────────────────── */}
                    <div className="bg-white border border-slate-100 p-6 rounded-[2rem] shadow-sm space-y-4">
                        <div className="flex flex-col lg:flex-row gap-4 justify-between items-stretch lg:items-center">
                            
                            {/* Search bar */}
                            <div className="relative flex-1">
                                <input
                                    type="text"
                                    placeholder="Cari nama, komentar, atau lokasi..."
                                    className="w-full bg-slate-50 border-none rounded-2xl py-3.5 pl-11 pr-4 text-sm focus:ring-2 focus:ring-[#10B981] transition-all"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                                    <IconSearch size={18} stroke={2} />
                                </div>
                            </div>

                            {/* Dropdowns */}
                            <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center">
                                {/* Rating Filter */}
                                <div className="flex items-center gap-2">
                                    <IconFilter size={16} className="text-slate-400" />
                                    <select
                                        className="bg-slate-50 border-none rounded-2xl py-3 pl-4 pr-10 text-sm focus:ring-2 focus:ring-[#10B981] transition-all cursor-pointer"
                                        value={selectedRating}
                                        onChange={(e) => setSelectedRating(e.target.value)}
                                    >
                                        <option value="all">Semua Rating</option>
                                        <option value="5">5 Bintang</option>
                                        <option value="4">4 Bintang</option>
                                        <option value="3">3 Bintang</option>
                                        <option value="2">2 Bintang</option>
                                        <option value="1">1 Bintang</option>
                                    </select>
                                </div>

                                {/* Status Filter */}
                                <select
                                    className="bg-slate-50 border-none rounded-2xl py-3 pl-4 pr-10 text-sm focus:ring-2 focus:ring-[#10B981] transition-all cursor-pointer"
                                    value={selectedStatus}
                                    onChange={(e) => setSelectedStatus(e.target.value)}
                                >
                                    <option value="all">Semua Status</option>
                                    <option value="disetujui">Disetujui</option>
                                    <option value="menunggu">Menunggu Moderasi</option>
                                </select>
                            </div>

                        </div>
                    </div>

                    {/* ── REVIEWS GRID/LIST ───────────────────────────────── */}
                    {displayUlasans.length > 0 ? (
                        <>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {displayUlasans.map((ulasan) => (
                                <div 
                                    key={ulasan.id} 
                                    className="bg-white border border-slate-100 rounded-[2rem] p-6 shadow-sm flex flex-col justify-between hover:shadow-md transition-all duration-300 group"
                                >
                                    <div className="space-y-4">
                                        {/* User Details */}
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <img 
                                                    src={ulasan.avatar} 
                                                    alt={ulasan.nama} 
                                                    className="w-10 h-10 rounded-full object-cover ring-2 ring-emerald-500/20"
                                                />
                                                <div>
                                                    <h4 className="text-sm font-bold text-slate-900 leading-tight">{ulasan.nama}</h4>
                                                    <span className="text-[10px] text-slate-400 font-medium">{ulasan.tanggal}</span>
                                                </div>
                                            </div>
                                            {/* Status / Admin Controls */}
                                            {isAdminOrSuper ? (
                                                <div className="flex items-center gap-2">
                                                    <select
                                                        className={`text-[10px] font-extrabold uppercase tracking-wider px-3 py-1 rounded-full border-none focus:ring-0 cursor-pointer ${
                                                            ulasan.status === 'disetujui'
                                                            ? 'bg-emerald-50 text-emerald-700'
                                                            : ulasan.status === 'ditolak'
                                                            ? 'bg-red-50 text-red-700'
                                                            : 'bg-amber-50 text-amber-700'
                                                        }`}
                                                        value={ulasan.status}
                                                        onChange={(e) => handleStatusChange(ulasan.id, e.target.value)}
                                                    >
                                                        <option value="disetujui">Disetujui</option>
                                                        <option value="menunggu">Menunggu</option>
                                                        <option value="ditolak">Ditolak</option>
                                                    </select>
                                                    <button
                                                        onClick={() => handleDelete(ulasan.id)}
                                                        className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
                                                        title="Hapus Ulasan"
                                                    >
                                                        <IconTrash size={16} stroke={2} />
                                                    </button>
                                                </div>
                                            ) : (
                                                <span className={`text-[10px] font-extrabold uppercase tracking-wider px-3 py-1 rounded-full ${
                                                    ulasan.status === 'disetujui'
                                                    ? 'bg-emerald-50 text-emerald-700'
                                                    : ulasan.status === 'ditolak'
                                                    ? 'bg-red-50 text-red-700'
                                                    : 'bg-amber-50 text-amber-700'
                                                }`}>
                                                    {ulasan.status}
                                                </span>
                                            )}
                                        </div>

                                        {/* Location Tag */}
                                        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-2xl bg-slate-50 border border-slate-100 text-xs font-semibold text-slate-600">
                                            <span className="w-1.5 h-1.5 rounded-full bg-[#10B981]"></span>
                                            {ulasan.lokasi}
                                        </div>

                                        {/* Stars */}
                                        <div className="flex items-center gap-1 text-amber-400">
                                            {[...Array(5)].map((_, i) => (
                                                i < ulasan.rating 
                                                ? <IconStarFilled key={i} size={16} />
                                                : <IconStar key={i} size={16} className="text-slate-200" />
                                            ))}
                                        </div>

                                        {/* Review text */}
                                        <p className="text-sm text-slate-600 leading-relaxed font-medium">
                                            "{ulasan.komentar}"
                                        </p>
                                    </div>
                                </div>
                            ))}
                            </div>
                            
                            {/* Pagination Component */}
                            {ulasans.links && ulasans.last_page > 1 && (
                                <div className="mt-8 pt-8 border-t border-slate-100 flex justify-center">
                                    <Pagination links={ulasans.links} />
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="bg-white border border-slate-100 p-16 rounded-[2rem] text-center shadow-sm max-w-lg mx-auto">
                            <div className="w-16 h-16 bg-slate-50 text-slate-400 rounded-full flex items-center justify-center mx-auto mb-4">
                                <IconMessage2 size={32} stroke={1.5} />
                            </div>
                            <h3 className="text-lg font-bold text-slate-900">Ulasan Tidak Ditemukan</h3>
                            <p className="text-sm text-slate-400 mt-2 max-w-sm mx-auto">
                                Coba sesuaikan kata kunci pencarian Anda atau bersihkan filter rating/status.
                            </p>
                        </div>
                    )}

                </div>
            </div>

            {/* Modal Tambah Ulasan */}
            <Modal show={isModalOpen} onClose={closeModal} maxWidth="md">
                <div className="p-6">
                    <h2 className="text-lg font-bold text-slate-900 mb-4">Tambah Ulasan Baru</h2>
                    <form onSubmit={submitReview} className="space-y-4">
                        
                        {/* Lokasi */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Lokasi TPS <span className="text-red-500">*</span></label>
                            <Select
                                id="lokasi_id"
                                options={lokasis?.map(lok => ({
                                    value: lok.id,
                                    label: lok.lokasi
                                }))}
                                value={lokasis?.map(lok => ({
                                    value: lok.id,
                                    label: lok.lokasi
                                })).find(o => o.value === data.lokasi_id) || null}
                                onChange={(option) => setData('lokasi_id', option ? option.value : '')}
                                placeholder="-- Pilih Lokasi TPS --"
                                isClearable
                                menuPortalTarget={document.body}
                                menuPosition="fixed"
                                className="mt-1"
                                styles={{
                                    control: (base, state) => ({
                                        ...base,
                                        borderColor: state.isFocused ? '#10B981' : '#cbd5e1',
                                        borderRadius: '0.75rem',
                                        padding: '0.25rem',
                                        boxShadow: state.isFocused ? '0 0 0 1px #10B981' : '0 1px 2px 0 rgba(0,0,0,0.05)',
                                        '&:hover': { borderColor: state.isFocused ? '#10B981' : '#94a3b8' },
                                    }),
                                    menuPortal: (base) => ({ ...base, zIndex: 9999 }),
                                }}
                            />
                            {errors.lokasi_id && <p className="text-red-500 text-xs mt-1">{errors.lokasi_id}</p>}
                        </div>

                        {/* Rating */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Rating <span className="text-red-500">*</span></label>
                            <div className="flex items-center gap-2">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <button
                                        type="button"
                                        key={star}
                                        onClick={() => setData('rating', star)}
                                        className="focus:outline-none transition-transform hover:scale-110"
                                    >
                                        {star <= data.rating ? (
                                            <IconStarFilled size={32} className="text-amber-400" />
                                        ) : (
                                            <IconStar size={32} className="text-slate-300 hover:text-amber-200" />
                                        )}
                                    </button>
                                ))}
                            </div>
                            {errors.rating && <p className="text-red-500 text-xs mt-1">{errors.rating}</p>}
                        </div>

                        {/* Komentar */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Komentar</label>
                            <textarea
                                className="w-full bg-slate-50 border-none rounded-xl py-3 px-4 text-sm focus:ring-2 focus:ring-[#10B981] transition-all resize-none"
                                rows="4"
                                placeholder="Tulis komentar atau pengalaman Anda di sini..."
                                value={data.komentar}
                                onChange={e => setData('komentar', e.target.value)}
                            ></textarea>
                            {errors.komentar && <p className="text-red-500 text-xs mt-1">{errors.komentar}</p>}
                        </div>

                        {/* Buttons */}
                        <div className="flex justify-end gap-4 pt-6 border-t border-slate-100 mt-6">
                            <button
                                type="button"
                                onClick={closeModal}
                                className="inline-flex items-center justify-center rounded-2xl border border-slate-300 bg-white px-6 py-4 text-xs font-black uppercase tracking-[0.2em] text-slate-700 transition-all duration-300 hover:bg-slate-50 hover:shadow-lg hover:shadow-slate-200/50 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2"
                            >
                                Batal
                            </button>
                            <button
                                type="submit"
                                disabled={processing}
                                className="inline-flex items-center justify-center rounded-2xl border border-transparent bg-[#047857] px-6 py-4 text-xs font-black uppercase tracking-[0.2em] text-white transition-all duration-300 hover:bg-[#065f46] hover:shadow-lg hover:shadow-green-900/10 focus:outline-none focus:ring-2 focus:ring-[#10B981] focus:ring-offset-2 active:bg-[#064e3b] disabled:opacity-50"
                            >
                                {processing ? 'Menyimpan...' : 'Simpan Ulasan'}
                            </button>
                        </div>
                    </form>
                </div>
            </Modal>
        </AuthenticatedLayout>
    );
}
