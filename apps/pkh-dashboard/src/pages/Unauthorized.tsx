import React from 'react';
import { Link } from 'react-router-dom';

const Unauthorized: React.FC = () => {
    return (
        <div className="min-h-screen flex items-center justify-center bg-[#f0f2f4] dark:bg-[#111418] p-4">
            <div className="max-w-md w-full text-center space-y-6 animate-in fade-in zoom-in duration-300">
                <div className="flex justify-center">
                    <div className="h-24 w-24 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center">
                        <span className="material-symbols-outlined text-red-600 dark:text-red-500 text-[48px]">
                            gpp_maybe
                        </span>
                    </div>
                </div>

                <h1 className="text-3xl font-bold text-[#111418] dark:text-white">Akses Ditolak</h1>
                <p className="text-[#637588] dark:text-gray-400">
                    Maaf, akun Anda tidak memiliki izin yang cukup untuk mengakses halaman ini. Halaman ini hanya tersedia untuk Administrator.
                </p>

                <div className="pt-4">
                    <Link
                        to="/dashboard"
                        className="inline-flex items-center justify-center px-6 py-3 rounded-xl bg-primary hover:bg-primary-dark text-white font-bold transition-all shadow-lg shadow-primary/25 active:scale-95"
                    >
                        Kembali ke Dashboard
                    </Link>
                </div>

                <div className="text-xs text-[#637588] dark:text-gray-500 pt-8">
                    Hubungi Admin Pusat jika Anda merasa ini adalah kesalahan.
                </div>
            </div>
        </div>
    );
};

export default Unauthorized;
