import { useState, useEffect, useCallback } from 'react';
import TambahKelompokModal from '../components/Absensi/TambahKelompokModal';
import { kelompokService } from '../services/kelompok.service';
import { Link } from 'react-router-dom';

const Kelompok = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [kelompoks, setKelompoks] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [pagination, setPagination] = useState({
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 0
    });

    const fetchKelompoks = useCallback(async (page: number, search: string) => {
        setIsLoading(true);
        try {
            const response = await kelompokService.getAll({ page, limit: pagination.limit, q: search });
            setKelompoks(response.data);
            setPagination(prev => ({
                ...prev,
                page: response.meta.page,
                total: response.meta.total,
                totalPages: response.meta.totalPages
            }));
        } catch (error) {
            console.error('Failed to fetch kelompoks:', error);
        } finally {
            setIsLoading(false);
        }
    }, [pagination.limit]);

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            fetchKelompoks(1, searchTerm);
        }, 500);
        return () => clearTimeout(timeoutId);
    }, [searchTerm, fetchKelompoks]);

    const handleDelete = async (id: string, name: string) => {
        if (window.confirm(`Apakah Anda yakin ingin menghapus kelompok "${name}"? Kelompok hanya bisa dihapus jika tidak memiliki anggota KPM.`)) {
            try {
                await kelompokService.delete(id);
                fetchKelompoks(pagination.page, searchTerm);
                alert('Kelompok berhasil dihapus');
            } catch (error: any) {
                console.error('Failed to delete kelompok:', error);
                alert(error.response?.data?.message || 'Gagal menghapus kelompok. Pastikan kelompok tidak memiliki anggota.');
            }
        }
    };

    const handlePageChange = (newPage: number) => {
        if (newPage >= 1 && newPage <= pagination.totalPages) {
            fetchKelompoks(newPage, searchTerm);
        }
    };

    return (
        <div className="layout-container flex grow flex-col">
            <div className="flex flex-1 justify-center py-6 px-4 sm:px-6 lg:px-8">
                <div className="layout-content-container flex flex-col w-full max-w-[1024px] flex-1 gap-6">
                    {/* Breadcrumbs */}
                    <div className="flex flex-wrap gap-2 text-sm">
                        <Link className="text-slate-500 hover:text-primary transition-colors font-medium dark:text-slate-400" to="/dashboard">Dashboard</Link>
                        <span className="text-slate-400 dark:text-slate-500">/</span>
                        <span className="text-slate-900 font-semibold dark:text-white">Kelompok Saya</span>
                    </div>
                    {/* Page Heading & Primary Action */}
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                        <div className="flex flex-col gap-1">
                            <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-4xl">Kelompok Saya</h1>
                            <p className="text-base font-normal text-slate-500 dark:text-slate-400">
                                Kelola daftar kelompok binaan dan anggota PKH Anda di sini.
                            </p>
                        </div>
                        <button
                            onClick={() => setIsModalOpen(true)}
                            className="inline-flex cursor-pointer items-center justify-center gap-2 whitespace-nowrap rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary transition-all"
                        >
                            <span className="material-symbols-outlined text-[20px]">add</span>
                            <span>Tambah Kelompok</span>
                        </button>
                    </div>
                    {/* Filters & Search */}
                    <div className="grid grid-cols-1 gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:grid-cols-12">
                        {/* Search */}
                        <div className="sm:col-span-12">
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
                        </div>
                    </div>
                    {/* Data Table */}
                    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm text-slate-600 dark:text-slate-400">
                                <thead className="border-b border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-800/50">
                                    <tr>
                                        <th className="px-6 py-4 font-semibold text-slate-900 dark:text-white" scope="col">Nama Kelompok</th>
                                        <th className="px-6 py-4 font-semibold text-slate-900 dark:text-white" scope="col">Wilayah / Lokasi</th>
                                        <th className="px-6 py-4 font-semibold text-slate-900 dark:text-white" scope="col">Jumlah Anggota</th>
                                        <th className="px-6 py-4 text-right font-semibold text-slate-900 dark:text-white" scope="col">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                                    {isLoading ? (
                                        <tr>
                                            <td colSpan={4} className="px-6 py-10 text-center">
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
                                                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-100 text-primary dark:bg-blue-900/30 dark:text-blue-300">
                                                            <span className="material-symbols-outlined">diversity_3</span>
                                                        </div>
                                                        <div>
                                                            <div className="font-medium text-slate-900 dark:text-white">{klp.namaKelompok || klp.nama}</div>
                                                            <div className="text-xs text-slate-500">ID: {klp.id.substring(0, 8)}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="font-medium text-slate-900 dark:text-white">{klp.desa}, {klp.kecamatan}</div>
                                                    <div className="text-xs">{klp.kabupaten}, {klp.provinsi}</div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 px-2.5 py-0.5 text-xs font-medium dark:border-slate-700">
                                                        <span className="material-symbols-outlined text-[14px]">person</span>
                                                        {klp.kpmCount || 0} KPM
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <div className="flex justify-end gap-2">
                                                        <Link to={`/kelompok/${klp.id}`} className="inline-flex items-center gap-1 rounded-md px-3 py-1.5 text-sm font-medium text-primary hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors">
                                                            Detail
                                                            <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                                                        </Link>
                                                        <button
                                                            onClick={() => handleDelete(klp.id, klp.namaKelompok || klp.nama)}
                                                            className="inline-flex items-center justify-center rounded-md p-1.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                                                            title="Hapus Kelompok"
                                                        >
                                                            <span className="material-symbols-outlined text-[20px]">delete</span>
                                                        </button>
                                                    </div>
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
                                                <span className="sr-only">Previous</span>
                                                <span className="material-symbols-outlined text-[20px]">chevron_left</span>
                                            </button>
                                            {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((p) => (
                                                <button
                                                    key={p}
                                                    onClick={() => handlePageChange(p)}
                                                    className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold focus:z-20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 ${p === pagination.page ? 'z-10 bg-primary text-white focus-visible:outline-primary' : 'text-slate-900 ring-1 ring-inset ring-slate-300 hover:bg-slate-50 dark:text-white dark:ring-slate-700 dark:hover:bg-slate-800'}`}
                                                >
                                                    {p}
                                                </button>
                                            ))}
                                            <button
                                                onClick={() => handlePageChange(pagination.page + 1)}
                                                disabled={pagination.page === pagination.totalPages}
                                                className="relative inline-flex items-center rounded-r-md px-2 py-2 text-slate-400 ring-1 ring-inset ring-slate-300 hover:bg-slate-50 focus:z-20 focus:outline-offset-0 dark:ring-slate-700 dark:hover:bg-slate-800 disabled:opacity-50"
                                            >
                                                <span className="sr-only">Next</span>
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
            <TambahKelompokModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSuccess={() => fetchKelompoks(1, searchTerm)} />
        </div>
    );
};

export default Kelompok;
