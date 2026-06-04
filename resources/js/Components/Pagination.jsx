import { Link } from '@inertiajs/react';

export default function Pagination({ links }) {
    if (!links || links.length <= 3) return null;

    return (
        <div className="flex flex-wrap justify-center gap-1">
            {links.map((link, key) => (
                link.url === null ? (
                    <div
                        key={key}
                        className="px-4 py-2 text-sm font-medium text-slate-400 border border-slate-200 rounded-xl cursor-not-allowed bg-slate-50 opacity-60"
                        dangerouslySetInnerHTML={{ __html: link.label }}
                    />
                ) : (
                    <Link
                        key={key}
                        className={`px-4 py-2 text-sm font-bold border rounded-xl transition-all duration-300 shadow-sm ${
                            link.active 
                                ? 'bg-[#10B981] text-white border-[#10B981] shadow-emerald-500/20 shadow-md' 
                                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50 hover:border-[#10B981] hover:text-[#10B981] focus:ring-2 focus:ring-[#10B981]/50'
                        }`}
                        href={link.url}
                        dangerouslySetInnerHTML={{ __html: link.label }}
                    />
                )
            ))}
        </div>
    );
}
