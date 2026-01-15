import { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { kelompokService } from '../services/kelompok.service';
import { inputDataService } from '../services/inputData.service';
import { exportToCSV } from '../lib/exportUtils';
import InputPrestasiModal from '../components/Prestasi/InputPrestasiModal';
import EditPrestasiModal from '../components/Prestasi/EditPrestasiModal';

const PrestasiDetail = () => {
    const { id: kelompokId } = useParams<{ id: string }>();
    const [isInputModalOpen, setIsInputModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedPrestasi, setSelectedPrestasi] = useState<any>(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [kelompok, setKelompok] = useState<any>(null);
    const [prestasiList, setPrestasiList] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');

    const fetchData = useCallback(async () => {
        if (!kelompokId) return;
        setIsLoading(true);
        setError(null);
        try {
            const [kelompokResp, prestasiResp] = await Promise.all([
                kelompokService.getById(kelompokId),
                inputDataService.prestasi.getByKelompok(kelompokId)
            ]);
            setKelompok(kelompokResp);
            setPrestasiList(prestasiResp.data || prestasiResp);
        } catch (err: any) {
            setError(err.message || 'Gagal mengambil data');
        } finally {
            setIsLoading(false);
        }
    }, [kelompokId]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const filteredPrestasi = prestasiList.filter(p =>
        (p.kpm?.namaLengkap || p.kpm?.nama)?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.namaPrestasi?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleEdit = (prestasi: any) => {
        setSelectedPrestasi(prestasi);
        setIsEditModalOpen(true);
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm('Apakah Anda yakin ingin menghapus data prestasi ini?')) return;

        setIsDeleting(true);
        try {
            await inputDataService.prestasi.delete(id);
            fetchData();
        } catch (err: any) {
            setError(err.message || 'Gagal menghapus data prestasi');
        } finally {
            setIsDeleting(false);
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
        <div className="mx-auto w-full max-w-[1200px] flex flex-col gap-6">
            {/* Breadcrumbs */}
            <div className="flex flex-wrap items-center gap-2 text-sm">
                <Link className="text-[#617589] dark:text-gray-400 hover:text-primary transition-colors font-medium flex items-center gap-1" to="/dashboard">
                    <span className="material-symbols-outlined text-[18px]">home</span>
                    Dashboard
                </Link>
                <span className="material-symbols-outlined text-[16px] text-[#617589]">chevron_right</span>
                <Link className="text-[#617589] dark:text-gray-400 hover:text-primary transition-colors font-medium" to="/prestasi">Pilih Kelompok</Link>
                <span className="material-symbols-outlined text-[16px] text-[#617589]">chevron_right</span>
                <span className="text-primary dark:text-white font-bold">{kelompok?.namaKelompok || kelompok?.nama || 'Loading...'} - Prestasi</span>
            </div>

            {/* Header & Actions */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-[#e5e7eb] dark:border-gray-700 pb-6">
                <div className="flex flex-col gap-2 max-w-2xl">
                    <h1 className="text-3xl md:text-4xl font-black leading-tight tracking-tight text-[#111418] dark:text-white">
                        Data Prestasi - {kelompok?.namaKelompok || kelompok?.nama}
                    </h1>
                    <p className="text-[#617589] dark:text-gray-400 text-base">
                        Kelola dan pantau data prestasi akademik dan non-akademik anak binaan di {kelompok?.desa}.
                    </p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                    <button
                        onClick={() => {
                            const exportData = prestasiList.map(item => ({
                                'Nama KPM': item.kpm?.namaLengkap || item.kpm?.nama,
                                'Nama Anak': item.namaAnak || '-',
                                'NIK': `'${item.kpm?.nik}`,
                                'Nama Prestasi': item.namaPrestasi,
                                'Jenis Prestasi': item.jenisPrestasi || 'Lainnya',
                                'Tingkat': item.tingkat || 'Lainnya',
                                'Tanggal Input': new Date(item.createdAt).toLocaleDateString('id-ID')
                            }));
                            exportToCSV(exportData, `Data_Prestasi_${kelompok?.namaKelompok || 'Kelompok'}`);
                        }}
                        className="flex items-center justify-center gap-2 h-11 px-5 rounded-lg border border-[#dbe0e6] dark:border-gray-600 bg-white dark:bg-[#1a202c] hover:bg-gray-50 text-[#111418] dark:text-white text-sm font-bold transition-all shadow-sm cursor-pointer"
                    >
                        <span className="material-symbols-outlined text-green-600">file_download</span>
                        <span>Export CSV</span>
                    </button>
                    <button onClick={() => setIsInputModalOpen(true)} className="flex items-center justify-center gap-2 h-11 px-5 rounded-lg bg-primary hover:bg-blue-600 text-white text-sm font-bold shadow-md transition-all">
                        <span className="material-symbols-outlined">add</span>
                        <span>Input Prestasi</span>
                    </button>
                </div>
            </div>

            {error && (
                <div className="p-4 bg-red-50 text-red-600 border border-red-200 rounded-lg text-sm font-medium">
                    {error}
                </div>
            )}

            {/* Filters & Search */}
            <div className="bg-white dark:bg-[#1a202c] p-4 rounded-xl shadow-sm border border-[#dbe0e6] dark:border-[#2a3441] flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#617589]">
                        <span className="material-symbols-outlined">search</span>
                    </span>
                    <input
                        className="w-full h-11 pl-11 pr-4 rounded-lg bg-[#f6f7f8] dark:bg-gray-800 border-transparent focus:border-primary focus:ring-1 focus:ring-primary text-sm text-[#111418] dark:text-white placeholder:text-[#617589] transition-all"
                        placeholder="Cari nama anak atau judul prestasi..."
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {/* Data Table Card */}
            <div className="bg-white dark:bg-[#1a202c] rounded-xl shadow-sm border border-[#dbe0e6] dark:border-[#2a3441] overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-[#f6f7f8] dark:bg-gray-800 border-b border-[#dbe0e6] dark:border-gray-700">
                                <th className="p-4 text-xs uppercase tracking-wider font-bold text-[#617589] w-16 text-center">No</th>
                                <th className="p-4 text-xs uppercase tracking-wider font-bold text-[#617589]">Nama Anak</th>
                                <th className="p-4 text-xs uppercase tracking-wider font-bold text-[#617589]">Nama KPM / Orang Tua</th>
                                <th className="p-4 text-xs uppercase tracking-wider font-bold text-[#617589]">Judul Prestasi</th>
                                <th className="p-4 text-xs uppercase tracking-wider font-bold text-[#617589]">Kategori</th>
                                <th className="p-4 text-xs uppercase tracking-wider font-bold text-[#617589]">Tingkat</th>
                                <th className="p-4 text-xs uppercase tracking-wider font-bold text-[#617589]">Tgl Input</th>
                                <th className="p-4 text-xs uppercase tracking-wider font-bold text-[#617589] text-right">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#dbe0e6] dark:divide-gray-700">
                            {filteredPrestasi.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="p-8 text-center text-[#617589]">Tidak ada data prestasi ditemukan.</td>
                                </tr>
                            ) : (
                                filteredPrestasi.map((item, index) => (
                                    <tr key={item.id} className="group hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                                        <td className="p-4 text-center font-medium text-[#617589]">{index + 1}</td>
                                        <td className="p-4">
                                            <div className="flex items-center gap-3">
                                                <div className="size-8 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-300 flex items-center justify-center font-bold text-xs uppercase">
                                                    {(item.namaAnak || 'Anak')?.substring(0, 2)}
                                                </div>
                                                <div className="font-bold text-[#111418] dark:text-white capitalize">
                                                    {item.namaAnak || '-'}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <div className="flex items-center gap-3">
                                                <div className="size-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs uppercase">
                                                    {(item.kpm?.namaLengkap || item.kpm?.nama)?.substring(0, 2)}
                                                </div>
                                                <div>
                                                    <div className="font-bold text-[#111418] dark:text-white capitalize text-sm">{item.kpm?.namaLengkap || item.kpm?.nama}</div>
                                                    <div className="text-xs text-[#617589]">{item.kpm?.nik}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-4 text-[#111418] dark:text-white font-medium">{item.namaPrestasi}</td>
                                        <td className="p-4">
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300">
                                                {item.jenisPrestasi || 'Lainnya'}
                                            </span>
                                        </td>
                                        <td className="p-4">
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300">
                                                {item.tingkat || 'Lainnya'}
                                            </span>
                                        </td>
                                        <td className="p-4 text-[#617589] text-sm">{new Date(item.createdAt).toLocaleDateString('id-ID')}</td>
                                        <td className="p-4 text-right">
                                            <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button
                                                    onClick={() => handleEdit(item)}
                                                    className="p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 text-[#617589] hover:text-primary transition-colors"
                                                    title="Edit"
                                                >
                                                    <span className="material-symbols-outlined text-[20px]">edit</span>
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(item.id)}
                                                    disabled={isDeleting}
                                                    className="p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 text-[#617589] hover:text-red-500 transition-colors disabled:opacity-50"
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

            <InputPrestasiModal
                isOpen={isInputModalOpen}
                onClose={() => setIsInputModalOpen(false)}
                kelompokId={kelompokId!}
                kelompokNama={kelompok?.namaKelompok || kelompok?.nama}
                onSuccess={fetchData}
            />

            <EditPrestasiModal
                isOpen={isEditModalOpen}
                onClose={() => {
                    setIsEditModalOpen(false);
                    setSelectedPrestasi(null);
                }}
                prestasi={selectedPrestasi}
                onSuccess={fetchData}
            />
        </div>
    );
};

export default PrestasiDetail;
