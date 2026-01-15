import { Link } from 'react-router-dom';

interface StatsGridProps {
    stats: any;
    isLoading: boolean;
}

const StatsGrid = ({ stats, isLoading }: StatsGridProps) => {
    if (isLoading) {
        return (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-pulse">
                {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="h-32 bg-gray-200 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700"></div>
                ))}
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link to="/kelompok" className="flex flex-col gap-2 rounded-xl bg-white dark:bg-[#1a202c] p-5 shadow-sm border border-[#e5e7eb] dark:border-[#2a3441] hover:border-primary/50 hover:shadow-md transition-all group">
                <div className="flex items-center justify-between">
                    <div className="rounded-full bg-blue-50 dark:bg-blue-900/20 p-2 text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform">
                        <span className="material-symbols-outlined">groups</span>
                    </div>
                    {/* Placeholder for real delta logic */}
                    <span className="text-xs font-bold text-blue-600 bg-blue-50 dark:bg-blue-900/20 px-2 py-0.5 rounded-full">Kelompok</span>
                </div>
                <div className="mt-2">
                    <p className="text-[#617589] dark:text-gray-400 text-sm font-medium">Jumlah Kelompok</p>
                    <p className="text-[#111418] dark:text-white text-3xl font-bold">{stats?.totalKelompok || 0}</p>
                </div>
            </Link>
            <div className="flex flex-col gap-2 rounded-xl bg-white dark:bg-[#1a202c] p-5 shadow-sm border border-[#e5e7eb] dark:border-[#2a3441]">
                <div className="flex items-center justify-between">
                    <div className="rounded-full bg-purple-50 dark:bg-purple-900/20 p-2 text-purple-600 dark:text-purple-400">
                        <span className="material-symbols-outlined">recent_actors</span>
                    </div>
                    <span className="text-xs font-bold text-[#617589] dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded-full">Total</span>
                </div>
                <div className="mt-2">
                    <p className="text-[#617589] dark:text-gray-400 text-sm font-medium">Jumlah KPM</p>
                    <p className="text-[#111418] dark:text-white text-3xl font-bold">{stats?.totalKpm || 0}</p>
                </div>
            </div>
            {/* Secondary stats could be enriched later from individual fetches if needed */}
            <Link to="/graduasi" className="flex flex-col gap-2 rounded-xl bg-white dark:bg-[#1a202c] p-5 shadow-sm border border-[#e5e7eb] dark:border-[#2a3441] hover:border-primary/50 hover:shadow-md transition-all group">
                <div className="flex items-center justify-between">
                    <div className="rounded-full bg-green-50 dark:bg-green-900/20 p-2 text-green-600 dark:text-green-400 group-hover:scale-110 transition-transform">
                        <span className="material-symbols-outlined">school</span>
                    </div>
                    <span className="text-xs font-bold text-green-600 bg-green-50 dark:bg-green-900/20 px-2 py-0.5 rounded-full">Graduasi</span>
                </div>
                <div className="mt-2">
                    <p className="text-[#617589] dark:text-gray-400 text-sm font-medium">KPM Graduasi</p>
                    <p className="text-[#111418] dark:text-white text-3xl font-bold">{stats?.totalGraduasi || 0}</p>
                </div>
            </Link>
            <Link to="/permasalahan" className="flex flex-col gap-2 rounded-xl bg-white dark:bg-[#1a202c] p-5 shadow-sm border border-[#e5e7eb] dark:border-[#2a3441] hover:border-primary/50 hover:shadow-md transition-all group">
                <div className="flex items-center justify-between">
                    <div className="rounded-full bg-red-50 dark:bg-red-900/20 p-2 text-red-600 dark:text-red-400 group-hover:scale-110 transition-transform">
                        <span className="material-symbols-outlined">warning</span>
                    </div>
                    <span className="text-xs font-bold text-red-600 bg-red-50 dark:bg-red-900/20 px-2 py-0.5 rounded-full">Isu</span>
                </div>
                <div className="mt-2">
                    <p className="text-[#617589] dark:text-gray-400 text-sm font-medium">Isu Aktif</p>
                    <p className="text-[#111418] dark:text-white text-3xl font-bold">{stats?.totalPermasalahan || 0}</p>
                </div>
            </Link>
        </div>
    );
};

export default StatsGrid;
