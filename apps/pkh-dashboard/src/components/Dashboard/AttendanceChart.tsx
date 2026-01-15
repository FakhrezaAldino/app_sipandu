

interface AttendanceData {
    month: string;
    percentage: number;
}

interface AttendanceChartProps {
    data?: AttendanceData[];
}

const AttendanceChart = ({ data = [] }: AttendanceChartProps) => {
    // Determine trend (simple comparison of last two months)
    let trend = 0;
    if (data.length >= 2) {
        const current = data[data.length - 1].percentage;
        const previous = data[data.length - 2].percentage;
        trend = current - previous;
    }

    const trendColor = trend >= 0 ? 'text-[#078838] bg-green-50 dark:bg-green-900/20' : 'text-red-600 bg-red-50 dark:bg-red-900/20';
    const trendIcon = trend >= 0 ? 'trending_up' : 'trending_down';
    const trendSign = trend > 0 ? '+' : '';

    return (
        <div className="lg:col-span-2 flex flex-col rounded-xl bg-white dark:bg-[#1a202c] shadow-sm border border-[#e5e7eb] dark:border-[#2a3441] p-6 h-full">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h3 className="text-[#111418] dark:text-white text-lg font-bold leading-tight">Tren Kehadiran P2K2</h3>
                    <p className="text-[#617589] dark:text-gray-400 text-sm">Persentase kehadiran pertemuan kelompok 6 bulan terakhir</p>
                </div>
                {data.length > 0 && (
                    <div className="flex items-center gap-2">
                        <span className={`${trendColor} px-2 py-1 rounded text-sm font-bold flex items-center`}>
                            <span className="material-symbols-outlined text-sm mr-1">{trendIcon}</span> {trendSign}{trend}%
                        </span>
                    </div>
                )}
            </div>

            {/* Chart Visualization */}
            <div className="relative h-64 w-full mt-4 group">
                {data.length === 0 ? (
                    <div className="absolute inset-0 flex items-center justify-center text-gray-400 text-sm">
                        Belum ada data kehadiran
                    </div>
                ) : (
                    <div className="absolute bottom-0 left-0 right-0 top-0 flex items-end justify-between px-2 gap-2">
                        {data.map((item, index) => (
                            <div key={index} className="flex flex-col items-center gap-2 w-full group/bar">
                                <div
                                    className={`w-full max-w-[40px] rounded-t-lg relative transition-all hover:scale-105 ${index === data.length - 1
                                            ? 'bg-primary shadow-[0_4px_20px_rgba(19,127,236,0.3)]'
                                            : 'bg-primary/20 dark:bg-primary/30 hover:bg-primary/40'
                                        }`}
                                    style={{ height: `${item.percentage || 1}%` }} // Min height 1% to show bar exists
                                >
                                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-xs py-1 px-2 rounded opacity-0 group-hover/bar:opacity-100 transition-opacity whitespace-nowrap font-bold z-10">
                                        {item.percentage}%
                                    </div>
                                </div>
                                <span className={`text-xs font-bold ${index === data.length - 1 ? 'text-[#111418] dark:text-white' : 'text-[#617589] dark:text-gray-400'}`}>
                                    {item.month}
                                </span>
                            </div>
                        ))}
                    </div>
                )}

                {/* Horizontal Grid Lines */}
                <div className="absolute inset-0 pointer-events-none flex flex-col justify-between -z-10 pb-6">
                    <div className="w-full border-t border-dashed border-gray-200 dark:border-gray-700"></div>
                    <div className="w-full border-t border-dashed border-gray-200 dark:border-gray-700"></div>
                    <div className="w-full border-t border-dashed border-gray-200 dark:border-gray-700"></div>
                    <div className="w-full border-t border-dashed border-gray-200 dark:border-gray-700"></div>
                    <div className="w-full border-b border-gray-200 dark:border-gray-700"></div>
                </div>
            </div>
        </div>
    );
};

export default AttendanceChart;
