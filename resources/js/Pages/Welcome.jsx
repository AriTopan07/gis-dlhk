import { Head, Link } from '@inertiajs/react';
import React, { useState } from 'react';
import Sidebar from '@/Components/Sidebar';
import MapComponent from '@/Components/MapComponent';

export default function Welcome({ auth }) {
    const [selectedKecamatan, setSelectedKecamatan] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

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
                            onReset={handleReset}
                        />
                    </main>
                </div>
            </div>
        </>
    );
}