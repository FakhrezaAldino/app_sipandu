import React from 'react';
import { useNavigate } from 'react-router-dom';

interface AdminStatsGridProps {
    stats: {
        totalPendamping: number;
        totalKelompok: number;
        totalKpm: number;
        totalAbsensi: number;
        totalUsaha: number;
        totalPrestasi: number;
        totalPermasalahan: number;
        totalGraduasi: number;
    } | null;
    isLoading: boolean;
}

const AdminStatsGrid: React.FC<AdminStatsGridProps> = ({ stats, isLoading }) => {
    const navigate = useNavigate();
    const statConfigs = [
        { label: 'Total Pendamping', key: 'totalPendamping', icon: 'manage_accounts', color: 'blue', link: '/admin/pendamping' },
        { label: 'Total Kelompok', key: 'totalKelompok', icon: 'groups', color: 'indigo', link: '/admin/kelompok' },
        { label: 'Total KPM', key: 'totalKpm', icon: 'person', color: 'purple', link: '/admin/kpm' },
        { label: 'Total Absensi', key: 'totalAbsensi', icon: 'event_available', color: 'emerald' },
        { label: 'Total Usaha', key: 'totalUsaha', icon: 'storefront', color: 'amber' },
        { label: 'Total Prestasi', key: 'totalPrestasi', icon: 'workspace_premium', color: 'cyan' },
        { label: 'Total Permasalahan', key: 'totalPermasalahan', icon: 'report_problem', color: 'red' },
        { label: 'Total Graduasi', key: 'totalGraduasi', icon: 'school', color: 'orange' },
    ];

    if (isLoading) {
        return (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-pulse">
                {statConfigs.map((_, i) => (
                    <div key={i} className="h-32 bg-gray-100 dark:bg-gray-800/50 rounded-xl border border-gray-100 dark:border-gray-700"></div>
                ))}
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {statConfigs.map((config) => {
                const colorMap: Record<string, string> = {
                    blue: 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400',
                    indigo: 'bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400',
                    purple: 'bg-purple-50 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400',
                    emerald: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400',
                    amber: 'bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400',
                    cyan: 'bg-cyan-50 text-cyan-600 dark:bg-cyan-900/20 dark:text-cyan-400',
                    red: 'bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400',
                    orange: 'bg-orange-50 text-orange-600 dark:bg-orange-900/20 dark:text-orange-400',
                };

                return (
                    <div
                        key={config.key}
                        onClick={() => config.link && navigate(config.link)}
                        className={`flex flex-col gap-2 rounded-xl bg-white dark:bg-[#1a202c] p-5 shadow-sm border border-[#e5e7eb] dark:border-[#2a3441] ${config.link ? 'cursor-pointer hover:border-primary transition-colors' : ''}`}
                    >
                        <div className="flex items-center justify-between">
                            <div className={`rounded-lg p-2 ${colorMap[config.color]}`}>
                                <span className="material-symbols-outlined">{config.icon}</span>
                            </div>
                        </div>
                        <div className="mt-2">
                            <p className="text-[#617589] dark:text-gray-400 text-xs font-medium uppercase tracking-wider">{config.label}</p>
                            <p className="text-[#111418] dark:text-white text-3xl font-bold">
                                {stats ? (stats as any)[config.key]?.toLocaleString() : 0}
                            </p>
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

export default AdminStatsGrid;
