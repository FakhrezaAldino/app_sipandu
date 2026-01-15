import { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { kelompokService } from '../services/kelompok.service';
import { inputDataService } from '../services/inputData.service';
import { exportToCSV } from '../lib/exportUtils';
import InputGraduasiModal from '../components/Graduasi/InputGraduasiModal';

const GraduasiDetail = () => {
    const { id: kelompokId } = useParams<{ id: string }>();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [kelompok, setKelompok] = useState<any>(null);
    const [graduasiList, setGraduasiList] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('Semua Status');
    const [editingItem, setEditingItem] = useState<any>(null);

    const fetchData = useCallback(async () => {
        if (!kelompokId) return;
        setIsLoading(true);
        setError(null);
        try {
            const [kelompokResp, graduasiResp] = await Promise.all([
                kelompokService.getById(kelompokId),
                inputDataService.graduasi.getByKelompok(kelompokId)
            ]);
            setKelompok(kelompokResp);
            setGraduasiList(graduasiResp.data || graduasiResp);
        } catch (err: any) {
            setError(err.message || 'Gagal mengambil data graduasi');
        } finally {
            setIsLoading(false);
        }
    }, [kelompokId]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const filteredData = graduasiList.filter(item => {
        const matchesSearch =
            (item.kpm?.namaLengkap || item.kpm?.nama)?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.kpm?.nik?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.alasanGraduasi?.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesStatus = statusFilter === 'Semua Status' ||
            (statusFilter === 'Kepesertaan' && item.jenisGraduasi === 'kepesertaan') ||
            (statusFilter === 'Alami' && item.jenisGraduasi === 'alami') ||
            (statusFilter === 'Mandiri' && item.jenisGraduasi === 'mandiri');

        return matchesSearch && matchesStatus;
    });

    if (isLoading && !kelompok) {
        return (
            <div className="flex h-96 items-center justify-center">
                <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
            </div>
        );
    }

    return (
        <div className="max-w-[1200px] mx-auto flex flex-col gap-6">
            {/* Breadcrumbs */}
            <div className="flex flex-wrap gap-2 items-center text-sm">
                <Link className="text-[#617589] dark:text-gray-400 font-medium hover:text-primary transition-colors" to="/dashboard">Home</Link>
                <span className="material-symbols-outlined text-base text-[#617589] dark:text-gray-500">chevron_right</span>
                <Link className="text-[#617589] dark:text-gray-400 font-medium hover:text-primary transition-colors" to="/graduasi">Pilih Kelompok</Link>
                <span className="material-symbols-outlined text-base text-[#617589] dark:text-gray-500">chevron_right</span>
                <span className="text-[#111418] dark:text-white font-medium">Data Graduasi</span>
            </div>

            {/* Page Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
                <div className="flex flex-col gap-2">
                    <h1 className="text-[#111418] dark:text-white text-3xl md:text-4xl font-bold tracking-tight">Data Graduasi - {kelompok?.namaKelompok || kelompok?.nama}</h1>
                    <p className="text-[#617589] dark:text-gray-400 text-base font-normal max-w-2xl">
                        Kelola status graduasi KPM di {kelompok?.namaKelompok || kelompok?.nama}, Desa {kelompok?.desa}. Pastikan data sudah diverifikasi.
                    </p>
                </div>
            </div>

            {error && (
                <div className="p-4 bg-red-50 text-red-600 border border-red-200 rounded-lg text-sm font-medium">
                    {error}
                </div>
            )}

            {/* Action Toolbar & Filters */}
            <div className="flex flex-col xl:flex-row justify-between gap-4 bg-white dark:bg-[#1a202c] p-4 rounded-xl shadow-sm border border-[#e5e7eb] dark:border-[#2a3441]">
                <div className="flex-1 max-w-xl">
                    <label className="relative block w-full">
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-[#617589] dark:text-gray-400">
                            <span className="material-symbols-outlined">search</span>
                        </span>
                        <input
                            className="block w-full rounded-lg border-0 py-2.5 pl-10 pr-4 text-[#111418] dark:text-white ring-1 ring-inset ring-[#e5e7eb] dark:ring-[#2a3441] placeholder:text-[#617589] dark:placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm sm:leading-6 bg-[#f8fafc] dark:bg-[#2d3748]"
                            placeholder="Cari Nama KPM, NIK..."
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </label>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
                    <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-[#617589] dark:text-gray-400 whitespace-nowrap">Filter Status:</span>
                        <select
                            className="block w-full sm:w-auto rounded-lg border-0 py-2 pl-3 pr-8 text-[#111418] dark:text-white ring-1 ring-inset ring-[#e5e7eb] dark:ring-[#2a3441] focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm bg-white dark:bg-[#2d3748]"
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                        >
                            <option>Semua Status</option>
                            <option value="Kepesertaan">Kepesertaan</option>
                            <option value="Alami">Alami</option>
                            <option value="Mandiri">Mandiri</option>
                        </select>
                    </div>
                    <div className="h-8 w-[1px] bg-[#e5e7eb] dark:bg-[#2a3441] hidden sm:block mx-1"></div>
                    <button
                        onClick={() => {
                            const exportData = graduasiList.map(item => ({
                                'Nama KPM': item.kpm?.namaLengkap || item.kpm?.nama,
                                'NIK': `'${item.kpm?.nik}`,
                                'Jenis Graduasi': item.jenisGraduasi,
                                'Tanggal Graduasi': item.tanggalGraduasi ? new Date(item.tanggalGraduasi).toLocaleDateString('id-ID') : '-',
                                'Alasan': item.alasanGraduasi || '-'
                            }));
                            exportToCSV(exportData, `Data_Graduasi_${kelompok?.namaKelompok || 'Kelompok'}`);
                        }}
                        className="inline-flex items-center justify-center gap-2 rounded-lg bg-white dark:bg-[#2d3748] px-4 py-2.5 text-sm font-semibold text-[#111418] dark:text-white shadow-sm ring-1 ring-inset ring-[#dbe0e6] dark:ring-[#2a3441] hover:bg-[#f6f7f8] dark:hover:bg-[#101922] transition-all cursor-pointer"
                    >
                        <span className="material-symbols-outlined text-[20px] text-green-600">file_download</span>
                        Export CSV
                    </button>
                    <button
                        className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary hover:bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-all cursor-pointer"
                        onClick={() => {
                            setEditingItem(null);
                            setIsModalOpen(true);
                        }}
                    >
                        <span className="material-symbols-outlined text-[20px]">add</span>
                        Input Graduasi
                    </button>
                </div>
            </div>

            {/* Data Table Section */}
            <div className="bg-white dark:bg-[#1a202c] rounded-xl shadow-sm border border-[#e5e7eb] dark:border-[#2a3441] overflow-hidden flex-1 flex flex-col">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-[#e5e7eb] dark:divide-[#2a3441]">
                        <thead className="bg-[#f9fafb] dark:bg-gray-800/50">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-bold text-[#617589] dark:text-gray-400 uppercase tracking-wider">Nama KPM</th>

                                <th className="px-6 py-4 text-left text-xs font-bold text-[#617589] dark:text-gray-400 uppercase tracking-wider">Jenis Graduasi</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-[#617589] dark:text-gray-400 uppercase tracking-wider">Tanggal</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-[#617589] dark:text-gray-400 uppercase tracking-wider">Keterangan</th>
                                <th className="px-6 py-4 text-right text-xs font-bold text-[#617589] dark:text-gray-400 uppercase tracking-wider">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#e5e7eb] dark:divide-[#2a3441] bg-white dark:bg-[#1a202c]">
                            {filteredData.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-8 text-center text-[#617589]">Tidak ada data graduasi ditemukan.</td>
                                </tr>
                            ) : (
                                filteredData.map((item) => (
                                    <tr key={item.id} className="hover:bg-[#f9fafb] dark:hover:bg-gray-800/50 transition-colors group">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="h-10 w-10 flex-shrink-0 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-primary font-bold">
                                                    {(item.kpm?.namaLengkap || item.kpm?.nama)?.charAt(0)}
                                                </div>
                                                <div className="ml-4">
                                                    <div className="text-sm font-semibold text-[#111418] dark:text-white capitalize">{item.kpm?.namaLengkap || item.kpm?.nama}</div>
                                                    <div className="text-xs text-[#617589] dark:text-gray-500">NIK: {item.kpm?.nik}</div>
                                                </div>
                                            </div>
                                        </td>

                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${item.jenisGraduasi === 'mandiri'
                                                ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                                                : item.jenisGraduasi === 'alami'
                                                    ? 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300'
                                                    : 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
                                                }`}>
                                                <span className={`w-1.5 h-1.5 rounded-full ${item.jenisGraduasi === 'mandiri' ? 'bg-green-500' : item.jenisGraduasi === 'alami' ? 'bg-orange-500' : 'bg-blue-500'}`}></span>
                                                <span className="capitalize">{item.jenisGraduasi}</span>
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-[#617589] dark:text-gray-300">
                                            {item.tanggalGraduasi ? new Date(item.tanggalGraduasi).toLocaleDateString('id-ID') : '-'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-[#617589] dark:text-gray-400 max-w-xs truncate" title={item.alasanGraduasi}>
                                            {item.alasanGraduasi}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button
                                                    className="p-2 text-[#617589] hover:text-primary transition-colors"
                                                    onClick={() => {
                                                        setEditingItem(item);
                                                        setIsModalOpen(true);
                                                    }}
                                                >
                                                    <span className="material-symbols-outlined text-[20px]">edit</span>
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

            <InputGraduasiModal
                isOpen={isModalOpen}
                onClose={() => {
                    setIsModalOpen(false);
                    setEditingItem(null);
                }}
                kelompokId={kelompokId!}
                kelompokNama={kelompok?.namaKelompok || kelompok?.nama}
                initialData={editingItem}
                onSuccess={fetchData}
            />
        </div>
    );
};

export default GraduasiDetail;
