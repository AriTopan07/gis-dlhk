import ApplicationLogo from '@/Components/ApplicationLogo';
import { Link } from '@inertiajs/react';

export default function GuestLayout({ children }) {
    return (
        <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC] font-sans">
            <div className="w-full max-w-md px-6 py-12 relative z-10">
                {/* Branding Section */}
                <div className="flex flex-col items-center mb-8">
                    <Link href="/" className="group transition-all hover:opacity-80 duration-300">
                        <img 
                            src="/img/logo-sidoarjo.webp" 
                            alt="Sidoarjo Logo" 
                            className="w-20 h-20 object-contain drop-shadow-sm" 
                        />
                    </Link>
                    <div className="mt-6 text-center">
                        <h1 className="text-xl font-black text-slate-900 uppercase tracking-tighter leading-tight text-center">Dinas Lingkungan Hidup dan Kebersihan</h1>
                        <p className="text-[10px] font-bold text-[#047857] uppercase tracking-[0.4em] mt-1.5 font-sans">Kabupaten Sidoarjo</p>
                    </div>
                </div>

                {/* Content Card container - Clean & Simple */}
                <div className="bg-white rounded-[2rem] p-10 border border-slate-100">
                    {children}
                </div>

                {/* Footer text */}
                <div className="mt-12 text-center">
                    <p className="text-slate-400 text-[9px] font-bold uppercase tracking-[0.3em] font-sans">
                        Portal GIS &copy; 2026 • DLHK Sidoarjo
                    </p>
                </div>
            </div>
        </div>
    );
}
