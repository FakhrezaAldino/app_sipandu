import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface Activity {
    id: string;
    kelompokId?: string;
    type: string;
    subject: string;
    detail: string;
    status: string;
    createdAt: string;
}

const ActivityTable = ({ activities, isLoading }: { activities?: Activity[], isLoading?: boolean }) => {
    const navigate = useNavigate();
    const [showAll, setShowAll] = useState(false);

    const displayedActivities = showAll ? activities : activities?.slice(0, 5);

    const handleDetailClick = (activity: Activity) => {
        switch (activity.type) {
            case 'Absensi':
                navigate('/absensi');
                break;
            case 'Usaha':
                navigate(`/usaha/${activity.kelompokId || activity.id}`);
                break;
            case 'Prestasi':
                navigate(`/prestasi/${activity.kelompokId || activity.id}`);
                break;
            case 'Permasalahan':
                navigate(`/permasalahan/${activity.kelompokId || activity.id}`);
                break;
            case 'Graduasi':
                navigate(`/graduasi/${activity.kelompokId || activity.id}`);
                break;
            case 'KPM':
                navigate(`/kpm/${activity.id}`);
                break;
            default:
                break;
        }
    };

    return (
        <div className="flex flex-col rounded-xl bg-white dark:bg-[#1a202c] shadow-sm border border-[#e5e7eb] dark:border-[#2a3441] overflow-hidden">
            <div className="flex justify-between items-center p-6 border-b border-[#e5e7eb] dark:border-[#2a3441]">
                <h3 className="text-[#111418] dark:text-white text-lg font-bold">Aktivitas Terbaru</h3>
                <button className="flex items-center gap-1 text-sm font-bold text-[#617589] dark:text-gray-400 hover:text-primary transition-colors">
                    <span className="material-symbols-outlined text-[18px]">filter_list</span>
                    Filter
                </button>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-[#f8f9fa] dark:bg-[#222b38]">
                        <tr>
                            <th className="py-3 px-6 text-xs font-bold uppercase tracking-wider text-[#617589] dark:text-gray-400">Waktu</th>
                            <th className="py-3 px-6 text-xs font-bold uppercase tracking-wider text-[#617589] dark:text-gray-400">KPM / Subjek</th>
                            <th className="py-3 px-6 text-xs font-bold uppercase tracking-wider text-[#617589] dark:text-gray-400">Aktivitas</th>
                            <th className="py-3 px-6 text-xs font-bold uppercase tracking-wider text-[#617589] dark:text-gray-400">Status</th>
                            <th className="py-3 px-6 text-xs font-bold uppercase tracking-wider text-[#617589] dark:text-gray-400 text-right">Aksi</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-[#e5e7eb] dark:divide-[#2a3441]">
                        {isLoading ? (
                            <tr>
                                <td colSpan={5} className="py-10 text-center text-[#617589] dark:text-gray-400">
                                    Memuat data aktivitas...
                                </td>
                            </tr>
                        ) : displayedActivities && displayedActivities.length > 0 ? (
                            displayedActivities.map((activity) => (
                                <tr key={activity.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                                    <td className="py-4 px-6 text-sm text-[#111418] dark:text-white whitespace-nowrap">
                                        {new Date(activity.createdAt).toLocaleString('id-ID', {
                                            hour: '2-digit',
                                            minute: '2-digit',
                                            day: 'numeric',
                                            month: 'short'
                                        })}
                                    </td>
                                    <td className="py-4 px-6 text-sm font-medium text-[#111418] dark:text-white">
                                        <div className="flex items-center gap-3">
                                            <div className={`size-8 rounded-full flex items-center justify-center text-xs font-bold ${activity.type === 'Absensi' ? 'bg-purple-100 text-purple-600' :
                                                activity.type === 'Usaha' ? 'bg-blue-100 text-blue-600' :
                                                    activity.type === 'Prestasi' ? 'bg-amber-100 text-amber-600' :
                                                        activity.type === 'Permasalahan' ? 'bg-red-100 text-red-600' :
                                                            activity.type === 'Graduasi' ? 'bg-green-100 text-green-600' :
                                                                'bg-gray-100 text-gray-600'
                                                }`}>
                                                {activity.subject.substring(0, 2).toUpperCase()}
                                            </div>
                                            {activity.subject}
                                        </div>
                                    </td>
                                    <td className="py-4 px-6 text-sm text-[#617589] dark:text-gray-400">
                                        {activity.detail}
                                    </td>
                                    <td className="py-4 px-6">
                                        <span className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-bold ${activity.status === 'Selesai'
                                            ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400'
                                            : 'bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400'
                                            }`}>
                                            <span className={`h-1.5 w-1.5 rounded-full ${activity.status === 'Selesai' ? 'bg-green-600' : 'bg-yellow-600'
                                                }`}></span>
                                            {activity.status}
                                        </span>
                                    </td>
                                    <td className="py-4 px-6 text-right">
                                        <button
                                            onClick={() => handleDetailClick(activity)}
                                            className="text-primary hover:text-blue-700 font-bold text-sm"
                                        >
                                            Detail
                                        </button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={5} className="py-10 text-center text-[#617589] dark:text-gray-400">
                                    Belum ada aktivitas terbaru.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
            {(activities?.length || 0) > 5 && (
                <div className="p-4 border-t border-[#e5e7eb] dark:border-[#2a3441] bg-[#f8f9fa] dark:bg-[#222b38] flex justify-center">
                    <button
                        onClick={() => setShowAll(!showAll)}
                        className="text-sm font-bold text-[#617589] dark:text-gray-400 hover:text-primary transition-colors flex items-center gap-2"
                    >
                        {showAll ? 'Sembunyikan' : 'Lihat Semua Aktivitas'}
                        <span className={`material-symbols-outlined text-[16px] transition-transform ${showAll ? 'rotate-180' : ''}`}>
                            {showAll ? 'expand_less' : 'arrow_forward'}
                        </span>
                    </button>
                </div>
            )}
        </div>
    );
};

export default ActivityTable;
