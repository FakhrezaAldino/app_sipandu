import { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import TambahKPMModal from '../components/Kelompok/TambahKPMModal';
import EditKelompokModal from '../components/Kelompok/EditKelompokModal';
import KPMDetailModal from '../components/Kelompok/KPMDetailModal';
import { kelompokService } from '../services/kelompok.service';
import { kpmService } from '../services/kpm.service';
import { exportToCSV } from '../lib/exportUtils';
import { useAuth } from '../context/AuthContext';

const KelompokDetail = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { user } = useAuth();
    const isAdmin = user?.role === 'admin';
    const [kelompok, setKelompok] = useState<any>(null);
    const [kpms, setKpms] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isKpmsLoading, setIsKpmsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [pagination, setPagination] = useState({
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 0
    });

    const [isTambahKpmOpen, setIsTambahKpmOpen] = useState(false);
    const [isEditKelompokOpen, setIsEditKelompokOpen] = useState(false);
    const [isKpmDetailOpen, setIsKpmDetailOpen] = useState(false);
    const [selectedKpmId, setSelectedKpmId] = useState<string | null>(null);

    const fetchKelompokDetail = useCallback(async () => {
        if (!id) return;
        setIsLoading(true);
        try {
            const resp = await kelompokService.getById(id);
            setKelompok(resp.data);
        } catch (error) {
            console.error('Failed to fetch kelompok detail:', error);
        } finally {
            setIsLoading(false);
        }
    }, [id]);

    const fetchKpms = useCallback(async (page: number, search: string) => {
        if (!id) return;
        setIsKpmsLoading(true);
        try {
            const resp = await kpmService.getByKelompok(id, { page, limit: pagination.limit, search });
            setKpms(resp.data);
            setPagination(prev => ({
                ...prev,
                page: resp.meta.page,
                total: resp.meta.total,
                totalPages: resp.meta.totalPages
            }));
        } catch (error) {
            console.error('Failed to fetch KPMs:', error);
        } finally {
            setIsKpmsLoading(false);
        }
    }, [id, pagination.limit]);

    useEffect(() => {
        fetchKelompokDetail();
    }, [fetchKelompokDetail]);

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            fetchKpms(1, searchTerm);
        }, 500);
        return () => clearTimeout(timeoutId);
    }, [searchTerm, fetchKpms]);


    const handleDeleteKpm = async (kpmId: string, name: string) => {
        if (window.confirm(`Apakah Anda yakin ingin menghapus KPM "${name}"?`)) {
            try {
                await kpmService.delete(kpmId);
                fetchKpms(pagination.page, searchTerm);
                alert('KPM berhasil dihapus');
            } catch (error: any) {
                console.error('Failed to delete KPM:', error);
                alert(error.response?.data?.message || 'Gagal menghapus KPM.');
            }
        }
    };

    const handlePageChange = (newPage: number) => {
        if (newPage >= 1 && newPage <= pagination.totalPages) {
            fetchKpms(newPage, searchTerm);
        }
    };

    if (isLoading && !kelompok) {
        return (
            <div className="flex h-screen items-center justify-center">
                <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
            </div>
        );
    }

    if (!kelompok) {
        return (
            <div className="p-10 text-center">
                <h2 className="text-xl font-bold dark:text-white">Kelompok tidak ditemukan</h2>
                <Link to="/kelompok" className="mt-4 text-primary hover:underline">Kembali ke daftar kelompok</Link>
            </div>
        );
    }

    return (
        <div className="layout-container flex grow flex-col">
            <div className="flex flex-1 justify-center py-6 px-4 sm:px-6 lg:px-8">
                <div className="layout-content-container flex flex-col w-full max-w-[1024px] flex-1 gap-6">
                    {/* Breadcrumbs */}
                    <div className="flex flex-wrap gap-2 text-sm">
                        <Link className="text-slate-500 hover:text-primary transition-colors font-medium dark:text-slate-400" to="/dashboard">Dashboard</Link>
                        <span className="text-slate-400 dark:text-slate-500">/</span>
                        <Link className="text-slate-500 hover:text-primary transition-colors font-medium dark:text-slate-400" to="/kelompok">Daftar Kelompok</Link>
                        <span className="text-slate-400 dark:text-slate-500">/</span>
                        <span className="text-slate-900 font-semibold dark:text-white">Detail Kelompok</span>
                    </div>

                    {/* Header */}
                    <div className="flex flex-col gap-4">
                        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                            <div>
                                <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white mb-3">
                                    Detail Kelompok: {kelompok.namaKelompok || kelompok.nama}
                                </h1>
                                <div className="flex flex-wrap gap-2 text-sm text-slate-600 dark:text-slate-400">
                                    <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded">
                                        <span className="material-symbols-outlined text-[16px]">fingerprint</span>
                                        <span>ID: {kelompok.id.substring(0, 8)}</span>
                                    </div>
                                    <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded">
                                        <span className="material-symbols-outlined text-[16px]">location_on</span>
                                        <span>{kelompok.desa}, {kelompok.kecamatan}, {kelompok.kabupaten}, {kelompok.provinsi}</span>
                                    </div>
                                </div>
                            </div>
                            {!isAdmin && (
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => setIsEditKelompokOpen(true)}
                                        className="inline-flex cursor-pointer items-center justify-center gap-2 whitespace-nowrap rounded-lg bg-white border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50 dark:bg-slate-800 dark:border-slate-700 dark:text-white dark:hover:bg-slate-700 transition-all"
                                    >
                                        <span className="material-symbols-outlined text-[18px]">edit</span>
                                        <span>Edit Kelompok</span>
                                    </button>
                                    <button
                                        onClick={() => setIsTambahKpmOpen(true)}
                                        className="inline-flex cursor-pointer items-center justify-center gap-2 whitespace-nowrap rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-600 transition-all"
                                    >
                                        <span className="material-symbols-outlined text-[18px]">add</span>
                                        <span>Tambah KPM</span>
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900 flex flex-col justify-between h-[100px]">
                            <div className="flex justify-between items-start">
                                <span className="text-sm font-medium text-slate-500 dark:text-slate-400">Total KPM</span>
                                <div className="p-1 rounded-full bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400">
                                    <span className="material-symbols-outlined text-[20px]">groups</span>
                                </div>
                            </div>
                            <span className="text-3xl font-bold text-slate-900 dark:text-white">{kelompok.kpmCount || 0}</span>
                        </div>
                        <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900 flex flex-col justify-between h-[100px]">
                            <div className="flex justify-between items-start">
                                <span className="text-sm font-medium text-slate-500 dark:text-slate-400">Lokasi</span>
                                <div className="p-1 rounded-full bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400">
                                    <span className="material-symbols-outlined text-[20px]">location_city</span>
                                </div>
                            </div>
                            <span className="text-xl font-bold text-slate-900 dark:text-white truncate">{kelompok.desa}</span>
                        </div>
                        <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900 flex flex-col justify-between h-[100px]">
                            <div className="flex justify-between items-start">
                                <span className="text-sm font-medium text-slate-500 dark:text-slate-400">Wilayah</span>
                                <div className="p-1 rounded-full bg-orange-50 text-orange-600 dark:bg-orange-900/20 dark:text-orange-400">
                                    <span className="material-symbols-outlined text-[20px]">map</span>
                                </div>
                            </div>
                            <span className="text-xl font-bold text-slate-900 dark:text-white truncate">{kelompok.kecamatan}</span>
                        </div>
                    </div>

                    {/* Table Section */}
                    <div className="flex flex-col gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Daftar Anggota KPM</h3>
                            <div className="flex gap-2 w-full sm:w-auto">
                                <button
                                    onClick={() => {
                                        const exportData = kpms.map(k => ({
                                            'Nama KPM': k.namaLengkap || k.nama,
                                            'NIK': `'${k.nik}`,
                                            'Status': (k.status || (k.isActive ? 'aktif' : 'nonaktif')).charAt(0).toUpperCase() + (k.status || (k.isActive ? 'aktif' : 'nonaktif')).slice(1)
                                        }));
                                        exportToCSV(exportData, `Daftar_KPM_${kelompok?.namaKelompok || 'Kelompok'}`);
                                    }}
                                    className="h-10 px-4 flex items-center gap-2 rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:bg-slate-800 dark:border-slate-700 dark:text-white dark:hover:bg-slate-700 transition-all font-semibold text-sm cursor-pointer"
                                >
                                    <span className="material-symbols-outlined text-[20px] text-green-600">file_download</span>
                                    <span>Export CSV</span>
                                </button>
                                <label className="relative flex w-full sm:w-64 items-center">
                                    <span className="material-symbols-outlined absolute left-3 text-slate-400 text-[20px]">search</span>
                                    <input
                                        className="h-10 w-full rounded-lg border-slate-200 bg-slate-50 pl-10 pr-4 text-sm text-slate-900 placeholder:text-slate-400 focus:border-primary focus:ring-primary dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:placeholder:text-slate-500"
                                        placeholder="Cari Nama KPM atau NIK..."
                                        type="text"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                </label>
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm text-slate-600 dark:text-slate-400">
                                <thead className="border-b border-slate-100 bg-slate-50/50 dark:border-slate-800 dark:bg-slate-800/50">
                                    <tr>
                                        <th className="px-4 py-3 font-semibold text-slate-900 dark:text-white w-12 text-center">NO</th>
                                        <th className="px-4 py-3 font-semibold text-slate-900 dark:text-white">NAMA KPM</th>
                                        <th className="px-4 py-3 font-semibold text-slate-900 dark:text-white">NIK</th>
                                        <th className="px-4 py-3 font-semibold text-slate-900 dark:text-white">STATUS</th>
                                        <th className="px-4 py-3 text-right font-semibold text-slate-900 dark:text-white">AKSI</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                    {isKpmsLoading ? (
                                        <tr>
                                            <td colSpan={5} className="px-4 py-10 text-center">
                                                <div className="flex justify-center">
                                                    <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
                                                </div>
                                            </td>
                                        </tr>
                                    ) : kpms.length === 0 ? (
                                        <tr>
                                            <td colSpan={5} className="px-4 py-10 text-center text-slate-500">
                                                Belum ada anggota KPM di kelompok ini.
                                            </td>
                                        </tr>
                                    ) : (
                                        kpms.map((kpm, idx) => (
                                            <tr key={kpm.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                                <td className="px-4 py-3 text-center">{(pagination.page - 1) * pagination.limit + idx + 1}</td>
                                                <td className="px-4 py-3">
                                                    <div className="flex items-center gap-3">
                                                        <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-primary dark:bg-blue-900/30 dark:text-blue-300">
                                                            {(kpm.namaLengkap || kpm.nama).substring(0, 2).toUpperCase()}
                                                        </div>
                                                        <span className="font-medium text-slate-900 dark:text-white">{kpm.namaLengkap || kpm.nama}</span>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3 font-mono text-xs">{kpm.nik}</td>
                                                <td className="px-4 py-3">
                                                    <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium border ${(kpm.status || (kpm.isActive ? 'aktif' : 'nonaktif')) === 'aktif' ? 'bg-green-100 text-green-800 border-green-200' :
                                                        (kpm.status || (kpm.isActive ? 'aktif' : 'nonaktif')) === 'graduasi' ? 'bg-blue-100 text-blue-800 border-blue-200' :
                                                            'bg-gray-100 text-gray-800 border-gray-200'
                                                        }`}>
                                                        {(kpm.status || (kpm.isActive ? 'aktif' : 'nonaktif')).charAt(0).toUpperCase() + (kpm.status || (kpm.isActive ? 'aktif' : 'nonaktif')).slice(1)}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 text-right">
                                                    <div className="flex justify-end gap-2">
                                                        <button
                                                            onClick={() => {
                                                                setSelectedKpmId(kpm.id);
                                                                setIsKpmDetailOpen(true);
                                                            }}
                                                            className="inline-flex items-center justify-center rounded-md border border-primary/20 bg-primary/5 px-2 py-1 text-xs font-medium text-primary hover:bg-primary hover:text-white transition-all cursor-pointer"
                                                        >
                                                            <span className="material-symbols-outlined text-[16px] mr-1">visibility</span>
                                                            Detail
                                                        </button>
                                                        {!isAdmin && (
                                                            <button
                                                                onClick={() => handleDeleteKpm(kpm.id, kpm.namaLengkap || kpm.nama)}
                                                                className="inline-flex items-center justify-center rounded-md p-1 text-red-600 hover:bg-red-50 transition-colors"
                                                                title="Hapus KPM"
                                                            >
                                                                <span className="material-symbols-outlined text-[18px]">delete</span>
                                                            </button>
                                                        )}
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
                            <div className="flex items-center justify-between border-t border-slate-100 pt-4 dark:border-slate-800">
                                <p className="text-sm text-slate-600 dark:text-slate-400">
                                    Menampilkan <span className="font-medium text-slate-900 dark:text-white">{(pagination.page - 1) * pagination.limit + 1}</span> sampai <span className="font-medium text-slate-900 dark:text-white">{Math.min(pagination.page * pagination.limit, pagination.total)}</span> dari <span className="font-medium text-slate-900 dark:text-white">{pagination.total}</span> hasil
                                </p>
                                <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm">
                                    <button
                                        disabled={pagination.page === 1}
                                        onClick={() => handlePageChange(pagination.page - 1)}
                                        className="relative inline-flex items-center rounded-l-md px-2 py-2 text-slate-400 ring-1 ring-inset ring-slate-300 hover:bg-slate-50 focus:z-20 focus:outline-offset-0 dark:ring-slate-700 dark:hover:bg-slate-800 disabled:opacity-50"
                                    >
                                        <span className="material-symbols-outlined text-[20px]">chevron_left</span>
                                    </button>
                                    {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((p) => (
                                        <button
                                            key={p}
                                            onClick={() => handlePageChange(p)}
                                            className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold focus:z-20 ${p === pagination.page ? 'z-10 bg-primary text-white' : 'text-slate-900 ring-1 ring-inset ring-slate-300 hover:bg-slate-50 dark:text-white dark:ring-slate-700 dark:hover:bg-slate-800'}`}
                                        >
                                            {p}
                                        </button>
                                    ))}
                                    <button
                                        disabled={pagination.page === pagination.totalPages}
                                        onClick={() => handlePageChange(pagination.page + 1)}
                                        className="relative inline-flex items-center rounded-r-md px-2 py-2 text-slate-400 ring-1 ring-inset ring-slate-300 hover:bg-slate-50 focus:z-20 focus:outline-offset-0 dark:ring-slate-700 dark:hover:bg-slate-800 disabled:opacity-50"
                                    >
                                        <span className="material-symbols-outlined text-[20px]">chevron_right</span>
                                    </button>
                                </nav>
                            </div>
                        )}
                    </div>
                </div>
            </div>
            <TambahKPMModal
                isOpen={isTambahKpmOpen}
                onClose={() => setIsTambahKpmOpen(false)}
                kelompokId={id}
                onSuccess={() => fetchKpms(1, searchTerm)}
            />
            <EditKelompokModal
                isOpen={isEditKelompokOpen}
                onClose={() => setIsEditKelompokOpen(false)}
                kelompok={kelompok}
                onSuccess={() => {
                    fetchKelompokDetail();
                    setIsEditKelompokOpen(false);
                }}
            />
            <KPMDetailModal
                isOpen={isKpmDetailOpen}
                onClose={() => {
                    setIsKpmDetailOpen(false);
                    setSelectedKpmId(null);
                }}
                kpmId={selectedKpmId}
            />
        </div>
    );
};

export default KelompokDetail;
