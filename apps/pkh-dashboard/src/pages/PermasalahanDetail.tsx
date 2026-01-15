import { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { kelompokService } from '../services/kelompok.service';
import { inputDataService } from '../services/inputData.service';
import { exportToCSV } from '../lib/exportUtils';
import InputPermasalahanModal from '../components/Permasalahan/InputPermasalahanModal';

const PermasalahanDetail = () => {
    const { id: kelompokId } = useParams<{ id: string }>();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [kelompok, setKelompok] = useState<any>(null);
    const [permasalahanList, setPermasalahanList] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [isUpdating, setIsUpdating] = useState(false);

    const fetchData = useCallback(async () => {
        if (!kelompokId) return;
        setIsLoading(true);
        setError(null);
        try {
            const [kelompokResp, permasalahanResp] = await Promise.all([
                kelompokService.getById(kelompokId),
                inputDataService.permasalahan.getByKelompok(kelompokId)
            ]);
            setKelompok(kelompokResp);
            setPermasalahanList(permasalahanResp.data || permasalahanResp);
        } catch (err: any) {
            setError(err.message || 'Gagal mengambil data permasalahan');
        } finally {
            setIsLoading(false);
        }
    }, [kelompokId]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const filteredData = permasalahanList.filter(item =>
        (item.kpm?.namaLengkap || item.kpm?.nama)?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.judulMasalah?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.deskripsiMasalah?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.kategori?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleStatusChange = async (id: string, newStatus: string) => {
        setIsUpdating(true);
        try {
            await inputDataService.permasalahan.update(id, { status: newStatus });
            fetchData();
        } catch (err: any) {
            setError(err.message || 'Gagal mengubah status');
        } finally {
            setIsUpdating(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm('Apakah Anda yakin ingin menghapus data permasalahan ini?')) return;

        setIsUpdating(true);
        try {
            await inputDataService.permasalahan.delete(id);
            fetchData();
        } catch (err: any) {
            setError(err.message || 'Gagal menghapus data');
        } finally {
            setIsUpdating(false);
        }
    };

    if (isLoading && !kelompok) {
        return (
            <div className="flex h-96 items-center justify-center">
                <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
            </div>
        );
    }

    return (
        <div className="layout-container flex grow flex-col gap-6">
            {/* Breadcrumbs */}
            <div className="flex flex-wrap gap-2 items-center text-sm">
                <Link className="text-[#617589] font-medium hover:text-primary flex items-center gap-1" to="/dashboard">
                    <span className="material-symbols-outlined text-[18px]">home</span>
                    Dashboard
                </Link>
                <span className="text-[#617589] font-medium">/</span>
                <Link className="text-[#617589] font-medium hover:text-primary" to="/permasalahan">Daftar Kelompok</Link>
                <span className="text-[#617589] font-medium">/</span>
                <span className="text-primary font-bold">Data Permasalahan</span>
            </div>

            {/* Page Header */}
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                <div className="flex flex-col gap-2 max-w-2xl">
                    <h1 className="text-3xl md:text-4xl font-extrabold leading-tight tracking-tight text-[#111418] dark:text-white">
                        Data Permasalahan - {kelompok?.namaKelompok || kelompok?.nama}
                    </h1>
                    <p className="text-[#617589] text-base font-normal">
                        Kelola dan pantau status permasalahan KPM di {kelompok?.namaKelompok || kelompok?.nama}, Desa {kelompok?.desa}.
                    </p>
                </div>
            </div>

            {error && (
                <div className="p-4 bg-red-50 text-red-600 border border-red-200 rounded-lg text-sm font-medium">
                    {error}
                </div>
            )}

            {/* Controls Toolbar */}
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white dark:bg-[#1e2732] p-4 rounded-xl border border-[#e5e7eb] dark:border-gray-700 shadow-sm">
                <div className="relative w-full md:w-96">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#617589]">
                        <span className="material-symbols-outlined">search</span>
                    </span>
                    <input
                        className="w-full h-10 pl-11 pr-4 rounded-lg bg-[#f6f7f8] dark:bg-gray-800 border border-[#dbe0e6] dark:border-gray-600 focus:border-primary focus:ring-1 focus:ring-primary text-sm text-[#111418] dark:text-white placeholder:text-[#617589] transition-all"
                        placeholder="Cari nama KPM atau masalah..."
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="flex w-full md:w-auto gap-3">
                    <button
                        onClick={() => {
                            const exportData = permasalahanList.map(item => ({
                                'Nama KPM': item.kpm?.namaLengkap || item.kpm?.nama,
                                'NIK': `'${item.kpm?.nik}`,
                                'Judul Masalah': item.judulMasalah,
                                'Kategori': item.kategori,
                                'Deskripsi': item.deskripsiMasalah || '-',
                                'Tanggal Lapor': item.tanggalLapor ? new Date(item.tanggalLapor).toLocaleDateString('id-ID') : '-',
                                'Status': item.status || 'Baru'
                            }));
                            exportToCSV(exportData, `Data_Permasalahan_${kelompok?.namaKelompok || 'Kelompok'}`);
                        }}
                        className="flex-1 md:flex-none h-10 px-4 flex items-center justify-center gap-2 bg-white dark:bg-[#1e2732] border border-[#dbe0e6] dark:border-gray-600 rounded-lg text-[#111418] dark:text-white font-medium text-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer"
                    >
                        <span className="material-symbols-outlined text-[20px] text-green-600">file_download</span>
                        <span>Export CSV</span>
                    </button>
                    <button
                        className="flex-1 md:flex-none h-10 px-4 flex items-center justify-center gap-2 bg-primary hover:bg-blue-600 text-white rounded-lg font-bold text-sm transition-colors shadow-sm"
                        onClick={() => setIsModalOpen(true)}
                    >
                        <span className="material-symbols-outlined text-[20px]">add</span>
                        <span>Input Permasalahan</span>
                    </button>
                </div>
            </div>

            {/* Data Table */}
            <div className="overflow-hidden bg-white dark:bg-[#1e2732] rounded-xl shadow-sm border border-[#e5e7eb] dark:border-gray-700">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-[#f6f7f8]/50 dark:bg-gray-800/50 border-b border-[#e5e7eb] dark:border-gray-700 text-xs uppercase tracking-wide text-[#617589] font-bold">
                                <th className="p-4 w-12 text-center">No</th>
                                <th className="p-4">Nama KPM</th>
                                <th className="p-4">Permasalahan</th>
                                <th className="p-4">Kategori</th>
                                <th className="p-4 hidden md:table-cell">Deskripsi</th>
                                <th className="p-4">Tgl Lapor</th>
                                <th className="p-4">Status</th>
                                <th className="p-4 text-right">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#e5e7eb] dark:divide-gray-700 text-sm">
                            {filteredData.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="p-8 text-center text-[#617589]">Tidak ada data permasalahan ditemukan.</td>
                                </tr>
                            ) : (
                                filteredData.map((item, index) => (
                                    <tr key={item.id} className="hover:bg-[#f6f7f8] dark:hover:bg-gray-800/30 transition-colors group">
                                        <td className="p-4 text-center text-[#617589]">{index + 1}</td>
                                        <td className="p-4">
                                            <div className="font-bold text-[#111418] dark:text-white capitalize">{item.kpm?.namaLengkap || item.kpm?.nama}</div>
                                            <div className="text-xs text-[#617589]">{item.kpm?.nik}</div>
                                        </td>
                                        <td className="p-4">
                                            <div className="font-bold text-[#111418] dark:text-white capitalize truncate max-w-[150px]" title={item.judulMasalah}>{item.judulMasalah}</div>
                                        </td>
                                        <td className="p-4">
                                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 text-xs font-semibold border border-blue-200 dark:border-blue-800 capitalize">
                                                {item.kategori}
                                            </span>
                                        </td>
                                        <td className="p-4 hidden md:table-cell text-[#617589] max-w-xs truncate" title={item.deskripsiMasalah}>
                                            {item.deskripsiMasalah}
                                        </td>
                                        <td className="p-4 text-[#111418] dark:text-white">{item.tanggalLapor ? new Date(item.tanggalLapor).toLocaleDateString('id-ID') : '-'}</td>
                                        <td className="p-4">
                                            <select
                                                value={item.status || 'baru'}
                                                onChange={(e) => handleStatusChange(item.id, e.target.value)}
                                                disabled={isUpdating}
                                                className={`text-xs font-bold px-2.5 py-1.5 rounded-lg border cursor-pointer outline-none transition-all ${item.status === 'selesai'
                                                        ? 'bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-300 dark:border-green-800'
                                                        : item.status === 'diproses'
                                                            ? 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-800'
                                                            : item.status === 'tidak_terselesaikan'
                                                                ? 'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-300 dark:border-red-800'
                                                                : 'bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-300 dark:border-yellow-800'
                                                    } disabled:opacity-50`}
                                            >
                                                <option value="baru">Baru</option>
                                                <option value="diproses">Diproses</option>
                                                <option value="selesai">Selesai</option>
                                                <option value="tidak_terselesaikan">Tidak Terselesaikan</option>
                                            </select>
                                        </td>
                                        <td className="p-4 text-right">
                                            <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button
                                                    onClick={() => handleDelete(item.id)}
                                                    disabled={isUpdating}
                                                    className="size-8 inline-flex items-center justify-center rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-[#617589] hover:text-red-500 transition-colors disabled:opacity-50"
                                                    title="Hapus"
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
            </div>

            <InputPermasalahanModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                kelompokId={kelompokId!}
                kelompokNama={kelompok?.namaKelompok || kelompok?.nama}
                onSuccess={fetchData}
            />
        </div>
    );
};

export default PermasalahanDetail;
