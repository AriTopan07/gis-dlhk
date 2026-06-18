import { Link, router } from '@inertiajs/react';
import { IconEdit, IconTrash, IconSearch, IconChevronUp, IconChevronDown, IconSelector } from '@tabler/icons-react';
import { useState, useEffect, useRef, useCallback } from 'react';
import TextInput from '@/Components/TextInput';
import Modal from '@/Components/Modal';
import SecondaryButton from '@/Components/SecondaryButton';
import { IconAlertTriangle } from '@tabler/icons-react';

export default function ServerSideDataTable({ 
    ajaxUrl, 
    columns, 
    routeEdit, 
    routeDestroy, 
    onEdit, 
    filterSlot,
    queryParams = {},
    customActions
}) {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(0);
    const [perPage, setPerPage] = useState(10);
    const [totalRecords, setTotalRecords] = useState(0);
    const [totalFiltered, setTotalFiltered] = useState(0);
    const [sortColumn, setSortColumn] = useState(0);
    const [sortDir, setSortDir] = useState('asc');
    const [draw, setDraw] = useState(1);
    const isFirstRender = useRef(true);

    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [itemToDelete, setItemToDelete] = useState(null);

    const fetchData = useCallback(() => {
        setLoading(true);

        const params = new URLSearchParams();
        params.append('draw', draw);
        params.append('start', page * perPage);
        params.append('length', perPage);
        params.append('search[value]', search);
        params.append('search[regex]', 'false');
        params.append(`order[0][column]`, sortColumn);
        params.append(`order[0][dir]`, sortDir);

        Object.keys(queryParams).forEach(key => {
            if (queryParams[key] !== null && queryParams[key] !== undefined) {
                params.append(key, queryParams[key]);
            }
        });

        columns.forEach((col, i) => {
            params.append(`columns[${i}][data]`, col.data || '');
            params.append(`columns[${i}][name]`, col.name || '');
            params.append(`columns[${i}][searchable]`, col.searchable !== false ? 'true' : 'false');
            params.append(`columns[${i}][orderable]`, col.orderable !== false ? 'true' : 'false');
        });

        fetch(`${ajaxUrl}?${params.toString()}`, {
            headers: {
                'X-Requested-With': 'XMLHttpRequest',
                'Accept': 'application/json',
            },
        })
        .then(res => res.json())
        .then(json => {
            setData(json.data || []);
            setTotalRecords(json.recordsTotal || 0);
            setTotalFiltered(json.recordsFiltered || 0);
            setLoading(false);
            setDraw(prev => prev + 1);
        })
        .catch(err => {
            console.error('DataTable fetch error:', err);
            setLoading(false);
        });
    }, [ajaxUrl, page, perPage, search, sortColumn, sortDir, columns, JSON.stringify(queryParams)]);

    // Debounced search
    useEffect(() => {
        if (isFirstRender.current) {
            isFirstRender.current = false;
            fetchData();
            return;
        }

        const timer = setTimeout(() => {
            setPage(0);
            fetchData();
        }, 400);

        return () => clearTimeout(timer);
    }, [search]);

    // Fetch on page/perPage/sort/queryParams change
    useEffect(() => {
        if (!isFirstRender.current) {
            fetchData();
        }
    }, [page, perPage, sortColumn, sortDir, JSON.stringify(queryParams)]);

    const totalPages = Math.ceil(totalFiltered / perPage);
    const from = totalFiltered > 0 ? page * perPage + 1 : 0;
    const to = Math.min((page + 1) * perPage, totalFiltered);

    const handleSort = (colIndex) => {
        if (columns[colIndex].orderable === false) return;
        if (sortColumn === colIndex) {
            setSortDir(prev => prev === 'asc' ? 'desc' : 'asc');
        } else {
            setSortColumn(colIndex);
            setSortDir('asc');
        }
    };

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
                fetchData();
            },
        });
    };

    const closeDeleteModal = () => {
        setIsDeleteModalOpen(false);
        setItemToDelete(null);
    };

    // Generate pagination links
    const getPaginationLinks = () => {
        const links = [];
        const maxVisible = 5;
        let startPage = Math.max(0, page - Math.floor(maxVisible / 2));
        let endPage = Math.min(totalPages - 1, startPage + maxVisible - 1);
        
        if (endPage - startPage < maxVisible - 1) {
            startPage = Math.max(0, endPage - maxVisible + 1);
        }

        // Previous
        links.push({
            label: '&laquo;',
            url: page > 0 ? true : null,
            active: false,
            page: page - 1,
        });

        for (let i = startPage; i <= endPage; i++) {
            links.push({
                label: String(i + 1),
                url: true,
                active: i === page,
                page: i,
            });
        }

        // Next
        links.push({
            label: '&raquo;',
            url: page < totalPages - 1 ? true : null,
            active: false,
            page: page + 1,
        });

        return links;
    };

    const renderCellContent = (col, item, colIndex) => {
        const value = col.data ? item[col.data] : '';
        if (col.render) {
            const rendered = col.render(value, 'display', item);
            if (typeof rendered === 'string') {
                return <span dangerouslySetInnerHTML={{ __html: rendered }} />;
            }
            return rendered;
        }
        return value;
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
                                <th 
                                    key={index} 
                                    className={`px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider ${col.orderable !== false ? 'cursor-pointer select-none hover:text-slate-700' : ''}`}
                                    onClick={() => handleSort(index)}
                                >
                                    <div className="flex items-center gap-1">
                                        {col.label}
                                        {col.orderable !== false && (
                                            <span className="inline-flex flex-col">
                                                {sortColumn === index ? (
                                                    sortDir === 'asc' ? 
                                                        <IconChevronUp size={14} stroke={2.5} className="text-indigo-600" /> : 
                                                        <IconChevronDown size={14} stroke={2.5} className="text-indigo-600" />
                                                ) : (
                                                    <IconSelector size={14} stroke={1.5} className="text-slate-300" />
                                                )}
                                            </span>
                                        )}
                                    </div>
                                </th>
                            ))}
                            {(routeEdit || onEdit || routeDestroy || customActions) && (
                                <th className="px-6 py-3 text-center text-xs font-medium text-slate-500 uppercase tracking-wider w-32">Aksi</th>
                            )}
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-slate-200">
                        {loading ? (
                            <tr>
                                <td colSpan={columns.length + 2} className="px-6 py-12 text-center">
                                    <div className="flex flex-col items-center gap-2">
                                        <div className="w-6 h-6 border-2 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
                                        <span className="text-sm text-slate-500">Memuat data...</span>
                                    </div>
                                </td>
                            </tr>
                        ) : data.length === 0 ? (
                            <tr>
                                <td colSpan={columns.length + 2} className="px-6 py-8 text-center text-sm text-slate-500">
                                    Tidak ada data ditemukan.
                                </td>
                            </tr>
                        ) : (
                            data.map((item, index) => (
                                <tr key={item.id || index} className="hover:bg-slate-50 transition-colors">
                                    <td className="px-6 py-4 text-center text-sm text-slate-500">
                                        {from + index}
                                    </td>
                                    {columns.map((col, idx) => (
                                        <td key={idx} className="px-6 py-4 text-sm text-slate-900">
                                            {renderCellContent(col, item, idx)}
                                        </td>
                                    ))}
                                    {(routeEdit || onEdit || routeDestroy || customActions) && (
                                        <td className="px-6 py-4 text-sm font-medium">
                                            <div className="flex justify-center gap-2">
                                                {customActions ? (
                                                    customActions(item)
                                                ) : (
                                                    <>
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
                                                    </>
                                                )}
                                            </div>
                                        </td>
                                    )}
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            {totalPages > 0 && (
                <div className="mt-6 flex justify-between items-center border-t border-slate-100 pt-4">
                    <div className="text-sm text-slate-500">
                        Menampilkan {from} sampai {to} dari {totalFiltered} hasil
                        {totalFiltered !== totalRecords && ` (disaring dari ${totalRecords} total)`}
                    </div>
                    <div className="flex gap-1">
                        {getPaginationLinks().map((link, index) => (
                            <button
                                key={index}
                                onClick={() => link.url && setPage(link.page)}
                                disabled={!link.url}
                                className={`px-4 py-2 text-sm rounded-lg border ${
                                    link.active 
                                        ? 'bg-indigo-50 border-indigo-200 text-indigo-700 font-bold' 
                                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                                } ${!link.url ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
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
                                Yakin ingin menghapus <span className="font-bold text-slate-700">"{itemToDelete?.lokasi || itemToDelete?.nama || itemToDelete?.name || 'data ini'}"</span>? Tindakan ini tidak bisa dibatalkan.
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
