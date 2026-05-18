import React from 'react';



const Sidebar = ({ kecamatanList, onKecamatanClick, searchTerm, setSearchTerm, activeKecamatan, isOpen, onClose }) => {
    return (
        <div className={`flex flex-col h-screen w-80 bg-white border-r border-gray-100 shadow-xl z-[1001] fixed left-0 top-0 overflow-hidden transition-transform duration-300 ease-in-out ${
            isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}>
            {/* Logo Section */}
            <div className="p-6 flex items-center justify-between border-b border-gray-50 bg-[#F8FAFC]">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 flex items-center justify-center">
                        <img src="/img/logo-sidoarjo.webp" alt="Sidoarjo Logo" className="w-full h-full object-contain" />
                    </div>
                    <div>
                        <h1 className="text-xs font-black text-[#0f172a] leading-tight uppercase tracking-tighter">Dinas Lingkungan Hidup dan Kebersihan</h1>
                        <p className="text-[10px] text-[#047857] font-bold tracking-widest uppercase mt-0.5">Kabupaten Sidoarjo</p>
                    </div>
                </div>
                {/* Close button for mobile */}
                <button 
                    onClick={onClose}
                    className="md:hidden p-2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>


            {/* Search Section */}
            <div className="px-6 mb-4">
                <div className="relative">
                    <input
                        type="text"
                        placeholder="Cari kecamatan..."
                        className="w-full bg-[#F8FAFC] border-none rounded-2xl py-3 pl-11 pr-4 text-sm focus:ring-2 focus:ring-[#10B981] transition-all"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <div className="absolute left-4 top-1/2 -translate-y-1/2">
                        <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </div>
                </div>
            </div>

            {/* Kecamatan List Header */}
            <div className="px-6 mb-2">
                <h4 className="text-[10px] text-[#047857] font-extrabold uppercase tracking-widest">Daftar Kecamatan</h4>
            </div>

            {/* Kecamatan List */}
            <div className="flex-1 overflow-y-auto px-4 pb-6 scrollbar-hide">
                {kecamatanList
                    .filter(k => k.toLowerCase().includes(searchTerm.toLowerCase()))
                    .map((kecamatan, index) => {
                    const isActive = activeKecamatan === kecamatan;
                    return (
                        <button
                            key={index}
                            onClick={() => onKecamatanClick(kecamatan)}
                            className={`w-full group flex items-center justify-between p-4 mb-2 rounded-2xl transition-all border ${
                                isActive 
                                ? 'bg-green-50 border-green-100 shadow-sm' 
                                : 'hover:bg-[#F8FAFC] border-transparent hover:border-gray-100'
                            }`}
                        >
                            <div className="flex flex-col items-start">
                                <span className={`font-bold transition-colors ${
                                    isActive ? 'text-[#047857]' : 'text-[#0f172a] group-hover:text-[#047857]'
                                }`}>
                                    {kecamatan}
                                </span>
                                <span className="text-[10px] text-gray-400 font-medium">Sidoarjo, Jawa Timur</span>
                            </div>
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all border shadow-sm ${
                                isActive 
                                ? 'bg-[#10B981] border-[#10B981] opacity-100' 
                                : 'bg-white border-gray-100 opacity-0 group-hover:opacity-100'
                            }`}>
                                <svg className={`w-4 h-4 ${isActive ? 'text-white' : 'text-[#047857]'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={isActive ? 3 : 2} d={isActive ? "M5 13l4 4L19 7" : "M9 5l7 7-7 7"} />
                                </svg>
                            </div>
                        </button>
                    );
                })}
            </div>

            {/* Footer / Auth Context */}
            <div className="p-6 border-t border-gray-50 bg-[#F8FAFC]/50 text-center">
                <p className="text-[10px] text-gray-400 font-medium tracking-widest uppercase">GIS Portal &copy; 2026</p>
            </div>
        </div>
    );
};

export default Sidebar;
