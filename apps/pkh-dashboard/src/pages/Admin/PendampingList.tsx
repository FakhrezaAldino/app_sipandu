import { useState, useEffect, useCallback } from 'react';
import { adminApi } from '../../services/adminApi';
import { exportToCSV } from '../../lib/exportUtils';
import { Link } from 'react-router-dom';
import PendampingModal from '../../components/Admin/PendampingModal';
import type { UserDTO } from '../../types/api';

const PendampingList = () => {
    const [pendampings, setPendampings] = useState<UserDTO[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedPendamping, setSelectedPendamping] = useState<UserDTO | null>(null);

    const fetchPendampings = useCallback(async () => {
        setIsLoading(true);
        try {
            const response = await adminApi.listPendamping();
            setPendampings(response.data);
        } catch (error) {
            console.error('Failed to fetch pendampings:', error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchPendampings();
    }, [fetchPendampings]);

    const handleToggleStatus = async (id: string, currentStatus: boolean) => {
        if (!confirm(`Are you sure you want to ${currentStatus ? 'deactivate' : 'activate'} this account?`)) return;

        try {
            await adminApi.togglePendampingStatus(id, !currentStatus);
            fetchPendampings();
        } catch (error) {
            console.error('Failed to toggle status:', error);
        }
    };

    const handleEdit = (pendamping: any) => {
        setSelectedPendamping(pendamping);
        setIsModalOpen(true);
    };

    const handleAdd = () => {
        setSelectedPendamping(null);
        setIsModalOpen(true);
    };

    const filteredList = pendampings.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="layout-container flex grow flex-col">
            <div className="flex flex-1 justify-center py-6 px-4 sm:px-6 lg:px-8">
                <div className="layout-content-container flex flex-col w-full max-w-[1024px] flex-1 gap-6">
                    {/* Breadcrumbs */}
                    <div className="flex flex-wrap gap-2 text-sm">
                        <Link className="text-slate-500 hover:text-primary transition-colors font-medium dark:text-slate-400" to="/admin/dashboard">Admin</Link>
                        <span className="text-slate-400 dark:text-slate-500">/</span>
                        <span className="text-slate-900 font-semibold dark:text-white">Manajemen Pendamping</span>
                    </div>

                    {/* Page Heading */}
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                        <div className="flex flex-col gap-1">
                            <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-4xl">Pendamping</h1>
                            <p className="text-base font-normal text-slate-500 dark:text-slate-400">
                                Kelola akun pendamping program PKH di wilayah Anda.
                            </p>
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={() => {
                                    const exportData = pendampings.map(p => ({
                                        'Nama': p.name,
                                        'Email': p.email,
                                        'Status': p.isActive ? 'Aktif' : 'Nonaktif',
                                        'Tanggal Terdaftar': new Date(p.createdAt).toLocaleDateString('id-ID', { dateStyle: 'long' })
                                    }));
                                    exportToCSV(exportData, 'Data_Pendamping');
                                }}
                                className="inline-flex cursor-pointer items-center justify-center gap-2 whitespace-nowrap rounded-lg border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50 dark:bg-slate-800 dark:border-slate-700 dark:text-white dark:hover:bg-slate-700 transition-all cursor-pointer"
                            >
                                <span className="material-symbols-outlined text-[20px] text-green-600">file_download</span>
                                <span>Export CSV</span>
                            </button>
                            <button
                                onClick={handleAdd}
                                className="inline-flex cursor-pointer items-center justify-center gap-2 whitespace-nowrap rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary transition-all"
                            >
                                <span className="material-symbols-outlined text-[20px]">person_add</span>
                                <span>Tambah Pendamping</span>
                            </button>
                        </div>
                    </div>

                    {/* Search */}
                    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                        <label className="relative flex w-full items-center">
                            <span className="material-symbols-outlined absolute left-3 text-slate-400">search</span>
                            <input
                                className="h-10 w-full rounded-lg border-slate-200 bg-slate-50 pl-10 pr-4 text-sm text-slate-900 placeholder:text-slate-400 focus:border-primary focus:ring-primary dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:placeholder:text-slate-500"
                                placeholder="Cari berdasarkan nama atau email..."
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </label>
                    </div>

                    {/* Data Table */}
                    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm text-slate-600 dark:text-slate-400">
                                <thead className="border-b border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-800/50">
                                    <tr>
                                        <th className="px-6 py-4 font-semibold text-slate-900 dark:text-white" scope="col">Nama & Email</th>
                                        <th className="px-6 py-4 font-semibold text-slate-900 dark:text-white" scope="col">Status</th>
                                        <th className="px-6 py-4 font-semibold text-slate-900 dark:text-white" scope="col">Terdaftar Pada</th>
                                        <th className="px-6 py-4 text-right font-semibold text-slate-900 dark:text-white" scope="col">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                                    {isLoading ? (
                                        <tr>
                                            <td colSpan={4} className="px-6 py-10 text-center text-slate-500">
                                                <div className="flex justify-center">
                                                    <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
                                                </div>
                                            </td>
                                        </tr>
                                    ) : filteredList.length === 0 ? (
                                        <tr>
                                            <td colSpan={4} className="px-6 py-10 text-center text-slate-500">
                                                Tidak ada pendamping yang ditemukan.
                                            </td>
                                        </tr>
                                    ) : (
                                        filteredList.map((p) => (
                                            <tr key={p.id} className="group hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800">
                                                            <span className="material-symbols-outlined text-slate-500">account_circle</span>
                                                        </div>
                                                        <div>
                                                            <div className="font-medium text-slate-900 dark:text-white">{p.name}</div>
                                                            <div className="text-xs text-slate-500">{p.email}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${p.isActive ? 'bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400'}`}>
                                                        {p.isActive ? 'Aktif' : 'Nonaktif'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-xs">
                                                    {new Date(p.createdAt).toLocaleDateString('id-ID', { dateStyle: 'long' })}
                                                </td>
                                                <td className="px-6 py-4 text-right space-x-2">
                                                    <button
                                                        onClick={() => handleEdit(p)}
                                                        className="inline-flex items-center gap-1 rounded-md px-2 py-1.5 text-xs font-medium text-primary hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                                                    >
                                                        <span className="material-symbols-outlined text-[16px]">edit</span>
                                                        Edit
                                                    </button>
                                                    <button
                                                        onClick={() => handleToggleStatus(p.id, p.isActive)}
                                                        className={`inline-flex items-center gap-1 rounded-md px-2 py-1.5 text-xs font-medium transition-colors ${p.isActive ? 'text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20' : 'text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20'}`}
                                                    >
                                                        <span className="material-symbols-outlined text-[16px]">{p.isActive ? 'block' : 'check_circle'}</span>
                                                        {p.isActive ? 'Nonaktifkan' : 'Aktifkan'}
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
            <PendampingModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSuccess={fetchPendampings}
                pendamping={selectedPendamping}
            />
        </div>
    );
};

export default PendampingList;
