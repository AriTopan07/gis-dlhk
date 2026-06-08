import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, usePage, router } from '@inertiajs/react';
import { useState, useRef } from 'react';
import {
    IconUpload,
    IconDownload,
    IconFileSpreadsheet,
    IconX,
    IconCheck,
    IconAlertTriangle,
    IconInfoCircle,
    IconUsers,
    IconUserCheck,
    IconUserShield,
    IconAlertCircle,
    IconDeviceFloppy,
    IconArrowLeft
} from '@tabler/icons-react';

export default function Index() {
    const { flash } = usePage().props;
    const importSummary = flash?.importSummary ?? null;
    const previewData = flash?.previewData ?? null;
    const filePath = flash?.filePath ?? null;

    const [dragOver, setDragOver] = useState(false);
    const fileInputRef = useRef(null);

    const { data, setData, post, processing, errors, progress } = useForm({
        file: null,
    });

    const handleFile = (file) => {
        if (!file) return;
        const allowed = ['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'application/vnd.ms-excel'];
        if (!allowed.includes(file.type) && !file.name.match(/\.(xlsx|xls)$/i)) {
            alert('File harus berformat Excel (.xlsx atau .xls)');
            return;
        }
        setData('file', file);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setDragOver(false);
        const file = e.dataTransfer.files[0];
        handleFile(file);
    };

    const handlePreview = (e) => {
        e.preventDefault();
        post(route('import.preview'), {
            forceFormData: true,
        });
    };

    const handleProcess = () => {
        router.post(route('import.process'), { file_path: filePath }, {
            onSuccess: () => removeFile()
        });
    };

    const handleCancel = () => {
        router.post(route('import.cancel'), { file_path: filePath }, {
            onSuccess: () => removeFile()
        });
    };

    const removeFile = () => {
        setData('file', null);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const formatBytes = (bytes) => {
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
    };

    const statCards = importSummary ? [
        { label: 'Kordinator', value: importSummary.kordinators, icon: IconUserShield, color: 'emerald' },
        { label: 'Pengawas',   value: importSummary.pengawas,    icon: IconUserCheck,  color: 'blue'    },
        { label: 'Petugas',    value: importSummary.petugas,     icon: IconUsers,      color: 'indigo'  },
        { label: 'Dilewati',   value: importSummary.skipped,     icon: IconAlertCircle, color: 'amber'  },
    ] : [];

    return (
        <AuthenticatedLayout
            header={
                <div className="flex justify-between items-center">
                    <div>
                        <h2 className="text-xl font-bold leading-tight text-black">
                            Import Data Hierarki
                        </h2>
                        <p className="text-sm text-slate-500 mt-0.5">
                            Upload file Excel untuk import data Kordinator, Pengawas, dan Petugas sekaligus
                        </p>
                    </div>
                    <a
                        href={route('import.template')}
                        className="inline-flex items-center gap-2 justify-center rounded-2xl border-2 border-[#047857] bg-white px-5 py-3 text-xs font-black uppercase tracking-[0.2em] text-[#047857] transition-all duration-300 hover:bg-[#f0fdf4] hover:shadow-md"
                    >
                        <IconDownload size={16} stroke={2.5} />
                        Download Template
                    </a>
                </div>
            }
        >
            <Head title="Import Data" />

            <div className="py-10">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8 space-y-6">

                    {/* PREVIEW MODE */}
                    {previewData && (
                        <div className="bg-white border border-slate-100 rounded-3xl shadow-sm overflow-hidden flex flex-col">
                            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                                <div>
                                    <h3 className="text-lg font-bold text-slate-800">Preview Data Excel</h3>
                                    <p className="text-sm text-slate-500 mt-1">Periksa kembali data yang terbaca sebelum disimpan ke database. Total baris: <span className="font-bold text-slate-700">{previewData.length}</span></p>
                                </div>
                                <div className="flex gap-3">
                                    <button
                                        onClick={handleCancel}
                                        className="inline-flex items-center gap-2 justify-center rounded-xl bg-white border border-slate-200 px-5 py-2.5 text-sm font-bold text-slate-600 transition-all hover:bg-slate-50 hover:text-slate-800"
                                    >
                                        <IconArrowLeft size={16} stroke={2} />
                                        Batal & Ganti File
                                    </button>
                                    <button
                                        onClick={handleProcess}
                                        className="inline-flex items-center gap-2 justify-center rounded-xl border border-transparent bg-[#047857] px-6 py-2.5 text-sm font-bold text-white transition-all shadow-sm hover:bg-[#065f46]"
                                    >
                                        <IconDeviceFloppy size={18} stroke={2} />
                                        Konfirmasi & Simpan
                                    </button>
                                </div>
                            </div>
                            
                            <div className="overflow-x-auto p-0">
                                <table className="min-w-full divide-y divide-slate-200 text-sm">
                                    <thead className="bg-white">
                                        <tr>
                                            <th className="px-4 py-3 text-center text-xs font-bold text-slate-500 uppercase tracking-wider">Baris</th>
                                            <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Kordinator</th>
                                            <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">NIP Kord</th>
                                            <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Pengawas</th>
                                            <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">NIP Pengawas</th>
                                            <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Petugas</th>
                                            <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">NIK Petugas</th>
                                            <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">NIP Petugas</th>
                                            <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-slate-100">
                                        {previewData.map((row, idx) => (
                                            <tr key={idx} className={row.is_error ? 'bg-red-50/50' : 'hover:bg-slate-50'}>
                                                <td className="px-4 py-3 text-center text-slate-500 font-medium">{row.row}</td>
                                                <td className="px-4 py-3 text-slate-800">{row.kordinator || <span className="text-slate-300 italic">-</span>}</td>
                                                <td className="px-4 py-3 text-slate-600">{row.nip_kord || <span className="text-slate-300 italic">-</span>}</td>
                                                <td className="px-4 py-3 text-slate-800">{row.pengawas || <span className="text-slate-300 italic">-</span>}</td>
                                                <td className="px-4 py-3 text-slate-600">{row.nip_pengawas || <span className="text-slate-300 italic">-</span>}</td>
                                                <td className="px-4 py-3 text-slate-800">{row.petugas || <span className="text-slate-300 italic">-</span>}</td>
                                                <td className="px-4 py-3 text-slate-600">{row.nik_petugas || <span className="text-slate-300 italic">-</span>}</td>
                                                <td className="px-4 py-3 text-slate-600">{row.nip_petugas || <span className="text-slate-300 italic">-</span>}</td>
                                                <td className="px-4 py-3">
                                                    {row.is_error ? (
                                                        <span className="inline-flex items-center gap-1 text-xs font-bold text-red-600 bg-red-100 px-2 py-1 rounded-md">
                                                            <IconAlertTriangle size={12} /> {row.status}
                                                        </span>
                                                    ) : row.status !== 'Valid' ? (
                                                        <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-600 bg-amber-100 px-2 py-1 rounded-md">
                                                            <IconInfoCircle size={12} /> {row.status}
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 bg-emerald-100 px-2 py-1 rounded-md">
                                                            <IconCheck size={12} /> {row.status}
                                                        </span>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                        {previewData.length === 0 && (
                                            <tr>
                                                <td colSpan="9" className="px-4 py-8 text-center text-slate-500">
                                                    Tidak ada data yang terbaca (mulai dari baris ke-5).
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* UPLOAD MODE (Disembunyikan saat preview) */}
                    {!previewData && (
                        <div className="max-w-4xl mx-auto space-y-6">
                            <div className="bg-blue-50 border border-blue-200 rounded-2xl p-5 flex gap-4">
                                <IconInfoCircle size={22} className="text-blue-500 shrink-0 mt-0.5" stroke={2} />
                                <div className="text-sm text-blue-800 space-y-1">
                                    <p className="font-bold">Cara penggunaan:</p>
                                    <ol className="list-decimal list-inside space-y-0.5 text-blue-700">
                                        <li>Download template Excel menggunakan tombol di kanan atas</li>
                                        <li>Isi data mengikuti contoh. Satu baris = satu Petugas.</li>
                                        <li>Kolom Kordinator/Pengawas boleh dikosongkan jika masih sama dengan baris atasnya</li>
                                        <li>Upload file untuk melihat preview, lalu konfirmasi penyimpanan.</li>
                                    </ol>
                                </div>
                            </div>

                            <form onSubmit={handlePreview}>
                                <div className="bg-white border border-slate-100 rounded-3xl p-8 shadow-sm space-y-6">
                                    <h3 className="text-base font-bold text-slate-800">Upload File Excel</h3>

                                    <div
                                        className={`relative border-2 border-dashed rounded-2xl transition-all duration-200 cursor-pointer
                                            ${dragOver
                                                ? 'border-emerald-500 bg-emerald-50'
                                                : data.file
                                                ? 'border-emerald-400 bg-emerald-50/50'
                                                : 'border-slate-300 bg-slate-50 hover:border-emerald-400 hover:bg-emerald-50/30'
                                            }`}
                                        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                                        onDragLeave={() => setDragOver(false)}
                                        onDrop={handleDrop}
                                        onClick={() => !data.file && fileInputRef.current?.click()}
                                    >
                                        <input
                                            ref={fileInputRef}
                                            type="file"
                                            accept=".xlsx,.xls"
                                            className="hidden"
                                            onChange={(e) => handleFile(e.target.files[0])}
                                        />

                                        <div className="p-10 flex flex-col items-center gap-4 text-center">
                                            {data.file ? (
                                                <>
                                                    <div className="w-16 h-16 rounded-2xl bg-emerald-100 flex items-center justify-center">
                                                        <IconFileSpreadsheet size={32} className="text-emerald-600" stroke={1.5} />
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-slate-800">{data.file.name}</p>
                                                        <p className="text-sm text-slate-500">{formatBytes(data.file.size)}</p>
                                                    </div>
                                                    <button
                                                        type="button"
                                                        onClick={(e) => { e.stopPropagation(); removeFile(); }}
                                                        className="inline-flex items-center gap-1.5 text-sm text-red-500 hover:text-red-700 font-medium"
                                                    >
                                                        <IconX size={14} stroke={2.5} />
                                                        Hapus file
                                                    </button>
                                                </>
                                            ) : (
                                                <>
                                                    <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center">
                                                        <IconUpload size={28} className="text-slate-400" stroke={1.5} />
                                                    </div>
                                                    <div>
                                                        <p className="font-semibold text-slate-700">
                                                            Drag & drop file di sini, atau{' '}
                                                            <span className="text-emerald-600 underline underline-offset-2">klik untuk pilih file</span>
                                                        </p>
                                                        <p className="text-sm text-slate-400 mt-1">Format: .xlsx atau .xls — Maks. 10MB</p>
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                    </div>

                                    {progress && (
                                        <div className="space-y-1">
                                            <div className="flex justify-between text-xs text-slate-500">
                                                <span>Mengupload...</span>
                                                <span>{progress.percentage}%</span>
                                            </div>
                                            <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-emerald-500 rounded-full transition-all duration-300"
                                                    style={{ width: `${progress.percentage}%` }}
                                                />
                                            </div>
                                        </div>
                                    )}

                                    {errors.file && (
                                        <div className="flex items-center gap-2 text-red-600 text-sm bg-red-50 border border-red-200 rounded-xl px-4 py-3">
                                            <IconAlertTriangle size={16} stroke={2} />
                                            {errors.file}
                                        </div>
                                    )}

                                    <div className="flex justify-end">
                                        <button
                                            type="submit"
                                            disabled={!data.file || processing}
                                            className="inline-flex items-center gap-2 justify-center rounded-2xl border border-transparent bg-[#047857] px-8 py-4 text-sm font-black uppercase tracking-[0.2em] text-white transition-all duration-300 hover:bg-[#065f46] hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            {processing ? (
                                                <>
                                                    <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                                                    </svg>
                                                    Memproses...
                                                </>
                                            ) : (
                                                <>
                                                    <IconFileSpreadsheet size={16} stroke={2.5} />
                                                    Lihat Preview
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </div>
                            </form>
                        </div>
                    )}

                    {/* HASIL IMPORT SUMMARY */}
                    {importSummary && !previewData && (
                        <div className="max-w-4xl mx-auto bg-white border border-slate-100 rounded-3xl p-8 shadow-sm space-y-6">
                            <h3 className="text-base font-bold text-slate-800">Hasil Import</h3>

                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                {statCards.map((card) => (
                                    <div key={card.label} className={`rounded-2xl p-5 border
                                        ${card.color === 'emerald' ? 'bg-emerald-50 border-emerald-200' :
                                          card.color === 'blue'    ? 'bg-blue-50 border-blue-200' :
                                          card.color === 'indigo'  ? 'bg-indigo-50 border-indigo-200' :
                                                                     'bg-amber-50 border-amber-200'}`}
                                    >
                                        <card.icon
                                            size={24}
                                            stroke={1.5}
                                            className={
                                                card.color === 'emerald' ? 'text-emerald-600' :
                                                card.color === 'blue'    ? 'text-blue-600' :
                                                card.color === 'indigo'  ? 'text-indigo-600' :
                                                                           'text-amber-600'
                                            }
                                        />
                                        <p className="text-2xl font-black mt-2 text-slate-800">{card.value}</p>
                                        <p className="text-xs text-slate-500 font-medium mt-0.5">{card.label} berhasil</p>
                                    </div>
                                ))}
                            </div>

                            {importSummary.results?.length > 0 && (
                                <div className="space-y-2">
                                    <p className="text-sm font-bold text-slate-700">Log Detail:</p>
                                    <div className="max-h-64 overflow-y-auto rounded-xl border border-slate-200 divide-y divide-slate-100">
                                        {importSummary.results.map((r, i) => (
                                            <div key={i} className={`flex items-start gap-3 px-4 py-3 text-sm
                                                ${r.type === 'error'   ? 'bg-red-50 text-red-700' :
                                                  r.type === 'warning' ? 'bg-amber-50 text-amber-700' :
                                                                         'bg-green-50 text-green-700'}`}
                                            >
                                                {r.type === 'error'
                                                    ? <IconAlertCircle size={16} className="shrink-0 mt-0.5" stroke={2} />
                                                    : r.type === 'warning'
                                                    ? <IconAlertTriangle size={16} className="shrink-0 mt-0.5" stroke={2} />
                                                    : <IconCheck size={16} className="shrink-0 mt-0.5" stroke={2.5} />
                                                }
                                                {r.message}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {importSummary.results?.length === 0 && (
                                <div className="flex items-center gap-3 bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3 text-emerald-700 text-sm">
                                    <IconCheck size={18} stroke={2.5} />
                                    Semua data berhasil diimport tanpa error.
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
