import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { kelompokService } from '../services/kelompok.service';

const Prestasi = () => {
    const [kelompokList, setKelompokList] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [pagination, setPagination] = useState({ page: 1, limit: 6, total: 0, totalPages: 1 });

    const fetchKelompok = useCallback(async () => {
        setIsLoading(true);
        try {
            const resp = await kelompokService.getAll({
                page: pagination.page,
                limit: pagination.limit,
                q: searchTerm
            });
            setKelompokList(resp.data);
            setPagination(prev => ({ ...prev, total: resp.total, totalPages: resp.totalPages }));
        } catch (error) {
            console.error('Gagal mengambil data kelompok:', error);
        } finally {
            setIsLoading(false);
        }
    }, [pagination.page, pagination.limit, searchTerm]);

    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            fetchKelompok();
        }, 300);
        return () => clearTimeout(delayDebounceFn);
    }, [fetchKelompok]);

    return (
        <div className="mx-auto w-full max-w-[1200px] flex flex-col gap-6">
            {/* Breadcrumbs & Header */}
            <div className="flex flex-wrap items-center gap-2 text-sm">
                <Link className="text-[#617589] dark:text-gray-400 hover:text-primary transition-colors font-medium flex items-center gap-1" to="/dashboard">
                    <span className="material-symbols-outlined text-[18px]">home</span>
                    Dashboard
                </Link>
                <span className="material-symbols-outlined text-[16px] text-[#617589]">chevron_right</span>
                <span className="text-[#111418] dark:text-white font-semibold">Pilih Kelompok (Prestasi)</span>
            </div>

            <div className="flex flex-col gap-4 max-w-2xl">
                <h1 className="text-3xl md:text-4xl font-black leading-tight tracking-tight text-[#111418] dark:text-white">
                    Pilih Kelompok Binaan
                </h1>
                <p className="text-[#617589] dark:text-gray-400 text-base">
                    Silakan pilih kelompok binaan untuk melihat dan mengelola data prestasi anak-anak dalam kelompok tersebut.
                </p>
            </div>

            {/* Search Bar */}
            <div className="relative w-full md:w-96">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#617589]">
                    <span className="material-symbols-outlined">search</span>
                </span>
                <input
                    className="w-full h-12 pl-12 pr-4 rounded-xl bg-white dark:bg-[#1a202c] border border-[#dbe0e6] dark:border-[#2a3441] focus:border-primary focus:ring-1 focus:ring-primary text-sm text-[#111418] dark:text-white transition-all shadow-sm"
                    placeholder="Cari nama kelompok..."
                    type="text"
                    value={searchTerm}
                    onChange={(e) => {
                        setSearchTerm(e.target.value);
                        setPagination(p => ({ ...p, page: 1 }));
                    }}
                />
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-2">
                {isLoading ? (
                    Array(3).fill(0).map((_, i) => (
                        <div key={i} className="h-64 rounded-xl bg-gray-100 dark:bg-gray-800 animate-pulse"></div>
                    ))
                ) : kelompokList.length === 0 ? (
                    <div className="col-span-full py-12 text-center text-[#617589]">Tidak ada kelompok ditemukan.</div>
                ) : (
                    kelompokList.map((kelompok) => (
                        <div key={kelompok.id} className="group bg-white dark:bg-[#1a202c] rounded-xl shadow-sm border border-[#dbe0e6] dark:border-[#2a3441] overflow-hidden hover:shadow-md transition-all duration-300 hover:border-primary/50 flex flex-col">
                            <div className="h-24 bg-gradient-to-r from-blue-500 to-cyan-500 relative">
                                <div className="absolute -bottom-8 left-6">
                                    <div className="size-16 bg-white dark:bg-[#1a202c] rounded-xl p-1 shadow-md flex items-center justify-center">
                                        <div className="w-full h-full bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center text-primary text-xl font-bold">
                                            {(kelompok.namaKelompok || kelompok.nama).charAt(0)}
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="pt-10 px-6 pb-6 flex flex-col gap-4 flex-1">
                                <div>
                                    <h3 className="text-xl font-bold text-[#111418] dark:text-white group-hover:text-primary transition-colors">{kelompok.namaKelompok || kelompok.nama}</h3>
                                    <p className="text-sm text-[#617589] dark:text-gray-400 mt-1">{kelompok.desa}, {kelompok.kecamatan}</p>
                                </div>
                                <div className="mt-auto flex items-center gap-4 text-sm text-[#617589] dark:text-gray-400 border-t border-[#dbe0e6] dark:border-[#2a3441] pt-4">
                                    <div className="flex items-center gap-1.5 font-medium">
                                        <span className="material-symbols-outlined text-[18px]">person</span>
                                        <span>{kelompok.kpmCount || 0} KPM</span>
                                    </div>
                                    <div className="flex items-center gap-1.5 font-medium">
                                        <span className="material-symbols-outlined text-[18px] text-yellow-500">emoji_events</span>
                                        <span>{kelompok.prestasiCount || 0} Prestasi</span>
                                    </div>
                                </div>
                                <Link to={`/prestasi/${kelompok.id}`} className="w-full mt-2 h-10 flex items-center justify-center gap-2 rounded-lg bg-primary/10 hover:bg-primary text-primary hover:text-white font-semibold text-sm transition-all duration-200">
                                    <span>Lihat Data Prestasi</span>
                                    <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                                </Link>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Pagination Box */}
            <div className="mt-4 flex items-center justify-between border-t border-[#dbe0e6] dark:border-[#2a3441] pt-4">
                <p className="text-sm text-[#617589] dark:text-gray-400">
                    Menampilkan {(pagination.page - 1) * pagination.limit + 1}-
                    {Math.min(pagination.page * pagination.limit, pagination.total)} dari {pagination.total} Kelompok
                </p>
                <div className="flex gap-2">
                    <button
                        className="px-4 py-2 text-sm font-medium rounded-lg border border-[#dbe0e6] dark:border-[#2a3441] bg-white dark:bg-[#1a202c] text-[#617589] hover:bg-[#f3f4f6] disabled:opacity-50"
                        disabled={pagination.page === 1}
                        onClick={() => setPagination(p => ({ ...p, page: p.page - 1 }))}
                    >
                        Sebelumnya
                    </button>
                    <button
                        className="px-4 py-2 text-sm font-medium rounded-lg border border-[#dbe0e6] dark:border-[#2a3441] bg-white dark:bg-[#1a202c] text-[#111418] dark:text-white hover:bg-[#f3f4f6] disabled:opacity-50"
                        disabled={pagination.page >= pagination.totalPages}
                        onClick={() => setPagination(p => ({ ...p, page: p.page + 1 }))}
                    >
                        Selanjutnya
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Prestasi;
