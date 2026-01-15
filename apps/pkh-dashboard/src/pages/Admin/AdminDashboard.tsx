import React, { useEffect, useState } from 'react';
import { adminApi } from '../../services/adminApi';
import AdminStatsGrid from '../../components/Admin/AdminStatsGrid';
import { useNavigate } from 'react-router-dom';
import type { AdminDashboardSummaryDTO } from '../../types/api';

const AdminDashboard: React.FC = () => {
    const navigate = useNavigate();
    const [stats, setStats] = useState<AdminDashboardSummaryDTO | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isDownloading, setIsDownloading] = useState(false);

    const fetchStats = async () => {
        try {
            setIsLoading(true);
            const response = await adminApi.getDashboardSummary();
            setStats(response.data);
        } catch (err) {
            console.error('Failed to fetch admin stats:', err);
            setError('Gagal mengambil data ringkasan admin.');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchStats();
    }, []);

    const handleDownloadPdf = async () => {
        setIsDownloading(true);
        try {
            await adminApi.downloadPdfReport();
        } catch (err: any) {
            console.error('Failed to download PDF:', err);
            alert('Gagal mengunduh laporan PDF: ' + (err.message || 'Unknown error'));
        } finally {
            setIsDownloading(false);
        }
    };

    return (
        <div className="flex flex-col gap-6 p-4 sm:p-6 lg:p-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex flex-col gap-2">
                    <h1 className="text-[#111418] dark:text-white text-2xl font-bold leading-tight sm:text-3xl">
                        Admin Panel
                    </h1>
                    <p className="text-[#637588] dark:text-gray-400 text-sm">
                        Manajemen sistem dan laporan program PKH
                    </p>
                </div>
                <button
                    onClick={handleDownloadPdf}
                    disabled={isDownloading}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 dark:bg-white px-5 py-2.5 text-sm font-bold text-white dark:text-slate-900 shadow-sm transition-all hover:bg-slate-800 dark:hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isDownloading ? (
                        <>
                            <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white dark:border-slate-900/30 dark:border-t-slate-900"></div>
                            <span>Memproses...</span>
                        </>
                    ) : (
                        <>
                            <span className="material-symbols-outlined text-[20px]">description</span>
                            <span>Download Laporan</span>
                        </>
                    )}
                </button>
            </div>

            {error && (
                <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800 rounded-xl text-red-600 dark:text-red-400 text-sm">
                    {error}
                </div>
            )}

            <AdminStatsGrid stats={stats} isLoading={isLoading} />



            <div className="bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-800 rounded-xl p-6 flex flex-col sm:flex-row items-center gap-4">
                <div className="h-12 w-12 rounded-full bg-blue-100 dark:bg-blue-800 flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-blue-600 dark:text-blue-300">info</span>
                </div>
                <div>
                    <h4 className="font-bold text-blue-900 dark:text-blue-200">Mode Admin Aktif</h4>
                    <p className="text-sm text-blue-800/80 dark:text-blue-300/80">
                        Anda masuk sebagai administrator. Gunakan hak akses ini dengan bijak sesuai protokol keamanan data.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
