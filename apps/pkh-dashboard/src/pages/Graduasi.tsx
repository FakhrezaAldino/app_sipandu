import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { kelompokService } from '../services/kelompok.service';

const Graduasi = () => {
    const [kelompokList, setKelompokList] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);

    const fetchData = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await kelompokService.getAll({
                page: currentPage,
                limit: 6,
                q: searchTerm
            });
            setKelompokList(response.data);
            setTotalPages(response.meta.totalPages);
            setTotalItems(response.meta.totalItems);
        } catch (err: any) {
            setError(err.message || 'Gagal mengambil data kelompok');
        } finally {
            setIsLoading(false);
        }
    }, [currentPage, searchTerm]);

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchData();
        }, 300);
        return () => clearTimeout(timer);
    }, [fetchData]);

    return (
        <div className="mx-auto w-full max-w-[1200px] flex flex-col gap-6">
            <div className="flex flex-wrap items-center gap-2 text-sm">
                <Link className="text-[#617589] dark:text-gray-400 hover:text-primary dark:hover:text-primary transition-colors font-medium" to="/dashboard">Home</Link>
                <span className="material-symbols-outlined text-[16px] text-[#617589] dark:text-gray-400">chevron_right</span>
                <span className="text-[#111418] dark:text-white font-semibold">Pilih Kelompok (Graduasi)</span>
            </div>

            <div className="flex flex-col gap-4 max-w-2xl">
                <h1 className="text-3xl md:text-4xl font-black leading-tight tracking-tight text-[#111418] dark:text-white">
                    Pilih Kelompok Binaan
                </h1>
                <p className="text-[#617589] dark:text-gray-400 text-base font-normal">
                    Silakan pilih kelompok binaan untuk melihat dan mengelola data graduasi anggota dalam kelompok tersebut.
                </p>
            </div>

            <div className="relative w-full md:w-96">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#617589] dark:text-gray-400">
                    <span className="material-symbols-outlined">search</span>
                </span>
                <input
                    className="w-full h-12 pl-12 pr-4 rounded-xl bg-white dark:bg-[#1a202c] border border-[#dbe0e6] dark:border-[#2a3441] focus:border-primary focus:ring-1 focus:ring-primary text-sm text-[#111418] dark:text-white placeholder:text-[#617589] dark:placeholder:text-gray-400 transition-all shadow-sm"
                    placeholder="Cari nama kelompok..."
                    type="text"
                    value={searchTerm}
                    onChange={(e) => {
                        setSearchTerm(e.target.value);
                        setCurrentPage(1);
                    }}
                />
            </div>

            {error && (
                <div className="p-4 bg-red-50 text-red-600 border border-red-200 rounded-xl text-sm font-medium">
                    {error}
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-2">
                {isLoading ? (
                    [...Array(6)].map((_, i) => (
                        <div key={i} className="h-64 bg-gray-100 dark:bg-gray-800 animate-pulse rounded-xl"></div>
                    ))
                ) : (
                    kelompokList.map((kelompok) => (
                        <div key={kelompok.id} className="group bg-white dark:bg-[#1a202c] rounded-xl shadow-sm border border-[#dbe0e6] dark:border-[#2a3441] overflow-hidden hover:shadow-md transition-all duration-300 hover:border-primary/50">
                            <div className="h-32 bg-gradient-to-r from-blue-500 to-cyan-500 relative">
                                <div className="absolute -bottom-10 left-6">
                                    <div className="size-20 bg-white dark:bg-[#1a202c] rounded-xl p-1 shadow-md flex items-center justify-center">
                                        <div className="w-full h-full bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center text-primary text-2xl font-bold">
                                            {(kelompok.namaKelompok || kelompok.nama).charAt(0)}
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="pt-12 px-6 pb-6 flex flex-col gap-4">
                                <div>
                                    <h3 className="text-xl font-bold text-[#111418] dark:text-white group-hover:text-primary transition-colors">{kelompok.namaKelompok || kelompok.nama}</h3>
                                    <p className="text-sm text-[#617589] dark:text-gray-400 mt-1">Desa {kelompok.desa}</p>
                                </div>
                                <div className="flex items-center gap-4 text-sm text-[#617589] dark:text-gray-400 border-t border-[#dbe0e6] dark:border-[#2a3441] pt-4">
                                    <div className="flex items-center gap-1.5">
                                        <span className="material-symbols-outlined text-[18px]">person</span>
                                        <span>{kelompok.kpmCount || 0} Anggota</span>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <span className="material-symbols-outlined text-[18px] text-blue-500">school</span>
                                        <span>{kelompok.graduasiCount || 0} Graduasi</span>
                                    </div>
                                </div>
                                <Link to={`/graduasi/${kelompok.id}`} className="w-full mt-2 h-10 flex items-center justify-center gap-2 rounded-lg bg-primary/10 hover:bg-primary text-primary hover:text-white font-semibold text-sm transition-all duration-200 cursor-pointer">
                                    <span>Lihat Data Graduasi</span>
                                    <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                                </Link>
                            </div>
                        </div>
                    ))
                )}
                {!isLoading && kelompokList.length === 0 && (
                    <div className="col-span-full py-12 text-center text-[#617589]">
                        Tidak ada kelompok ditemukan.
                    </div>
                )}
            </div>

            <div className="mt-4 flex items-center justify-between border-t border-[#dbe0e6] dark:border-[#2a3441] pt-4">
                <p className="text-sm text-[#617589] dark:text-gray-400">
                    Menampilkan {totalItems === 0 ? 0 : (currentPage - 1) * 6 + 1}-{Math.min(currentPage * 6, totalItems)} dari {totalItems} Kelompok
                </p>
                <div className="flex gap-2">
                    <button
                        className="px-4 py-2 text-sm font-medium rounded-lg border border-[#dbe0e6] dark:border-[#2a3441] bg-white dark:bg-[#1a202c] text-[#617589] dark:text-gray-400 hover:bg-[#f6f7f8] dark:hover:bg-[#101922] disabled:opacity-50 cursor-pointer"
                        disabled={currentPage === 1 || isLoading}
                        onClick={() => setCurrentPage(p => p - 1)}
                    >
                        Sebelumnya
                    </button>
                    <button
                        className="px-4 py-2 text-sm font-medium rounded-lg border border-[#dbe0e6] dark:border-[#2a3441] bg-white dark:bg-[#1a202c] text-[#111418] dark:text-white hover:bg-[#f6f7f8] dark:hover:bg-[#101922] disabled:opacity-50 cursor-pointer"
                        disabled={currentPage === totalPages || isLoading}
                        onClick={() => setCurrentPage(p => p + 1)}
                    >
                        Selanjutnya
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Graduasi;
