import { Head, Link, useForm } from '@inertiajs/react';
import React, { useState } from 'react';
import Sidebar from '@/Components/Sidebar';
import MapComponent from '@/Components/MapComponent';
import Modal from '@/Components/Modal';

// ── Icons ──────────────────────────────────────────────────
const Icons = {
    Star: ({ filled }) => (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"
            fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2"
            strokeLinecap="round" strokeLinejoin="round">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
        </svg>
    ),
    Camera: () => (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24"
            fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/>
            <circle cx="12" cy="13" r="3"/>
        </svg>
    ),
    X: () => (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24"
            fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 6 6 18"/><path d="m6 6 12 12"/>
        </svg>
    ),
    MapPin: () => (
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"
            fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/>
        </svg>
    ),
};

const StarRating = ({ value, onChange, size = 'lg' }) => {
    const [hover, setHover] = useState(0);
    const sizeClass = size === 'lg' ? 'w-10 h-10' : 'w-6 h-6';

    return (
        <div className="flex gap-1 items-center">
            {[1, 2, 3, 4, 5].map(star => (
                <button
                    key={star}
                    type="button"
                    onClick={() => onChange(star)}
                    onMouseEnter={() => setHover(star)}
                    onMouseLeave={() => setHover(0)}
                    className={`${sizeClass} transition-all duration-200 ${
                        star <= (hover || value)
                            ? 'text-amber-400 scale-110'
                            : 'text-slate-300 hover:text-amber-200'
                    }`}
                >
                    <Icons.Star filled={star <= (hover || value)} />
                </button>
            ))}
        </div>
    );
};

export default function Welcome({ auth, canReview }) {
    const [selectedKecamatan, setSelectedKecamatan] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    // ── Review Modal States ─────────────────────────────────
    const [showReviewModal, setShowReviewModal] = useState(false);
    const [selectedLokasi, setSelectedLokasi] = useState(null);
    const [fotoPreview, setFotoPreview] = useState(null);

    const { data, setData, post, processing, errors, reset } = useForm({
        lokasi_id: '',
        nama_pengulas: '',
        rating: 0,
        komentar: '',
        foto: null,
    });

    const openReviewModal = (marker) => {
        setSelectedLokasi(marker);
        setData('lokasi_id', marker.id);
        setShowReviewModal(true);
    };

    const closeReviewModal = () => {
        setShowReviewModal(false);
        setSelectedLokasi(null);
        setFotoPreview(null);
        reset();
    };

    const handleFotoChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setData('foto', file);
        const reader = new FileReader();
        reader.onload = (ev) => setFotoPreview(ev.target.result);
        reader.readAsDataURL(file);
    };

    const removeFoto = () => {
        setData('foto', null);
        setFotoPreview(null);
    };

    const submitReview = (e) => {
        e.preventDefault();
        post(route('ulasan.store'), {
            forceFormData: true,
            onSuccess: () => {
                closeReviewModal();
                // Optionally reload data or trigger a map refresh if needed
                window.location.reload();
            },
        });
    };

    const kecamatanList = [
        "Balongbendo", "Buduran", "Candi", "Gedangan", "Jabon", 
        "Krembung", "Krian", "Porong", "Prambon", "Sedati", 
        "Sidoarjo", "Sukodono", "Taman", "Tanggulangin", 
        "Tarik", "Tulangan", "Waru", "Wonoayu"
    ];

    const handleKecamatanClick = (kecamatan) => {
        setSelectedKecamatan(kecamatan);
    };

    const handleReset = () => {
        setSelectedKecamatan(null);
        setSearchTerm('');
    };

    return (
        <>
            <Head title="DLHK Kabupaten Sidoarjo - Beranda" />
            
            <div className="flex h-screen bg-[#F8FAFC] overflow-hidden font-sans">
                {/* Mobile Backdrop Overlay */}
                {isSidebarOpen && (
                    <div 
                        className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[1000] md:hidden"
                        onClick={() => setIsSidebarOpen(false)}
                    ></div>
                )}

                {/* Sidebar Component */}
                <Sidebar 
                    kecamatanList={kecamatanList} 
                    onKecamatanClick={(kec) => {
                        handleKecamatanClick(kec);
                        setIsSidebarOpen(false); // Close on selection in mobile
                    }}
                    searchTerm={searchTerm}
                    setSearchTerm={setSearchTerm}
                    activeKecamatan={selectedKecamatan}
                    isOpen={isSidebarOpen}
                    onClose={() => setIsSidebarOpen(false)}
                />

                {/* Main Content Area */}
                <div className="flex-1 flex flex-col relative md:ml-80">
                    {/* Top Header */}
                    <header className="h-20 bg-white/80 backdrop-blur-md border-b border-gray-100 flex items-center justify-between px-8 z-[1000] sticky top-0">
                    <div className="flex items-center gap-4">
                        {/* Mobile Menu Toggle */}
                        <button 
                            onClick={() => setIsSidebarOpen(true)}
                            className="p-3 bg-[#F8FAFC] rounded-xl text-gray-600 md:hidden hover:bg-gray-100 transition-colors"
                        >
                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                            </svg>
                        </button>
                        <h2 className="text-sm font-black text-[#0f172a] uppercase tracking-widest hidden lg:block">Pemetaan Tenaga Kebersihan Jalan dan Perawatan Taman</h2>
                    </div>

                        {/* User / Auth Section */}
                        <div className="flex items-center gap-6">
                            <div className="text-right hidden sm:block">
                                <p className="text-xs font-bold text-gray-800">{new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                                <p className="text-[10px] text-gray-400 font-medium uppercase tracking-tighter">Kabupaten Sidoarjo</p>
                            </div>
                            
                            {auth.user ? (
                                <Link
                                    href={route('dashboard')}
                                    className="w-10 h-10 bg-[#1E293B] rounded-xl flex items-center justify-center shadow-lg shadow-slate-200 border border-slate-700 hover:bg-slate-800 transition-colors"
                                >
                                    <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                    </svg>
                                </Link>
                            ) : (
                                <Link
                                    href={route('login')}
                                    className="w-10 h-10 bg-white rounded-xl flex items-center justify-center border border-gray-100 shadow-sm hover:shadow-md transition-shadow group"
                                >
                                    <svg className="w-5 h-5 text-gray-400 group-hover:text-[#047857] transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                                    </svg>
                                </Link>
                            )}
                        </div>
                    </header>

                    {/* Map Container */}
                    <main className="flex-1 relative">
                        <MapComponent 
                            selectedKecamatan={selectedKecamatan} 
                            activeKecamatan={selectedKecamatan}
                            canReview={true}
                            onOpenReview={openReviewModal}
                        />
                    </main>
                </div>
            </div>

            {/* ── Review Modal ──────────────────────────────────────── */}
            <Modal show={showReviewModal} maxWidth="lg" onClose={closeReviewModal}>
                <form onSubmit={submitReview} className="relative">
                    {/* Header */}
                    <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-white rounded-t-2xl">
                        <div>
                            <h2 className="text-xl font-bold text-slate-800">Beri Ulasan</h2>
                            <p className="text-xs text-slate-500 mt-1">Bagaimana penilaian Anda terhadap lokasi ini?</p>
                        </div>
                        <button type="button" onClick={closeReviewModal} className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 transition-colors">
                            <Icons.X size={18} />
                        </button>
                    </div>

                    {/* Body */}
                    <div className="px-6 py-5 space-y-5 overflow-y-auto max-h-[60vh]">
                        {/* Lokasi Info */}
                        <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
                                <Icons.MapPin size={20} />
                            </div>
                            <div>
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Lokasi yang diulas</span>
                                <span className="text-sm font-bold text-slate-800">{selectedLokasi?.lokasi}</span>
                            </div>
                        </div>

                        {/* Nama Pengulas */}
                        {!auth.user && (
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">Nama Anda <span className="text-red-500">*</span></label>
                                <input
                                    type="text"
                                    required
                                    value={data.nama_pengulas}
                                    onChange={e => setData('nama_pengulas', e.target.value)}
                                    placeholder="Masukkan nama Anda..."
                                    className="w-full rounded-xl border-slate-200 bg-slate-50 text-sm text-slate-700 placeholder-slate-400 focus:border-emerald-400 focus:ring-emerald-400 transition-colors"
                                />
                                {errors.nama_pengulas && <p className="text-xs text-red-500 mt-1">{errors.nama_pengulas}</p>}
                            </div>
                        )}

                        {/* Rating */}
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">Rating</label>
                            <div className="flex items-center gap-4">
                                <StarRating value={data.rating} onChange={(val) => setData('rating', val)} />
                                {data.rating > 0 && (
                                    <span className="text-sm font-bold text-amber-500">
                                        {['', 'Sangat Buruk', 'Buruk', 'Cukup', 'Baik', 'Sangat Baik'][data.rating]}
                                    </span>
                                )}
                            </div>
                            {errors.rating && <p className="text-xs text-red-500 mt-1">{errors.rating}</p>}
                        </div>

                        {/* Komentar */}
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">Komentar</label>
                            <textarea
                                value={data.komentar}
                                onChange={(e) => setData('komentar', e.target.value)}
                                placeholder="Tuliskan ulasan Anda tentang kondisi kebersihan lokasi ini..."
                                rows={4}
                                className="w-full rounded-xl border-slate-200 bg-slate-50 text-sm text-slate-700 placeholder-slate-400 focus:border-emerald-400 focus:ring-emerald-400 resize-none transition-colors"
                            />
                            {errors.komentar && <p className="text-xs text-red-500 mt-1">{errors.komentar}</p>}
                        </div>

                        {/* Foto Upload */}
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">
                                Foto <span className="text-red-500">*</span>
                            </label>

                            {fotoPreview ? (
                                <div className="relative rounded-xl overflow-hidden border border-slate-200 group">
                                    <img
                                        src={fotoPreview}
                                        alt="Preview"
                                        className="w-full h-48 object-cover"
                                    />
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                        <button
                                            type="button"
                                            onClick={removeFoto}
                                            className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white text-sm font-bold rounded-xl hover:bg-red-600 transition-colors"
                                        >
                                            <Icons.X />
                                            <span>Hapus Foto</span>
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <label className="flex flex-col items-center justify-center h-36 border-2 border-dashed border-slate-200 rounded-xl cursor-pointer hover:border-emerald-400 hover:bg-emerald-50/30 transition-all duration-200 group">
                                    <div className="flex flex-col items-center gap-2 text-slate-400 group-hover:text-emerald-500 transition-colors">
                                        <Icons.Camera />
                                        <span className="text-sm font-medium">Klik untuk upload foto</span>
                                        <span className="text-xs text-slate-300">JPG, JPEG, PNG, WebP</span>
                                    </div>
                                    <input
                                        type="file"
                                        accept="image/jpg,image/jpeg,image/png,image/webp"
                                        onChange={handleFotoChange}
                                        className="hidden"
                                    />
                                </label>
                            )}
                            {errors.foto && <p className="text-xs text-red-500 mt-1">{errors.foto}</p>}
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-3">
                        <button
                            type="button"
                            onClick={closeReviewModal}
                            className="px-5 py-2.5 text-sm font-bold text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors"
                        >
                            Batal
                        </button>
                        <button
                            type="submit"
                            disabled={processing || data.rating === 0 || !data.foto}
                            className="flex items-center gap-2 px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-bold rounded-xl shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/></svg>
                            <span>Kirim Ulasan</span>
                        </button>
                    </div>
                </form>
            </Modal>
        </>
    );
}