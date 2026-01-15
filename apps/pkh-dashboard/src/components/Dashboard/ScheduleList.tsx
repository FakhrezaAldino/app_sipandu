

interface ScheduleListProps {
    schedules?: any[];
}

const ScheduleList = ({ schedules = [] }: ScheduleListProps) => {
    return (
        <div className="flex flex-col rounded-xl bg-white dark:bg-[#1a202c] shadow-sm border border-[#e5e7eb] dark:border-[#2a3441] p-6 h-full">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-[#111418] dark:text-white text-lg font-bold">Jadwal Pertemuan</h3>
                {schedules.length > 0 && (
                    <a className="text-sm font-bold text-primary hover:underline" href="/absensi">Lihat Semua</a>
                )}
            </div>
            <div className="flex flex-col gap-4">
                {schedules.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-6 text-center">
                        <span className="material-symbols-outlined text-4xl text-slate-300 dark:text-slate-600 mb-2">event_busy</span>
                        <p className="text-sm text-slate-500 dark:text-slate-400">Belum ada jadwal pertemuan mendatang.</p>
                        <a href="/jadwal/input" className="mt-3 text-xs font-bold text-primary hover:underline">Buat Jadwal Baru</a>
                    </div>
                ) : (
                    schedules.map((schedule) => {
                        // Parse date
                        const date = new Date(schedule.tanggal);
                        const month = date.toLocaleDateString('id-ID', { month: 'short' });
                        const day = date.getDate();
                        const time = date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }).replace('.', ':') + ' WIB';

                        // Styling based on activity type (simple logic for now)
                        let badgeColor = 'blue';
                        if (schedule.aktivitas?.toLowerCase().includes('pemutakhiran')) badgeColor = 'purple';
                        if (schedule.aktivitas?.toLowerCase().includes('kunjungan')) badgeColor = 'orange';

                        const badgeClass = badgeColor === 'blue' ? 'text-blue-600 bg-blue-50 dark:bg-blue-900/20' :
                            badgeColor === 'purple' ? 'text-purple-600 bg-purple-50 dark:bg-purple-900/20' :
                                'text-orange-600 bg-orange-50 dark:bg-orange-900/20';

                        return (
                            <div key={schedule.id} className="flex items-start gap-3 p-3 rounded-lg bg-[#f8f9fa] dark:bg-[#222b38] border border-transparent hover:border-primary/20 transition-all">
                                <div className="flex flex-col items-center justify-center min-w-[50px] bg-white dark:bg-[#2d3748] rounded-md shadow-sm py-2 border border-gray-100 dark:border-gray-700">
                                    <span className="text-xs font-bold text-red-500 uppercase">{month}</span>
                                    <span className="text-xl font-bold text-[#111418] dark:text-white">{day}</span>
                                </div>
                                <div className="flex flex-col">
                                    <h4 className="text-sm font-bold text-[#111418] dark:text-white">{schedule.kelompok?.namaKelompok || 'Kelompok'}</h4>
                                    <p className="text-xs text-[#617589] dark:text-gray-400 mb-1">Pukul {time} - {schedule.lokasi}</p>
                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded w-fit ${badgeClass}`}>{schedule.aktivitas}</span>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
};

export default ScheduleList;
