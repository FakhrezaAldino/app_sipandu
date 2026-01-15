import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import StatsGrid from '../components/Dashboard/StatsGrid';
import AttendanceChart from '../components/Dashboard/AttendanceChart';
import ActivityTable from '../components/Dashboard/ActivityTable';
import { useAuth } from '../context/AuthContext';
import { reportService } from '../services/report.service';

function Dashboard() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [stats, setStats] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Redirect Admin to Admin Dashboard
        if (user?.role === 'admin') {
            navigate('/admin/dashboard', { replace: true });
            return;
        }

        const fetchStats = async () => {
            try {
                const response = await reportService.getDashboardStats();

                setStats(response.data);
            } catch (error) {
                console.error('Failed to fetch dashboard stats:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchStats();
    }, [user, navigate]);

    const today = new Intl.DateTimeFormat('id-ID', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    }).format(new Date());

    return (
        <div className="mx-auto max-w-6xl flex flex-col gap-6">
            {/* Page Heading */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
                <div className="flex flex-col gap-1">
                    <h1 className="text-[#111418] dark:text-white text-3xl font-black leading-tight tracking-[-0.033em]">
                        Selamat Datang, {user?.name || 'User'}
                    </h1>
                    <p className="text-[#617589] dark:text-gray-400 text-base font-normal">
                        {today} - Dashboard Manajemen PKH
                    </p>
                </div>

            </div>
            {/* Dashboard Content */}
            <StatsGrid stats={stats} isLoading={isLoading} />
            <div className="flex flex-col gap-6">
                <AttendanceChart data={stats?.attendanceTrend} />
            </div>
            <ActivityTable activities={stats?.recentActivities} isLoading={isLoading} />
        </div>
    );
}

export default Dashboard;
