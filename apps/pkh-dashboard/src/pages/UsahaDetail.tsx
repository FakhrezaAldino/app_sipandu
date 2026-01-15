import { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { kelompokService } from '../services/kelompok.service';
import { inputDataService } from '../services/inputData.service';
import { exportToCSV } from '../lib/exportUtils';
import InputUsahaModal from '../components/Usaha/InputUsahaModal';

const UsahaDetail = () => {
    const { id: kelompokId } = useParams<{ id: string }>();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editData, setEditData] = useState<any>(null);
    const [kelompok, setKelompok] = useState<any>(null);
    const [usahaList, setUsahaList] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');

    const fetchData = useCallback(async () => {
        if (!kelompokId) return;
        setIsLoading(true);
        setError(null);
        try {
            const [kelompokResp, usahaResp] = await Promise.all([
                kelompokService.getById(kelompokId),
                inputDataService.usaha.getByKelompok(kelompokId)
            ]);
            setKelompok(kelompokResp);
            setUsahaList(usahaResp.data || usahaResp);
        } catch (err: any) {
            setError(err.message || 'Gagal mengambil data');
        } finally {
            setIsLoading(false);
        }
    }, [kelompokId]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleEdit = (usaha: any) => {
        setEditData(usaha);
        setIsModalOpen(true);
    };

    const handleDelete = async (id: string, name: string) => {
        if (window.confirm(`Apakah Anda yakin ingin menghapus data usaha "${name}"?`)) {
            try {
                await inputDataService.usaha.delete(id);
                fetchData();
            } catch (err: any) {
                alert(err.message || 'Gagal menghapus data usaha');
            }
        }
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditData(null);
    };

    const filteredUsaha = usahaList.filter(u =>
        (u.kpm?.namaLengkap || u.kpm?.nama)?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.namaUsaha?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.jenisUsaha?.toLowerCase().includes(searchTerm.toLowerCase())
    );

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
                <Link className="text-[#617589] font-medium hover:text-primary flex items-center gap-1" to="/dashboard">
                    <span className="material-symbols-outlined text-[18px]">home</span>
                    Dashboard
                </Link>
                <span className="text-[#617589] font-medium">/</span>
                <Link className="text-[#617589] font-medium hover:text-primary" to="/usaha">Daftar Kelompok</Link>
                <span className="text-[#617589] font-medium">/</span>
                <span className="text-primary font-bold">{kelompok?.namaKelompok || kelompok?.nama || 'Loading...'} - Data Usaha</span>
            </div>

            {/* Page Header & Actions */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b border-[#e5e7eb] dark:border-gray-700 pb-6">
                <div className="flex flex-col gap-2">
                    <h1 className="text-[#111418] dark:text-white text-3xl md:text-4xl font-extrabold tracking-tight">
                        Data Usaha - {kelompok?.namaKelompok || kelompok?.nama}
                    </h1>
                    <p className="text-[#617589] text-base font-normal max-w-2xl">
                        Kelola dan pantau perkembangan usaha anggota kelompok KPM di {kelompok?.desa}.
                    </p>
                </div>
                <div className="flex gap-3 w-full md:w-auto h-11">
                    <button
                        onClick={() => {
                            const exportData = usahaList.map(u => ({
                                'Nama KPM / Pemilik': u.kpm?.namaLengkap || u.kpm?.nama,
                                'NIK': `'${u.kpm?.nik}`,
                                'Nama Usaha': u.namaUsaha,
                                'Jenis Usaha': u.jenisUsaha,
                                'Modal Awal': u.modalAwal ? `Rp ${Number(u.modalAwal).toLocaleString()}` : '-',
                                'Omzet Bulanan': u.omzetBulanan ? `Rp ${Number(u.omzetBulanan).toLocaleString()}` : '-',
                                'Tanggal Input': new Date(u.createdAt).toLocaleDateString('id-ID')
                            }));
                            exportToCSV(exportData, `Data_Usaha_${kelompok?.namaKelompok || 'Kelompok'}`);
                        }}
                        className="flex-1 md:flex-none cursor-pointer flex items-center justify-center rounded-lg px-5 border border-[#dbe0e6] dark:border-gray-600 bg-white dark:bg-[#1e2732] hover:bg-gray-50 dark:hover:bg-gray-700 text-[#111418] dark:text-white text-sm font-bold gap-2 shadow-sm transition-all hover:shadow-md"
                    >
                        <span className="material-symbols-outlined text-[20px] text-green-600">file_download</span>
                        <span className="truncate">Export CSV</span>
                    </button>
                    <button
                        className="flex-1 md:flex-none cursor-pointer flex items-center justify-center rounded-lg px-5 bg-primary hover:bg-blue-600 text-white text-sm font-bold gap-2 shadow-md hover:shadow-lg transition-all"
                        onClick={() => {
                            setEditData(null);
                            setIsModalOpen(true);
                        }}
                    >
                        <span className="material-symbols-outlined text-[20px]">add</span>
                        <span className="truncate">Input Usaha Baru</span>
                    </button>
                </div>
            </div>

            {error && (
                <div className="p-4 bg-red-50 text-red-600 border border-red-200 rounded-lg text-sm font-medium">
                    {error}
                </div>
            )}

            {/* Search & Filters Toolbar */}
            <div className="bg-white dark:bg-[#1e2732] p-4 rounded-xl shadow-sm border border-[#e5e7eb] dark:border-gray-700 flex flex-col md:flex-row justify-between gap-4 items-center">
                <div className="flex w-full md:flex-1 gap-3">
                    <div className="relative w-full md:max-w-md">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <span className="material-symbols-outlined text-[#9ca3af]">search</span>
                        </div>
                        <input
                            className="block w-full pl-10 pr-3 py-2.5 border border-[#dbe0e6] dark:border-gray-600 rounded-lg leading-5 bg-white dark:bg-gray-800 text-[#111418] dark:text-white placeholder-[#9ca3af] focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary sm:text-sm"
                            placeholder="Cari Nama KPM atau Jenis Usaha..."
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            {/* Data Table Card */}
            <div className="bg-white dark:bg-[#1e2732] rounded-xl shadow-sm border border-[#e5e7eb] dark:border-gray-700 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-[#f9fafb] dark:bg-gray-800 border-b border-[#e5e7eb] dark:border-gray-700">
                                <th className="py-4 px-6 text-xs font-bold uppercase tracking-wider text-[#617589] w-16 text-center">No</th>
                                <th className="py-4 px-6 text-xs font-bold uppercase tracking-wider text-[#617589]">Nama KPM / Pemilik</th>
                                <th className="py-4 px-6 text-xs font-bold uppercase tracking-wider text-[#617589]">Nama Usaha</th>
                                <th className="py-4 px-6 text-xs font-bold uppercase tracking-wider text-[#617589]">Jenis Usaha</th>
                                <th className="py-4 px-6 text-xs font-bold uppercase tracking-wider text-[#617589]">Modal Awal</th>
                                <th className="py-4 px-6 text-xs font-bold uppercase tracking-wider text-[#617589]">Omzet</th>
                                <th className="py-4 px-6 text-xs font-bold uppercase tracking-wider text-[#617589]">Tanggal Input</th>
                                <th className="py-4 px-6 text-xs font-bold uppercase tracking-wider text-[#617589] text-right">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#e5e7eb] dark:divide-gray-700">
                            {filteredUsaha.length === 0 ? (
                                <tr>
                                    <td colSpan={8} className="py-8 text-center text-[#617589]">
                                        Tidak ada data usaha ditemukan.
                                    </td>
                                </tr>
                            ) : (
                                filteredUsaha.map((usaha, index) => (
                                    <tr key={usaha.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors group">
                                        <td className="py-4 px-6 text-sm text-[#617589] text-center font-medium">{index + 1}</td>
                                        <td className="py-4 px-6">
                                            <div className="flex items-center gap-3">
                                                <div className="bg-primary/10 text-primary rounded-full size-8 flex items-center justify-center font-bold text-xs shrink-0">
                                                    {(usaha.kpm?.namaLengkap || usaha.kpm?.nama)?.substring(0, 2).toUpperCase()}
                                                </div>
                                                <div className="truncate max-w-[150px]">
                                                    <p className="text-sm font-bold text-[#111418] dark:text-white capitalize truncate">{usaha.kpm?.namaLengkap || usaha.kpm?.nama}</p>
                                                    <p className="text-xs text-[#617589] font-mono">{usaha.kpm?.nik}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-4 px-6">
                                            <span className="text-sm font-bold text-[#111418] dark:text-white capitalize line-clamp-1">{usaha.namaUsaha}</span>
                                        </td>
                                        <td className="py-4 px-6">
                                            <span className="text-sm font-medium text-[#111418] dark:text-white capitalize">{usaha.jenisUsaha}</span>
                                        </td>
                                        <td className="py-4 px-6 text-sm text-[#111418] dark:text-white whitespace-nowrap">
                                            {usaha.modalAwal ? `Rp ${Number(usaha.modalAwal).toLocaleString()} ` : '-'}
                                        </td>
                                        <td className="py-4 px-6 text-sm text-[#111418] dark:text-white whitespace-nowrap">
                                            {usaha.omzetBulanan ? `Rp ${Number(usaha.omzetBulanan).toLocaleString()} ` : '-'}
                                        </td>
                                        <td className="py-4 px-6 text-sm text-[#617589] whitespace-nowrap">
                                            {new Date(usaha.createdAt).toLocaleDateString('id-ID')}
                                        </td>
                                        <td className="py-4 px-6 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => handleEdit(usaha)}
                                                    className="p-1.5 rounded-md hover:bg-primary/10 text-[#617589] hover:text-primary transition-colors cursor-pointer"
                                                    title="Edit"
                                                >
                                                    <span className="material-symbols-outlined text-[20px]">edit</span>
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(usaha.id, usaha.namaUsaha)}
                                                    className="p-1.5 rounded-md hover:bg-red-50 dark:hover:bg-red-900/20 text-[#617589] hover:text-red-500 transition-colors cursor-pointer"
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

            <InputUsahaModal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                kelompokId={kelompokId!}
                kelompokNama={kelompok?.namaKelompok || kelompok?.nama}
                onSuccess={fetchData}
                editData={editData}
            />
        </div>
    );
};

export default UsahaDetail;
