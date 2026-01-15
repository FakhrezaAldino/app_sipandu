import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { kpmService } from '../services/kpm.service';
import { inputDataService } from '../services/inputData.service';

const KPMDetail: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState<'usaha' | 'prestasi' | 'permasalahan' | 'graduasi'>('usaha');
    const [kpm, setKpm] = useState<any>(null);
    const [records, setRecords] = useState<{
        usaha: any[];
        prestasi: any[];
        permasalahan: any[];
        graduasi: any[];
    }>({
        usaha: [],
        prestasi: [],
        permasalahan: [],
        graduasi: []
    });
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchData = useCallback(async () => {
        if (!id) return;
        setIsLoading(true);
        setError(null);
        try {
            const [kpmData, usahaData, prestasiData, permasalahanData] = await Promise.all([
                kpmService.getById(id),
                inputDataService.usaha.getByKpm(id),
                inputDataService.prestasi.getByKpm(id),
                inputDataService.permasalahan.getByKpm(id)
            ]);

            setKpm(kpmData);
            setRecords({
                usaha: usahaData.data || [],
                prestasi: prestasiData.data || [],
                permasalahan: permasalahanData.data || [],
                graduasi: [] // Graduasi is usually handled differently or fetched separately
            });
        } catch (err: any) {
            setError(err.message || 'Gagal mengambil data KPM');
        } finally {
            setIsLoading(false);
        }
    }, [id]);

    const handleDelete = async () => {
        if (!kpm) return;
        if (window.confirm(`Apakah Anda yakin ingin menghapus KPM "${kpm.nama}"?`)) {
            try {
                await kpmService.delete(id!);
                navigate(`/kelompok/${kpm.kelompok_id}`);
            } catch (error: any) {
                console.error('Failed to delete KPM:', error);
                alert(error.response?.data?.message || 'Gagal menghapus KPM.');
            }
        }
    };

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    if (isLoading) {
        return (
            <div className="flex h-96 items-center justify-center">
                <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
            </div>
        );
    }

    if (error || !kpm) {
        return (
            <div className="p-8 text-center bg-red-50 text-red-600 rounded-xl border border-red-100">
                <p className="text-lg font-bold">Terjadi Kesalahan</p>
                <p>{error || 'KPM tidak ditemukan'}</p>
                <Link to="/kelompok" className="mt-4 inline-block text-primary hover:underline font-medium">
                    Kembali ke Daftar Kelompok
                </Link>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto space-y-6 animate-in fade-in duration-500">
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-sm text-slate-500 overflow-x-auto whitespace-nowrap pb-2">
                <Link to="/dashboard" className="hover:text-primary transition-colors flex items-center gap-1">
                    <span className="material-symbols-outlined text-lg">home</span> Dashboard
                </Link>
                <span className="material-symbols-outlined text-sm">chevron_right</span>
                <Link to="/kelompok" className="hover:text-primary transition-colors">Kelompok</Link>
                <span className="material-symbols-outlined text-sm">chevron_right</span>
                <Link to={`/kelompok/${kpm.kelompok_id}`} className="hover:text-primary transition-colors">{kpm.kelompok?.nama || 'Detail Kelompok'}</Link>
                <span className="material-symbols-outlined text-sm">chevron_right</span>
                <span className="text-slate-900 font-bold dark:text-white">{kpm.nama}</span>
            </div>

            {/* Profile Section */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-6">
                <div className="flex flex-col md:flex-row gap-6 items-center md:items-start">
                    <div className="relative">
                        <div className="size-24 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-primary dark:text-blue-300 text-3xl font-bold border-4 border-white dark:border-slate-800 shadow-sm">
                            {kpm.nama.substring(0, 2).toUpperCase()}
                        </div>
                        <div className={`absolute bottom-0 right-0 size-6 rounded-full border-2 border-white dark:border-slate-800 flex items-center justify-center ${kpm.status === 'aktif' ? 'bg-green-500' : 'bg-slate-400'}`}>
                            <span className="material-symbols-outlined text-white text-[14px]">
                                {kpm.status === 'aktif' ? 'check' : 'close'}
                            </span>
                        </div>
                    </div>
                    <div className="flex-1 text-center md:text-left space-y-2">
                        <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4 md:justify-between w-full">
                            <div className="flex items-center gap-4">
                                <h1 className="text-2xl font-black text-slate-900 dark:text-white capitalize">{kpm.nama}</h1>
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${kpm.status === 'aktif' ? 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300' : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'}`}>
                                    {kpm.status.toUpperCase()}
                                </span>
                            </div>
                            <button
                                onClick={handleDelete}
                                className="inline-flex cursor-pointer items-center justify-center gap-2 whitespace-nowrap rounded-lg bg-red-50 border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-600 shadow-sm hover:bg-red-100 transition-all w-fit"
                            >
                                <span className="material-symbols-outlined text-[18px]">delete</span>
                                <span>Hapus KPM</span>
                            </button>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2 text-sm">
                            <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                                <span className="material-symbols-outlined text-lg">id_card</span>
                                <span className="font-mono">{kpm.nik}</span>
                            </div>
                            <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                                <span className="material-symbols-outlined text-lg">calendar_today</span>
                                <span>{new Date(kpm.tanggal_lahir).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                            </div>
                            <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                                <span className="material-symbols-outlined text-lg">phone</span>
                                <span>{kpm.no_hp || '-'}</span>
                            </div>
                            <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                                <span className="material-symbols-outlined text-lg">location_on</span>
                                <span className="truncate">{kpm.alamat}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Summary Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 flex items-center gap-4">
                    <div className="p-3 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-xl">
                        <span className="material-symbols-outlined text-2xl">storefront</span>
                    </div>
                    <div>
                        <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Total Usaha</p>
                        <p className="text-2xl font-black text-slate-900 dark:text-white">{records.usaha.length}</p>
                    </div>
                </div>
                <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 flex items-center gap-4">
                    <div className="p-3 bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 rounded-xl">
                        <span className="material-symbols-outlined text-2xl">emoji_events</span>
                    </div>
                    <div>
                        <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Prestasi</p>
                        <p className="text-2xl font-black text-slate-900 dark:text-white">{records.prestasi.length}</p>
                    </div>
                </div>
                <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 flex items-center gap-4">
                    <div className="p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-xl">
                        <span className="material-symbols-outlined text-2xl">report_problem</span>
                    </div>
                    <div>
                        <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Permasalahan</p>
                        <p className="text-2xl font-black text-slate-900 dark:text-white">{records.permasalahan.length}</p>
                    </div>
                </div>
            </div>

            {/* Tabs Content */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
                <div className="flex border-b border-slate-200 dark:border-slate-800 overflow-x-auto bg-slate-50/50 dark:bg-slate-800/50">
                    {[
                        { id: 'usaha', label: 'Data Usaha', icon: 'storefront' },
                        { id: 'prestasi', label: 'Prestasi', icon: 'emoji_events' },
                        { id: 'permasalahan', label: 'Permasalahan', icon: 'report_problem' }
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as any)}
                            className={`flex items-center gap-2 px-6 py-4 text-sm font-bold transition-all border-b-2 whitespace-nowrap cursor-pointer ${activeTab === tab.id
                                ? 'border-primary text-primary bg-white dark:bg-slate-900'
                                : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                                }`}
                        >
                            <span className="material-symbols-outlined text-[20px]">{tab.icon}</span>
                            {tab.label}
                        </button>
                    ))}
                </div>

                <div className="p-6">
                    {activeTab === 'usaha' && (
                        <div className="space-y-4">
                            {records.usaha.length === 0 ? (
                                <p className="text-center py-8 text-slate-500">Belum ada data usaha.</p>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {records.usaha.map((item: any) => (
                                        <div key={item.id} className="p-4 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 space-y-2">
                                            <div className="flex justify-between items-start">
                                                <h3 className="font-bold text-slate-900 dark:text-white">{item.jenis_usaha}</h3>
                                                <span className="text-xs font-mono text-slate-500">{new Date(item.tanggal_input).toLocaleDateString()}</span>
                                            </div>
                                            <p className="text-sm text-slate-600 dark:text-slate-400">Omset: <span className="font-bold text-slate-900 dark:text-white">Rp {item.omset_bulanan.toLocaleString()}</span></p>
                                            <p className="text-sm text-slate-600 dark:text-slate-400">Modal: <span className="font-medium">{item.status_modal}</span></p>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'prestasi' && (
                        <div className="space-y-4">
                            {records.prestasi.length === 0 ? (
                                <p className="text-center py-8 text-slate-500">Belum ada data prestasi.</p>
                            ) : (
                                <div className="space-y-4">
                                    {records.prestasi.map((item: any) => (
                                        <div key={item.id} className="p-4 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50">
                                            <div className="flex justify-between items-center mb-2">
                                                <h3 className="font-bold text-slate-900 dark:text-white">{item.jenis_prestasi}</h3>
                                                <span className="text-xs bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full font-bold">{item.tingkat_prestasi}</span>
                                            </div>
                                            <p className="text-sm text-slate-600 dark:text-slate-400 italic">"{item.keterangan}"</p>
                                            <p className="text-xs text-slate-400 mt-2">{new Date(item.tanggal_input).toLocaleDateString()}</p>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'permasalahan' && (
                        <div className="space-y-4">
                            {records.permasalahan.length === 0 ? (
                                <p className="text-center py-8 text-slate-500">Belum ada data permasalahan.</p>
                            ) : (
                                <div className="space-y-4">
                                    {records.permasalahan.map((item: any) => (
                                        <div key={item.id} className="p-4 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50">
                                            <div className="flex justify-between items-start mb-2">
                                                <h3 className="font-bold text-slate-900 dark:text-white">{item.kategori}</h3>
                                                <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${item.status === 'selesai' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                                    {item.status.toUpperCase()}
                                                </span>
                                            </div>
                                            <p className="text-sm text-slate-600 dark:text-slate-400">{item.deskripsi}</p>
                                            <div className="mt-3 p-2 bg-white dark:bg-slate-900 rounded-lg text-xs">
                                                <p className="font-bold text-slate-500 mb-1">Solusi:</p>
                                                <p className="text-slate-700 dark:text-slate-300">{item.solusi || 'Dalam proses tindak lanjut'}</p>
                                            </div>
                                            <p className="text-xs text-slate-400 mt-2">{new Date(item.tanggal_lapor).toLocaleDateString()}</p>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default KPMDetail;
