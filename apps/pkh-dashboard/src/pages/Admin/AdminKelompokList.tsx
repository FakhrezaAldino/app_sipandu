import { useState, useEffect, useCallback } from 'react';
import { adminApi } from '../../services/adminApi';
import { exportToCSV } from '../../lib/exportUtils';
import { Link } from 'react-router-dom';
import type { KelompokDTO, UserDTO } from '../../types/api';

const AdminKelompokList = () => {
    const [kelompoks, setKelompoks] = useState<KelompokDTO[]>([]);
    const [pendampings, setPendampings] = useState<UserDTO[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedPendamping, setSelectedPendamping] = useState('');
    const [pagination, setPagination] = useState({
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 0
    });

    const fetchData = useCallback(async (page: number, q: string, pendampingId: string) => {
        setIsLoading(true);
        try {
            const response = await adminApi.listKelompok({ page, limit: pagination.limit, q, pendampingId });
            setKelompoks(response.data);
            setPagination(prev => ({
                ...prev,
                page: response.meta.page,
                total: response.meta.total,
                totalPages: response.meta.totalPages
            }));
        } catch (error) {
            console.error('Failed to fetch kelompok:', error);
        } finally {
            setIsLoading(false);
        }
    }, [pagination.limit]);

    useEffect(() => {
        const fetchPendampings = async () => {
            try {
                const response = await adminApi.listPendamping();
                setPendampings(response.data);
            } catch (error) {
                console.error('Failed to fetch pendampings:', error);
            }
        };
        fetchPendampings();
    }, []);

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            fetchData(1, searchTerm, selectedPendamping);
        }, 500);
        return () => clearTimeout(timeoutId);
    }, [searchTerm, selectedPendamping, fetchData]);

    const handlePageChange = (newPage: number) => {
        if (newPage >= 1 && newPage <= pagination.totalPages) {
            fetchData(newPage, searchTerm, selectedPendamping);
        }
    };

    return (
        <div className="layout-container flex grow flex-col">
            <div className="flex flex-1 justify-center py-6 px-4 sm:px-6 lg:px-8">
                <div className="layout-content-container flex flex-col w-full max-w-[1024px] flex-1 gap-6">
                    {/* Breadcrumbs */}
                    <div className="flex flex-wrap gap-2 text-sm">
                        <Link className="text-slate-500 hover:text-primary transition-colors font-medium dark:text-slate-400" to="/admin/dashboard">Admin</Link>
                        <span className="text-slate-400 dark:text-slate-500">/</span>
                        <span className="text-slate-900 font-semibold dark:text-white">Semua Kelompok</span>
                    </div>

                    {/* Page Heading */}
                    <div className="flex flex-col gap-1">
                        <div className="flex justify-between items-center">
                            <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-4xl">Daftar Kelompok</h1>
                            <button
                                onClick={() => {
                                    const exportData = kelompoks.map(k => ({
                                        'Nama Kelompok': k.namaKelompok,
                                        'Pendamping': k.pendamping?.name || 'Unassigned',
                                        'Email Pendamping': k.pendamping?.email || '-',
                                        'Jumlah KPM': k.kpmCount || 0,
                                        'Kecamatan': k.kecamatan,
                                        'Desa': k.desa,
                                        'Tanggal Terdaftar': new Date(k.createdAt).toLocaleDateString('id-ID', { dateStyle: 'long' })
                                    }));
                                    exportToCSV(exportData, 'Data_Kelompok_Global');
                                }}
                                className="h-10 px-4 flex items-center gap-2 rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:bg-slate-800 dark:border-slate-700 dark:text-white dark:hover:bg-slate-700 transition-all font-semibold text-sm cursor-pointer shadow-sm"
                            >
                                <span className="material-symbols-outlined text-[20px] text-green-600">file_download</span>
                                <span>Export CSV</span>
                            </button>
                        </div>
                        <p className="text-base font-normal text-slate-500 dark:text-slate-400">
                            Monitor semua kelompok binaan PKH dan pendamping yang bertugas.
                        </p>
                    </div>

                    {/* Filters */}
                    <div className="grid grid-cols-1 gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:grid-cols-2">
                        {/* Search */}
                        <label className="relative flex w-full items-center">
                            <span className="material-symbols-outlined absolute left-3 text-slate-400">search</span>
                            <input
                                className="h-10 w-full rounded-lg border-slate-200 bg-slate-50 pl-10 pr-4 text-sm text-slate-900 placeholder:text-slate-400 focus:border-primary focus:ring-primary dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:placeholder:text-slate-500"
                                placeholder="Cari nama kelompok..."
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </label>

                        {/* Pendamping Filter */}
                        <select
                            className="h-10 w-full rounded-lg border-slate-200 bg-slate-50 px-4 text-sm text-slate-900 focus:border-primary focus:ring-primary dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                            value={selectedPendamping}
                            onChange={(e) => setSelectedPendamping(e.target.value)}
                        >
                            <option value="">Semua Pendamping</option>
                            {pendampings.map(p => (
                                <option key={p.id} value={p.id}>{p.name}</option>
                            ))}
                        </select>
                    </div>

                    {/* Data Table */}
                    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm text-slate-600 dark:text-slate-400">
                                <thead className="border-b border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-800/50">
                                    <tr>
                                        <th className="px-6 py-4 font-semibold text-slate-900 dark:text-white" scope="col">Nama Kelompok</th>
                                        <th className="px-6 py-4 font-semibold text-slate-900 dark:text-white" scope="col">Pendamping</th>
                                        <th className="px-6 py-4 font-semibold text-slate-900 dark:text-white" scope="col">Jumlah Anggota</th>
                                        <th className="px-6 py-4 font-semibold text-slate-900 dark:text-white" scope="col">Wilayah</th>
                                        <th className="px-6 py-4 font-semibold text-slate-900 dark:text-white" scope="col">Terdaftar Pada</th>
                                        <th className="px-6 py-4 text-right font-semibold text-slate-900 dark:text-white" scope="col">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                                    {isLoading ? (
                                        <tr>
                                            <td colSpan={4} className="px-6 py-10 text-center text-slate-500">
                                                <div className="flex justify-center">
                                                    <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
                                                </div>
                                            </td>
                                        </tr>
                                    ) : kelompoks.length === 0 ? (
                                        <tr>
                                            <td colSpan={4} className="px-6 py-10 text-center text-slate-500">
                                                Tidak ada kelompok yang ditemukan.
                                            </td>
                                        </tr>
                                    ) : (
                                        kelompoks.map((klp) => (
                                            <tr key={klp.id} className="group hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-100 text-primary dark:bg-blue-900/30 dark:text-blue-300">
                                                            <span className="material-symbols-outlined">diversity_3</span>
                                                        </div>
                                                        <div className="font-medium text-slate-900 dark:text-white">{klp.namaKelompok}</div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="text-slate-900 dark:text-white font-medium">{klp.pendamping?.name || 'Unassigned'}</div>
                                                    <div className="text-xs text-slate-500">{klp.pendamping?.email || '-'}</div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 px-2.5 py-0.5 text-xs font-medium dark:border-slate-700">
                                                        <span className="material-symbols-outlined text-[14px]">person</span>
                                                        {klp.kpmCount || 0} KPM
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="font-medium text-slate-900 dark:text-white">{klp.kecamatan}</div>
                                                    <div className="text-xs">{klp.desa}</div>
                                                </td>
                                                <td className="px-6 py-4 text-xs font-medium text-slate-600 dark:text-slate-400">
                                                    {new Date(klp.createdAt).toLocaleDateString('id-ID', { dateStyle: 'long' })}
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <Link
                                                        to={`/kelompok/${klp.id}`}
                                                        className="inline-flex items-center gap-1.5 rounded-lg border border-primary/20 bg-primary/5 px-3 py-1.5 text-xs font-bold text-primary hover:bg-primary hover:text-white transition-all shadow-sm"
                                                    >
                                                        <span className="material-symbols-outlined text-[16px]">visibility</span>
                                                        Detail
                                                    </Link>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                        {/* Pagination */}
                        {pagination.totalPages > 1 && (
                            <div className="flex items-center justify-between border-t border-slate-200 bg-white px-4 py-3 dark:border-slate-800 dark:bg-slate-900 sm:px-6">
                                <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                                    <div>
                                        <p className="text-sm text-slate-700 dark:text-slate-400">
                                            Menampilkan <span className="font-medium text-slate-900 dark:text-white">{(pagination.page - 1) * pagination.limit + 1}</span> sampai <span className="font-medium text-slate-900 dark:text-white">{Math.min(pagination.page * pagination.limit, pagination.total)}</span> dari <span className="font-medium text-slate-900 dark:text-white">{pagination.total}</span> hasil
                                        </p>
                                    </div>
                                    <div>
                                        <nav aria-label="Pagination" className="isolate inline-flex -space-x-px rounded-md shadow-sm">
                                            <button
                                                onClick={() => handlePageChange(pagination.page - 1)}
                                                disabled={pagination.page === 1}
                                                className="relative inline-flex items-center rounded-l-md px-2 py-2 text-slate-400 ring-1 ring-inset ring-slate-300 hover:bg-slate-50 focus:z-20 focus:outline-offset-0 dark:ring-slate-700 dark:hover:bg-slate-800 disabled:opacity-50"
                                            >
                                                <span className="material-symbols-outlined text-[20px]">chevron_left</span>
                                            </button>
                                            <button
                                                onClick={() => handlePageChange(pagination.page + 1)}
                                                disabled={pagination.page === pagination.totalPages}
                                                className="relative inline-flex items-center rounded-r-md px-2 py-2 text-slate-400 ring-1 ring-inset ring-slate-300 hover:bg-slate-50 focus:z-20 focus:outline-offset-0 dark:ring-slate-700 dark:hover:bg-slate-800 disabled:opacity-50"
                                            >
                                                <span className="material-symbols-outlined text-[20px]">chevron_right</span>
                                            </button>
                                        </nav>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminKelompokList;
