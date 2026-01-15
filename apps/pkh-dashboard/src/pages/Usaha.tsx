


import { useState, useEffect, useCallback } from 'react';
import { kelompokService } from '../services/kelompok.service';
import { Link } from 'react-router-dom';

const Usaha = () => {
    const [kelompoks, setKelompoks] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');

    const fetchKelompoks = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const resp = await kelompokService.getAll({ q: searchTerm });
            setKelompoks(resp.data);
        } catch (err: any) {
            setError(err.message || 'Gagal mengambil data kelompok');
        } finally {
            setIsLoading(false);
        }
    }, [searchTerm]);

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            fetchKelompoks();
        }, 500);
        return () => clearTimeout(timeoutId);
    }, [fetchKelompoks]);

    return (
        <div className="mx-auto w-full max-w-[1200px] flex flex-col gap-6">
            <div className="flex flex-wrap items-center gap-2 text-sm">
                <Link className="text-[#617589] dark:text-gray-400 hover:text-primary transition-colors font-medium" to="/dashboard">Home</Link>
                <span className="material-symbols-outlined text-[16px] text-[#617589] dark:text-gray-400">chevron_right</span>
                <span className="text-[#111418] dark:text-white font-semibold">Pilih Kelompok (Usaha)</span>
            </div>

            <div className="flex flex-col gap-4 max-w-2xl">
                <h1 className="text-3xl md:text-4xl font-black leading-tight tracking-[-0.033em] text-[#111418] dark:text-white">
                    Pilih Kelompok Binaan
                </h1>
                <p className="text-[#617589] dark:text-gray-400 text-base font-normal">
                    Silakan pilih kelompok binaan untuk melihat dan mengelola data usaha anggota dalam kelompok tersebut.
                </p>
            </div>

            <div className="relative w-full md:w-96">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#617589] dark:text-gray-400">
                    <span className="material-symbols-outlined">search</span>
                </span>
                <input
                    className="w-full h-12 pl-12 pr-4 rounded-xl bg-white dark:bg-[#1a202c] border border-[#dbe0e6] dark:border-[#2a3441] focus:border-primary focus:ring-1 focus:ring-primary text-sm text-[#111418] dark:text-white placeholder:text-[#617589] dark:placeholder:text-gray-400 transition-all shadow-sm outline-none"
                    placeholder="Cari nama kelompok..."
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-2">
                    {[1, 2, 3].map(n => (
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
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-2">
                    {kelompoks.map((kelompok) => (
                        <div key={kelompok.id} className="group bg-white dark:bg-[#1a202c] rounded-xl shadow-sm border border-[#dbe0e6] dark:border-[#2a3441] overflow-hidden hover:shadow-md transition-all duration-300 hover:border-primary/50">
                            <div className="h-24 bg-gradient-to-r from-blue-500 to-cyan-500 relative">
                                <div className="absolute -bottom-10 left-6">
                                    <div className="size-16 bg-white dark:bg-[#1a202c] rounded-xl p-1 shadow-md flex items-center justify-center">
                                        <div className="w-full h-full bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center text-primary text-xl font-bold">
                                            {(kelompok.namaKelompok || kelompok.nama).substring(0, 1).toUpperCase()}
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="pt-12 px-6 pb-6 flex flex-col gap-4">
                                <div>
                                    <h3 className="text-xl font-bold text-[#111418] dark:text-white group-hover:text-primary transition-colors">{kelompok.namaKelompok || kelompok.nama}</h3>
                                    <p className="text-sm text-[#617589] dark:text-gray-400 mt-1">{kelompok.desa}, {kelompok.kecamatan}</p>
                                </div>
                                <div className="flex items-center gap-4 text-sm text-[#617589] dark:text-gray-400 border-t border-[#dbe0e6] dark:border-[#2a3441] pt-4">
                                    <div className="flex items-center gap-1.5">
                                        <span className="material-symbols-outlined text-[18px]">person</span>
                                        <span>{kelompok.kpmCount || 0} Anggota</span>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <span className="material-symbols-outlined text-[18px] text-blue-500">storefront</span>
                                        <span>{kelompok.usahaCount || 0} Usaha</span>
                                    </div>
                                </div>
                                <Link to={`/usaha/${kelompok.id}`} className="w-full mt-2 h-10 flex items-center justify-center gap-2 rounded-lg bg-primary/10 hover:bg-primary text-primary hover:text-white font-semibold text-sm transition-all duration-200 cursor-pointer">
                                    <span>Lihat Data Usaha</span>
                                    <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Usaha;
