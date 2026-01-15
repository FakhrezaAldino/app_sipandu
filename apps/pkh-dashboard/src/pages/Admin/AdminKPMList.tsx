import { useState, useEffect, useCallback } from 'react';
import { adminApi } from '../../services/adminApi';
import { exportToCSV } from '../../lib/exportUtils';
import { Link } from 'react-router-dom';
import type { KpmDTO, KelompokDTO } from '../../types/api';

const AdminKPMList = () => {
    const [kpms, setKpms] = useState<KpmDTO[]>([]);
    const [kelompoks, setKelompoks] = useState<KelompokDTO[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedKelompok, setSelectedKelompok] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [pagination, setPagination] = useState({
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 0
    });

    const fetchData = useCallback(async (page: number, q: string, kelompokId: string, statusGraduasi: string) => {
        setIsLoading(true);
        try {
            const response = await adminApi.listKpm({ page, limit: pagination.limit, q, kelompokId, statusGraduasi });
            setKpms(response.data);
            setPagination(prev => ({
                ...prev,
                page: response.meta.page,
                total: response.meta.total,
                totalPages: response.meta.totalPages
            }));
        } catch (error) {
            console.error('Failed to fetch KPM:', error);
        } finally {
            setIsLoading(false);
        }
    }, [pagination.limit]);

    useEffect(() => {
        const fetchFilters = async () => {
            try {
                const response = await adminApi.listKelompok({ limit: 100 });
                setKelompoks(response.data);
            } catch (error) {
                console.error('Failed to fetch filter data:', error);
            }
        };
        fetchFilters();
    }, []);

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            fetchData(1, searchTerm, selectedKelompok, statusFilter);
        }, 500);
        return () => clearTimeout(timeoutId);
    }, [searchTerm, selectedKelompok, statusFilter, fetchData]);

    const handlePageChange = (newPage: number) => {
        if (newPage >= 1 && newPage <= pagination.totalPages) {
            fetchData(newPage, searchTerm, selectedKelompok, statusFilter);
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
                        <span className="text-slate-900 font-semibold dark:text-white">Daftar KPM</span>
                    </div>

                    {/* Page Heading */}
                    <div className="flex flex-col gap-1">
                        <div className="flex justify-between items-center">
                            <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-4xl">Profil KPM</h1>
                            <button
                                onClick={() => {
                                    const exportData = kpms.map(k => ({
                                        'Nama Lengkap': k.namaLengkap,
                                        'NIK': `'${k.nik}`,
                                        'Kelompok': k.kelompok?.namaKelompok || 'Unassigned',
                                        'Status': k.isGraduated ? 'Graduasi' : 'Aktif',
                                        'Tanggal Terdaftar': new Date(k.createdAt).toLocaleDateString('id-ID', { dateStyle: 'long' })
                                    }));
                                    exportToCSV(exportData, 'Data_KPM_Global');
                                }}
                                className="h-10 px-4 flex items-center gap-2 rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:bg-slate-800 dark:border-slate-700 dark:text-white dark:hover:bg-slate-700 transition-all font-semibold text-sm cursor-pointer shadow-sm"
                            >
                                <span className="material-symbols-outlined text-[20px] text-green-600">file_download</span>
                                <span>Export CSV</span>
                            </button>
                        </div>
                        <p className="text-base font-normal text-slate-500 dark:text-slate-400">
                            Monitor seluruh Keluarga Penerima Manfaat (KPM) PKH secara global.
                        </p>
                    </div>

                    {/* Filters */}
                    <div className="grid grid-cols-1 gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900 md:grid-cols-3">
                        <label className="relative flex w-full items-center">
                            <span className="material-symbols-outlined absolute left-3 text-slate-400">search</span>
                            <input
                                className="h-10 w-full rounded-lg border-slate-200 bg-slate-50 pl-10 pr-4 text-sm text-slate-900 placeholder:text-slate-400 focus:border-primary focus:ring-primary dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:placeholder:text-slate-500"
                                placeholder="Cari Nama atau NIK..."
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </label>

                        <select
                            className="h-10 w-full rounded-lg border-slate-200 bg-slate-50 px-4 text-sm text-slate-900 focus:border-primary focus:ring-primary dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                            value={selectedKelompok}
                            onChange={(e) => setSelectedKelompok(e.target.value)}
                        >
                            <option value="">Semua Kelompok</option>
                            {kelompoks.map(k => (
                                <option key={k.id} value={k.id}>{k.namaKelompok}</option>
                            ))}
                        </select>

                        <select
                            className="h-10 w-full rounded-lg border-slate-200 bg-slate-50 px-4 text-sm text-slate-900 focus:border-primary focus:ring-primary dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                        >
                            <option value="">Semua Status</option>
                            <option value="active">Aktif</option>
                            <option value="graduated">Graduasi</option>
                        </select>
                    </div>

                    {/* Data Table */}
                    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm text-slate-600 dark:text-slate-400">
                                <thead className="border-b border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-800/50">
                                    <tr>
                                        <th className="px-6 py-4 font-semibold text-slate-900 dark:text-white" scope="col">Nama KPM</th>
                                        <th className="px-6 py-4 font-semibold text-slate-900 dark:text-white" scope="col">NIK</th>
                                        <th className="px-6 py-4 font-semibold text-slate-900 dark:text-white" scope="col">Kelompok</th>
                                        <th className="px-6 py-4 font-semibold text-slate-900 dark:text-white" scope="col">Status</th>
                                        <th className="px-6 py-4 font-semibold text-slate-900 dark:text-white" scope="col">Tgl Daftar</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                                    {isLoading ? (
                                        <tr>
                                            <td colSpan={5} className="px-6 py-10 text-center text-slate-500">
                                                <div className="flex justify-center">
                                                    <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
                                                </div>
                                            </td>
                                        </tr>
                                    ) : kpms.length === 0 ? (
                                        <tr>
                                            <td colSpan={5} className="px-6 py-10 text-center text-slate-500">
                                                Tidak ada KPM yang ditemukan.
                                            </td>
                                        </tr>
                                    ) : (
                                        kpms.map((k) => (
                                            <tr key={k.id} className="group hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300">
                                                            <span className="material-symbols-outlined">person</span>
                                                        </div>
                                                        <div className="font-medium text-slate-900 dark:text-white underline decoration-transparent hover:decoration-primary transition-all">
                                                            <Link to={`/kpm/${k.id}`}>{k.namaLengkap}</Link>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 font-mono text-xs">{k.nik}</td>
                                                <td className="px-6 py-4">
                                                    <Link
                                                        to={`/kelompok/${k.kelompokId || k.kelompok?.id}`}
                                                        className="text-primary hover:underline font-medium dark:text-blue-400"
                                                    >
                                                        {k.kelompok?.namaKelompok || 'Unassigned'}
                                                    </Link>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${k.isGraduated ? 'bg-orange-50 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400' : 'bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400'}`}>
                                                        {k.isGraduated ? 'Graduasi' : 'Aktif'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-xs">
                                                    {new Date(k.createdAt).toLocaleDateString('id-ID', { dateStyle: 'medium' })}
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
                                                className="px-2 py-2 text-slate-400 ring-1 ring-inset ring-slate-300 hover:bg-slate-50 dark:ring-slate-700 dark:hover:bg-slate-800 rounded-l-md"
                                            >
                                                <span className="material-symbols-outlined text-[20px]">chevron_left</span>
                                            </button>
                                            <button
                                                onClick={() => handlePageChange(pagination.page + 1)}
                                                disabled={pagination.page === pagination.totalPages}
                                                className="px-2 py-2 text-slate-400 ring-1 ring-inset ring-slate-300 hover:bg-slate-50 dark:ring-slate-700 dark:hover:bg-slate-800 rounded-r-md"
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

export default AdminKPMList;
