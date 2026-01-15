import { useState, useEffect, useCallback } from 'react';
import TambahKelompokModal from '../components/Absensi/TambahKelompokModal';
import { kelompokService } from '../services/kelompok.service';
import { absensiService } from '../services/absensi.service';
import { Link } from 'react-router-dom';
import { exportToCSV } from '../lib/exportUtils';

const Absensi = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [kelompoks, setKelompoks] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [tanggal, setTanggal] = useState(new Date().toISOString().slice(0, 7)); // YYYY-MM

    const fetchKelompoks = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const resp = await kelompokService.getAll({ q: searchTerm, date: tanggal });
            setKelompoks(resp.data);
        } catch (err: any) {
            setError(err.message || 'Gagal mengambil data kelompok');
        } finally {
            setIsLoading(false);
        }
    }, [searchTerm, tanggal]);

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            fetchKelompoks();
        }, 500);
        return () => clearTimeout(timeoutId);
    }, [fetchKelompoks]);

    const handleExportKelompok = async (kelompok: any) => {
        try {
            const resp = await absensiService.getByKelompok(kelompok.id, { date: tanggal });
            const attendanceData = resp.data;

            if (!attendanceData || !attendanceData.details || attendanceData.details.length === 0) {
                const monthName = new Date(tanggal).toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });
                alert(`Data absensi untuk ${kelompok.namaKelompok || kelompok.nama} pada bulan ${monthName} tidak ditemukan.`);
                return;
            }

            const monthLabel = new Date(tanggal).toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });
            const exportData = attendanceData.details.map((d: any) => ({
                'Nama Kelompok': kelompok.namaKelompok || kelompok.nama,
                'Periode Absensi': monthLabel,
                'Tanggal Pertemuan': attendanceData.tanggal,
                'Nama Lengkap KPM': d.kpm?.namaLengkap || 'N/A',
                'Status Kehadiran': d.status.charAt(0).toUpperCase() + d.status.slice(1),
                'Keterangan': d.keterangan || '-'
            }));

            const safeMonthName = monthLabel.replace(/\s+/g, '_');
            exportToCSV(exportData, `Absensi_${kelompok.namaKelompok || kelompok.nama}_${safeMonthName}`);
        } catch (err: any) {
            console.error('Export failed:', err);
            alert('Gagal mengambil data absensi untuk diekspor.');
        }
    };

    return (
        <div className="mx-auto max-w-6xl flex flex-col gap-6">
            {/* Breadcrumbs & Heading */}
            <div className="flex flex-col gap-4">
                <div className="flex flex-wrap gap-2 items-center text-sm">
                    <Link className="text-[#617589] dark:text-slate-400 font-medium hover:text-primary transition-colors" to="/dashboard">Dashboard</Link>
                    <span className="text-[#617589] dark:text-slate-500 font-medium">/</span>
                    <span className="text-primary font-medium">Absensi</span>
                </div>
                <div className="flex flex-wrap justify-between items-end gap-4">
                    <div className="flex flex-col gap-2">
                        <h1 className="text-[#111418] dark:text-white text-3xl md:text-4xl font-black leading-tight tracking-tight">Absensi KPM</h1>
                        <p className="text-[#617589] dark:text-slate-400 text-base font-normal leading-normal max-w-2xl">
                            Pilih kelompok di bawah ini untuk memulai pencatatan kehadiran pertemuan bulanan (P2K2).
                        </p>
                    </div>
                </div>
            </div>
            {/* Search & Filter Bar */}
            <div className="bg-white dark:bg-[#1a202c] p-4 rounded-xl border border-[#f0f2f4] dark:border-[#2a3441] shadow-sm flex flex-col md:flex-row gap-4 items-center">
                <div className="relative flex-1 w-full">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <span className="material-symbols-outlined text-[#617589] dark:text-slate-500">search</span>
                    </div>
                    <input
                        className="block w-full pl-10 pr-3 py-2.5 border-none rounded-lg bg-[#f6f7f8] dark:bg-[#101922] text-[#111418] dark:text-white placeholder-[#617589] focus:ring-2 focus:ring-primary focus:bg-white dark:focus:bg-[#1a202c] transition-all"
                        placeholder="Cari nama kelompok atau lokasi..."
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
                    <span className="text-sm font-bold text-slate-500 dark:text-slate-400 whitespace-nowrap">Periode:</span>
                    <div className="flex gap-2 flex-1 md:flex-none">
                        <select
                            className="h-10 rounded-lg border border-[#dbe0e6] dark:border-[#2a3441] bg-white dark:bg-[#101922] px-3 py-2 text-sm text-[#111418] dark:text-white focus:border-primary focus:ring-primary outline-none cursor-pointer"
                            value={tanggal.split('-')[1]}
                            onChange={(e) => setTanggal(`${tanggal.split('-')[0]}-${e.target.value}`)}
                        >
                            <option value="01">Januari</option>
                            <option value="02">Februari</option>
                            <option value="03">Maret</option>
                            <option value="04">April</option>
                            <option value="05">Mei</option>
                            <option value="06">Juni</option>
                            <option value="07">Juli</option>
                            <option value="08">Agustus</option>
                            <option value="09">September</option>
                            <option value="10">Oktober</option>
                            <option value="11">November</option>
                            <option value="12">Desember</option>
                        </select>
                        <select
                            className="h-10 rounded-lg border border-[#dbe0e6] dark:border-[#2a3441] bg-white dark:bg-[#101922] px-3 py-2 text-sm text-[#111418] dark:text-white focus:border-primary focus:ring-primary outline-none cursor-pointer"
                            value={tanggal.split('-')[0]}
                            onChange={(e) => setTanggal(`${e.target.value}-${tanggal.split('-')[1]}`)}
                        >
                            <option value="2026">2026</option>
                            <option value="2025">2025</option>
                            <option value="2024">2024</option>
                            <option value="2023">2023</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Groups Grid */}
            {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3].map((n) => (
                        <div key={n} className="h-64 rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse"></div>
                    ))}
                </div>
            ) : error ? (
                <div className="p-8 text-center bg-red-50 text-red-600 rounded-xl border border-red-100">
                    <p className="font-bold">Terjadi Kesalahan</p>
                    <p>{error}</p>
                    <button onClick={fetchKelompoks} className="mt-4 text-primary font-bold hover:underline">Coba Lagi</button>
                </div>
            ) : kelompoks.length === 0 ? (
                <div className="p-12 text-center bg-white dark:bg-[#1a202c] rounded-xl border border-dashed border-slate-300 dark:border-slate-700">
                    <p className="text-slate-500">Tidak ada kelompok yang ditemukan.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {kelompoks.map((kelompok) => (
                        <div key={kelompok.id} className="group bg-white dark:bg-[#1a202c] rounded-xl border border-[#f0f2f4] dark:border-[#2a3441] shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden flex flex-col">
                            <div className={`relative h-24 bg-gradient-to-r ${kelompok.isAbsenThisMonth ? 'from-green-500 to-emerald-600' : 'from-blue-500 to-indigo-600'}`}>
                                <div className="absolute top-3 right-3">
                                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold backdrop-blur-md border ${kelompok.isAbsenThisMonth
                                        ? "bg-green-500/30 text-white border-green-500/50"
                                        : "bg-white/20 text-white border-white/30"
                                        }`}>
                                        <span className={`size-2 rounded-full ${kelompok.isAbsenThisMonth ? "bg-green-400" : "bg-yellow-400 animate-pulse"
                                            }`}></span>
                                        {kelompok.isAbsenThisMonth ? 'Sudah Absen' : 'Belum Absen'}
                                    </span>
                                </div>
                            </div>
                            <div className="p-5 flex flex-col flex-1 gap-4">
                                <div>
                                    <h3 className="text-lg font-bold text-[#111418] dark:text-white group-hover:text-primary transition-colors">{kelompok.namaKelompok || kelompok.nama}</h3>
                                    <div className="flex items-center gap-1 mt-1 text-[#617589] dark:text-slate-400 text-sm">
                                        <span className="material-symbols-outlined text-[18px]">location_on</span>
                                        <span>{kelompok.desa}, {kelompok.kecamatan}</span>
                                    </div>
                                </div>
                                <div className="py-3 border-y border-dashed border-slate-200 dark:border-slate-700">
                                    <div className="flex flex-col">
                                        <span className="text-xs text-[#617589] dark:text-slate-500 font-medium uppercase tracking-wider">Anggota Kelompok</span>
                                        <div className="flex items-center gap-1.5 mt-1">
                                            <span className="material-symbols-outlined text-primary text-[20px]">groups</span>
                                            <span className="text-[#111418] dark:text-white font-bold">{kelompok.kpmCount || 0} KPM</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="mt-auto flex gap-2">
                                    <Link
                                        to={`/absensi/form?kelompokId=${kelompok.id}&tanggal=${tanggal}`}
                                        className="flex-1 bg-primary hover:bg-blue-600 text-white font-bold py-2.5 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
                                    >
                                        <span className="material-symbols-outlined text-[20px]">edit_square</span>
                                        Mulai Absensi
                                    </Link>
                                    <button
                                        onClick={() => handleExportKelompok(kelompok)}
                                        className="h-[44px] w-[44px] shrink-0 bg-green-50 hover:bg-green-100 text-green-600 dark:bg-green-900/20 dark:hover:bg-green-900/30 dark:text-green-400 rounded-lg transition-colors flex items-center justify-center group/btn"
                                        title="Export Absensi CSV"
                                    >
                                        <span className="material-symbols-outlined text-[22px] group-hover/btn:scale-110 transition-transform">file_download</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <TambahKelompokModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSuccess={fetchKelompoks} />
        </div>
    );
};

export default Absensi;
