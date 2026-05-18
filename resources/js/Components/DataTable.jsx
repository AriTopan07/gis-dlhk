import { Link, router } from '@inertiajs/react';
import { IconEdit, IconTrash, IconSearch } from '@tabler/icons-react';
import { useState, useEffect, useRef } from 'react';
import TextInput from '@/Components/TextInput';
import Modal from '@/Components/Modal';
import SecondaryButton from '@/Components/SecondaryButton';
import PrimaryButton from '@/Components/PrimaryButton';
import { IconAlertTriangle } from '@tabler/icons-react';

export default function DataTable({ data, filters, routeEdit, routeDestroy, columns, onEdit, filterSlot }) {
    const [search, setSearch] = useState(filters?.search || '');
    const isFirstRender = useRef(true);

    useEffect(() => {
        if (isFirstRender.current) {
            isFirstRender.current = false;
            return;
        }

        const delayDebounceFn = setTimeout(() => {
            const currentParams = new URLSearchParams(window.location.search);
            if (search) {
                currentParams.set('search', search);
            } else {
                currentParams.delete('search');
            }
            
            router.get(
                window.location.pathname,
                Object.fromEntries(currentParams.entries()),
                { preserveState: true, replace: true }
            );
        }, 300);

        return () => clearTimeout(delayDebounceFn);
    }, [search]);

    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [itemToDelete, setItemToDelete] = useState(null);

    const handleDelete = (item) => {
        setItemToDelete(item);
        setIsDeleteModalOpen(true);
    };

    const confirmDelete = () => {
        if (!itemToDelete) return;
        router.delete(route(routeDestroy, itemToDelete.id), {
            preserveScroll: true,
            onSuccess: () => {
                setIsDeleteModalOpen(false);
                setItemToDelete(null);
            },
        });
    };

    const closeDeleteModal = () => {
        setIsDeleteModalOpen(false);
        setItemToDelete(null);
    };

    return (
        <div className="bg-white p-10 border border-slate-100 rounded-[2rem]">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold text-slate-800">Daftar Data</h3>
                <div className="flex gap-3">
                    {filterSlot}
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-400">
                            <IconSearch size={18} />
                        </div>
                        <TextInput
                            type="text"
                            className="pl-10 block w-full sm:w-64"
                            placeholder="Cari..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            <div className="text-slate-900 overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200">
                    <thead className="bg-slate-50">
                        <tr>
                            <th className="px-6 py-3 text-center text-xs font-medium text-slate-500 uppercase tracking-wider w-16">No.</th>
                            {columns.map((col, index) => (
                                <th key={index} className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                                    {col.label}
                                </th>
                            ))}
                            <th className="px-6 py-3 text-center text-xs font-medium text-slate-500 uppercase tracking-wider w-32">Aksi</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-slate-200">
                        {data.data.map((item, index) => (
                            <tr key={item.id}>
                                <td className="px-6 py-4 text-center text-sm text-slate-500">
                                    {data.from + index}
                                </td>
                                {columns.map((col, idx) => (
                                    <td key={idx} className="px-6 py-4 text-sm text-slate-900">
                                        {col.render ? col.render(item[col.key], item) : item[col.key]}
                                    </td>
                                ))}
                                <td className="px-6 py-4 text-sm font-medium flex justify-center gap-2">
                                    {(routeEdit || onEdit) && (
                                        onEdit ? (
                                            <button
                                                type="button"
                                                onClick={() => onEdit(item)}
                                                className="inline-flex items-center justify-center rounded-xl border border-transparent bg-indigo-50 px-3 py-2 text-indigo-600 transition-all duration-300 hover:bg-indigo-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                                                title="Edit"
                                            >
                                                <IconEdit size={18} stroke={2} />
                                            </button>
                                        ) : (
                                            <Link
                                                href={route(routeEdit, item.id)}
                                                className="inline-flex items-center justify-center rounded-xl border border-transparent bg-indigo-50 px-3 py-2 text-indigo-600 transition-all duration-300 hover:bg-indigo-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                                                title="Edit"
                                            >
                                                <IconEdit size={18} stroke={2} />
                                            </Link>
                                        )
                                    )}
                                    {routeDestroy && (
                                        <button
                                            type="button"
                                            onClick={() => handleDelete(item)}
                                            className="inline-flex items-center justify-center rounded-xl border border-transparent bg-red-50 px-3 py-2 text-red-600 transition-all duration-300 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                                            title="Hapus"
                                        >
                                            <IconTrash size={18} stroke={2} />
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                        {data.data.length === 0 && (
                            <tr>
                                <td colSpan={columns.length + 2} className="px-6 py-8 text-center text-sm text-slate-500">
                                    Tidak ada data ditemukan.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            {data.links && data.links.length > 3 && (
                <div className="mt-6 flex justify-between items-center border-t border-slate-100 pt-4">
                    <div className="text-sm text-slate-500">
                        Menampilkan {data.from || 0} sampai {data.to || 0} dari {data.total} hasil
                    </div>
                    <div className="flex gap-1">
                        {data.links.map((link, index) => (
                            <Link
                                key={index}
                                href={link.url || '#'}
                                className={`px-4 py-2 text-sm rounded-lg border ${
                                    link.active 
                                        ? 'bg-indigo-50 border-indigo-200 text-indigo-700 font-bold' 
                                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                                } ${!link.url ? 'opacity-50 cursor-not-allowed' : ''}`}
                                dangerouslySetInnerHTML={{ __html: link.label }}
                            />
                        ))}
                    </div>
                </div>
            )}
            {/* Delete Confirmation Modal */}
            <Modal show={isDeleteModalOpen} onClose={closeDeleteModal} maxWidth="sm">
                <div className="p-6">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="shrink-0 w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                            <IconAlertTriangle className="text-red-600" size={24} stroke={2} />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-slate-900">Konfirmasi Hapus</h2>
                            <p className="text-sm text-slate-500 mt-1">
                                Yakin ingin menghapus <span className="font-bold text-slate-700">"{itemToDelete?.nama || itemToDelete?.name || 'data ini'}"</span>? Tindakan ini tidak bisa dibatalkan.
                            </p>
                        </div>
                    </div>
                    
                    <div className="flex items-center justify-end gap-3 mt-6">
                        <SecondaryButton onClick={closeDeleteModal}>
                            Batal
                        </SecondaryButton>
                        <button
                            onClick={confirmDelete}
                            className="inline-flex items-center justify-center rounded-xl border border-transparent bg-red-600 px-4 py-2 text-sm font-bold text-white transition-all duration-300 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                        >
                            Ya, Hapus Data
                        </button>
                    </div>
                </div>
            </Modal>
        </div>
    );
}
