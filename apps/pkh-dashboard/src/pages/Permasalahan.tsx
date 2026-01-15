import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { kelompokService } from '../services/kelompok.service';

const Permasalahan = () => {
    const [kelompokList, setKelompokList] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [page, setPage] = useState(1);
    const [limit] = useState(6);
    const [total, setTotal] = useState(0);

    const fetchKelompok = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await kelompokService.getAll({
                page,
                limit,
                q: searchTerm
            });
            setKelompokList(response.data);
            setTotal(response.meta.total);
        } catch (err: any) {
            setError(err.message || 'Gagal mengambil data kelompok');
        } finally {
            setIsLoading(false);
        }
    }, [page, limit, searchTerm]);

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchKelompok();
        }, 300);
        return () => clearTimeout(timer);
    }, [fetchKelompok]);

    const totalPages = Math.ceil(total / limit);

    return (
        <div className="mx-auto w-full max-w-[1200px] flex flex-col gap-6">
            {/* Header Section */}
            <div className="flex flex-col gap-4">
                <div className="flex flex-wrap items-center gap-2 text-sm">
                    <Link className="text-[#617589] dark:text-gray-400 hover:text-primary transition-colors font-medium" to="/dashboard">Home</Link>
                    <span className="material-symbols-outlined text-[16px] text-[#617589]">chevron_right</span>
                    <span className="text-primary dark:text-white font-bold">Pilih Kelompok (Permasalahan)</span>
                </div>
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                    <div className="flex flex-col gap-2">
                        <h2 className="text-[#111418] dark:text-white text-3xl font-bold tracking-tight">Data Permasalahan KPM</h2>
                        <p className="text-[#617589] dark:text-gray-400 text-base">
                            Pilih kelompok untuk mengelola dan memantau permasalahan yang dihadapi anggota KPM.
                        </p>
                    </div>
                </div>
            </div>

            {/* Filters & Actions */}
            <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between bg-white dark:bg-[#1a202c] p-4 rounded-xl border border-[#dbe0e6] dark:border-[#2a3441] shadow-sm">
                <div className="w-full lg:max-w-md">
                    <div className="flex items-center w-full h-11 rounded-lg bg-[#f6f7f8] dark:bg-gray-800 border border-transparent focus-within:border-primary transition-all overflow-hidden px-3 gap-2">
                        <span className="material-symbols-outlined text-[#617589]">search</span>
                        <input
                            className="w-full h-full bg-transparent border-none text-[#111418] dark:text-white placeholder:text-[#617589] focus:ring-0 text-sm"
                            placeholder="Cari nama kelompok atau desa..."
                            value={searchTerm}
                            onChange={(e) => {
                                setSearchTerm(e.target.value);
                                setPage(1);
                            }}
                        />
                    </div>
                </div>
                <div className="flex items-center gap-2 text-sm text-[#617589]">
                    <span>Total: {total} Kelompok</span>
                </div>
            </div>

            {error && (
                <div className="p-4 bg-red-50 text-red-600 border border-red-200 rounded-lg text-sm font-medium">
                    {error}
                </div>
            )}

            {/* Grid Content */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {isLoading ? (
                    [...Array(6)].map((_, i) => (
                        <div key={i} className="h-[280px] bg-white dark:bg-gray-800 rounded-xl animate-pulse border border-[#dbe0e6] dark:border-gray-700"></div>
                    ))
                ) : kelompokList.length === 0 ? (
                    <div className="col-span-full py-12 text-center text-[#617589]">
                        Tidak ada kelompok ditemukan.
                    </div>
                ) : (
                    kelompokList.map((item) => (
                        <div key={item.id} className="flex flex-col bg-white dark:bg-[#1a202c] rounded-xl border border-[#dbe0e6] dark:border-[#2a3441] shadow-sm hover:shadow-md transition-all duration-300 group overflow-hidden">
                            <div className="p-6 flex flex-col gap-4">
                                <div className="flex items-start justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-lg uppercase">
                                            {(item.namaKelompok || item.nama).substring(0, 2)}
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-bold text-[#111418] dark:text-white group-hover:text-primary transition-colors">{item.namaKelompok || item.nama}</h3>
                                            <p className="text-sm text-[#617589] dark:text-gray-400 capitalize">{item.desa}</p>
                                        </div>
                                    </div>
                                    {item.permasalahanCount > 0 && (
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400 animate-pulse">
                                            {item.permasalahanCount} Masalah
                                        </span>
                                    )}
                                </div>
                                <div className="grid grid-cols-2 gap-4 py-4 border-y border-[#f3f4f6] dark:border-gray-700">
                                    <div className="flex flex-col">
                                        <span className="text-[11px] uppercase tracking-wider text-[#617589] dark:text-gray-400">Total KPM</span>
                                        <span className="text-sm font-bold text-[#111418] dark:text-white">{item.kpmCount || 0} Orang</span>
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-[11px] uppercase tracking-wider text-[#617589] dark:text-gray-400">Kecamatan</span>
                                        <span className="text-sm font-medium text-[#111418] dark:text-white capitalize">{item.kecamatan}</span>
                                    </div>
                                </div>
                                <Link
                                    to={`/permasalahan/${item.id}`}
                                    className="w-full py-2.5 px-4 rounded-lg bg-primary text-white text-sm font-bold hover:bg-blue-600 transition-all flex items-center justify-center gap-2 group/btn shadow-sm"
                                >
                                    Lihat Data Permasalahan
                                    <span className="material-symbols-outlined text-[18px] group-hover/btn:translate-x-1 transition-transform">arrow_forward</span>
                                </Link>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex items-center justify-center py-6">
                    <nav className="flex gap-2">
                        <button
                            disabled={page === 1}
                            onClick={() => setPage(page - 1)}
                            className="w-10 h-10 flex items-center justify-center rounded-lg bg-white dark:bg-[#1a202c] border border-[#dbe0e6] dark:border-[#2a3441] text-[#617589] disabled:opacity-50 hover:bg-gray-50 transition-colors"
                        >
                            <span className="material-symbols-outlined text-[20px]">chevron_left</span>
                        </button>
                        {[...Array(totalPages)].map((_, i) => (
                            <button
                                key={i + 1}
                                onClick={() => setPage(i + 1)}
                                className={`w-10 h-10 flex items-center justify-center rounded-lg font-bold text-sm transition-all ${page === i + 1
                                    ? 'bg-primary text-white shadow-md shadow-primary/20'
                                    : 'bg-white dark:bg-[#1a202c] border border-[#dbe0e6] dark:border-[#2a3441] text-[#111418] dark:text-white hover:bg-gray-50'
                                    }`}
                            >
                                {i + 1}
                            </button>
                        ))}
                        <button
                            disabled={page === totalPages}
                            onClick={() => setPage(page + 1)}
                            className="w-10 h-10 flex items-center justify-center rounded-lg bg-white dark:bg-[#1a202c] border border-[#dbe0e6] dark:border-[#2a3441] text-[#617589] disabled:opacity-50 hover:bg-gray-50 transition-colors"
                        >
                            <span className="material-symbols-outlined text-[20px]">chevron_right</span>
                        </button>
                    </nav>
                </div>
            )}
        </div>
    );
};

export default Permasalahan;
