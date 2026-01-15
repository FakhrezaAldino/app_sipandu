import React, { useState, useEffect, useCallback } from 'react';
import { kpmService } from '../../services/kpm.service';
import { inputDataService } from '../../services/inputData.service';

interface KPMDetailModalProps {
    isOpen: boolean;
    onClose: () => void;
    kpmId: string | null;
}

const KPMDetailModal: React.FC<KPMDetailModalProps> = ({ isOpen, onClose, kpmId }) => {
    const [activeTab, setActiveTab] = useState<'usaha' | 'prestasi' | 'permasalahan'>('usaha');
    const [kpm, setKpm] = useState<any>(null);
    const [records, setRecords] = useState<{
        usaha: any[];
        prestasi: any[];
        permasalahan: any[];
    }>({
        usaha: [],
        prestasi: [],
        permasalahan: []
    });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchData = useCallback(async () => {
        if (!kpmId) return;
        setIsLoading(true);
        setError(null);
        try {
            const [kpmData, usahaData, prestasiData, permasalahanData] = await Promise.all([
                kpmService.getSummary(kpmId),
                inputDataService.usaha.getByKpm(kpmId),
                inputDataService.prestasi.getByKpm(kpmId),
                inputDataService.permasalahan.getByKpm(kpmId)
            ]);

            setKpm(kpmData.data);
            setRecords({
                usaha: usahaData.data || [],
                prestasi: prestasiData.data || [],
                permasalahan: permasalahanData.data || []
            });
        } catch (err: any) {
            setError(err.message || 'Gagal mengambil data KPM');
        } finally {
            setIsLoading(false);
        }
    }, [kpmId]);

    useEffect(() => {
        if (isOpen && kpmId) {
            fetchData();
        } else {
            setKpm(null);
            setError(null);
        }
    }, [isOpen, kpmId, fetchData]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div
                className="bg-white dark:bg-slate-900 w-full max-w-4xl max-h-[90vh] rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col animate-in zoom-in-95 duration-200"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/50">
                    <h2 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                        <span className="material-symbols-outlined text-primary">person</span>
                        Detail Anggota KPM
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                    >
                        <span className="material-symbols-outlined text-slate-500">close</span>
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 bg-slate-50 dark:bg-slate-900/50">
                    {isLoading ? (
                        <div className="flex h-64 items-center justify-center">
                            <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
                        </div>
                    ) : error ? (
                        <div className="p-8 text-center bg-red-50 text-red-600 rounded-xl border border-red-100">
                            <p className="text-lg font-bold">Terjadi Kesalahan</p>
                            <p>{error}</p>
                        </div>
                    ) : kpm ? (
                        <div className="space-y-6">
                            {/* Profile Card */}
                            <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm">
                                <div className="flex flex-col md:flex-row gap-6 items-center md:items-start text-center md:text-left">
                                    <div className="size-20 rounded-full bg-primary text-white flex items-center justify-center text-2xl font-bold shadow-lg shadow-primary/20">
                                        {(kpm.namaLengkap || kpm.nama || 'A').substring(0, 2).toUpperCase()}
                                    </div>
                                    <div className="space-y-1 flex-1">
                                        <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-3 justify-center md:justify-start">
                                            <h3 className="text-2xl font-black text-slate-900 dark:text-white uppercase">{kpm.namaLengkap || kpm.nama}</h3>
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${kpm.status === 'aktif' ? 'bg-green-100 text-green-700' : 'bg-slate-200 text-slate-600'}`}>
                                                {kpm.status || 'AKTIF'}
                                            </span>
                                        </div>
                                        <p className="text-slate-500 dark:text-slate-400 font-mono text-sm tracking-tight">NIK: {kpm.nik}</p>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1 mt-3">
                                            <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400 justify-center md:justify-start">
                                                <span className="material-symbols-outlined text-lg">calendar_today</span>
                                                {kpm.tanggal_lahir || kpm.tanggalLahir ? new Date(kpm.tanggal_lahir || kpm.tanggalLahir).toLocaleDateString('id-ID', { dateStyle: 'long' }) : '-'}
                                            </div>
                                            <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400 justify-center md:justify-start">
                                                <span className="material-symbols-outlined text-lg">phone</span>
                                                {kpm.no_hp || kpm.noTelepon || '-'}
                                            </div>
                                            <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400 col-span-full justify-center md:justify-start">
                                                <span className="material-symbols-outlined text-lg text-primary">location_on</span>
                                                {kpm.alamat}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Stats Summary - Styled after user screenshot */}
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                <div className="p-6 rounded-2xl bg-slate-900 dark:bg-slate-800 border border-slate-800 dark:border-slate-700 shadow-xl text-center transition-transform hover:scale-[1.02]">
                                    <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3">USAHA</p>
                                    <p className="text-4xl font-black text-white">{kpm._count?.usaha ?? records.usaha.length}</p>
                                </div>
                                <div className="p-6 rounded-2xl bg-slate-900 dark:bg-slate-800 border border-slate-800 dark:border-slate-700 shadow-xl text-center transition-transform hover:scale-[1.02]">
                                    <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3">PRESTASI</p>
                                    <p className="text-4xl font-black text-white">{kpm._count?.prestasi ?? records.prestasi.length}</p>
                                </div>
                                <div className="p-6 rounded-2xl bg-slate-900 dark:bg-slate-800 border border-slate-800 dark:border-slate-700 shadow-xl text-center transition-transform hover:scale-[1.02]">
                                    <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3">MASALAH</p>
                                    <p className="text-4xl font-black text-white">{kpm._count?.permasalahan ?? records.permasalahan.length}</p>
                                </div>
                            </div>

                            {/* Tabs */}
                            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
                                <div className="flex border-b border-slate-100 dark:border-slate-700">
                                    {[
                                        { id: 'usaha', label: 'Usaha', icon: 'storefront' },
                                        { id: 'prestasi', label: 'Prestasi', icon: 'emoji_events' },
                                        { id: 'permasalahan', label: 'Isu', icon: 'report_problem' }
                                    ].map(tab => (
                                        <button
                                            key={tab.id}
                                            onClick={() => setActiveTab(tab.id as any)}
                                            className={`flex-1 flex items-center justify-center gap-2 py-4 text-sm font-bold transition-all border-b-2 cursor-pointer ${activeTab === tab.id
                                                ? 'border-primary text-primary bg-primary/5'
                                                : 'border-transparent text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
                                                }`}
                                        >
                                            <span className="material-symbols-outlined text-[20px]">{tab.icon}</span>
                                            {tab.label}
                                        </button>
                                    ))}
                                </div>
                                <div className="p-6 min-h-[300px]">
                                    {activeTab === 'usaha' && (
                                        <div className="space-y-4">
                                            {records.usaha.length === 0 ? (
                                                <div className="flex flex-col items-center justify-center py-12 text-slate-400">
                                                    <span className="material-symbols-outlined text-5xl mb-2 opacity-20">storefront</span>
                                                    <p className="text-sm italic">Belum ada data usaha.</p>
                                                </div>
                                            ) : (
                                                records.usaha.map((item: any) => (
                                                    <div key={item.id} className="p-4 rounded-xl border border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 flex justify-between items-center group hover:border-primary/30 transition-all">
                                                        <div>
                                                            <p className="font-bold text-slate-900 dark:text-white text-base group-hover:text-primary transition-colors">{item.namaUsaha || item.jenisUsaha || item.jenis_usaha}</p>
                                                            <div className="flex items-center gap-3 mt-1">
                                                                <p className="text-xs text-slate-500">Omset: <span className="font-bold text-slate-900 dark:text-white">Rp {(item.omzetBulanan || item.omset_bulanan || 0).toLocaleString()}</span></p>
                                                                <span className="text-[10px] text-slate-400 px-2 py-0.5 rounded-full bg-slate-200/50 dark:bg-slate-800 uppercase font-black">{item.status || 'AKTIF'}</span>
                                                            </div>
                                                        </div>
                                                        <span className="text-[11px] font-mono text-slate-400 bg-white dark:bg-slate-800 px-3 py-1 rounded-lg border border-slate-100 dark:border-slate-700">
                                                            {new Date(item.createdAt || item.tanggal_input).toLocaleDateString('id-ID')}
                                                        </span>
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                    )}
                                    {activeTab === 'prestasi' && (
                                        <div className="space-y-4">
                                            {records.prestasi.length === 0 ? (
                                                <div className="flex flex-col items-center justify-center py-12 text-slate-400">
                                                    <span className="material-symbols-outlined text-5xl mb-2 opacity-20">emoji_events</span>
                                                    <p className="text-sm italic">Belum ada data prestasi.</p>
                                                </div>
                                            ) : (
                                                records.prestasi.map((item: any) => (
                                                    <div key={item.id} className="p-4 rounded-xl border border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 hover:border-amber-500/30 transition-all">
                                                        <div className="flex justify-between items-start mb-2">
                                                            <p className="font-bold text-slate-900 dark:text-white text-base">{item.namaPrestasi || item.jenisPrestasi || item.jenis_prestasi}</p>
                                                            <span className="text-[10px] bg-amber-100 text-amber-700 px-3 py-1 rounded-full font-black uppercase shadow-sm">{item.tingkat || 'Nasional'}</span>
                                                        </div>
                                                        <p className="text-sm text-slate-500 italic line-clamp-2">"{item.deskripsi || item.keterangan || '-'}"</p>
                                                        <p className="mt-3 text-[10px] text-slate-400 flex items-center gap-1">
                                                            <span className="material-symbols-outlined text-[14px]">event</span>
                                                            {new Date(item.createdAt || item.tanggalPrestasi).toLocaleDateString('id-ID')}
                                                        </p>
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                    )}
                                    {activeTab === 'permasalahan' && (
                                        <div className="space-y-4">
                                            {records.permasalahan.length === 0 ? (
                                                <div className="flex flex-col items-center justify-center py-12 text-slate-400">
                                                    <span className="material-symbols-outlined text-5xl mb-2 opacity-20">report_problem</span>
                                                    <p className="text-sm italic">Belum ada data permasalahan.</p>
                                                </div>
                                            ) : (
                                                records.permasalahan.map((item: any) => (
                                                    <div key={item.id} className="p-4 rounded-xl border border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 hover:border-red-500/30 transition-all">
                                                        <div className="flex justify-between items-start mb-2">
                                                            <p className="font-bold text-slate-900 dark:text-white text-base">{item.judulMasalah || item.kategori || item.subyek}</p>
                                                            <span className={`text-[10px] px-3 py-1 rounded-full font-black uppercase shadow-sm ${item.status === 'selesai' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                                                {item.status || 'BARU'}
                                                            </span>
                                                        </div>
                                                        <p className="text-sm text-slate-500 line-clamp-2 mb-3 leading-relaxed">{item.deskripsiMasalah || item.deskripsi || item.detail}</p>
                                                        {item.solusi && (
                                                            <div className="p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700">
                                                                <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Solusi</p>
                                                                <p className="text-xs text-slate-700 dark:text-slate-300">{item.solusi}</p>
                                                            </div>
                                                        )}
                                                        <p className="mt-3 text-[10px] text-slate-400 flex items-center gap-1">
                                                            <span className="material-symbols-outlined text-[14px]">event</span>
                                                            {new Date(item.tanggalLapor || item.createdAt).toLocaleDateString('id-ID')}
                                                        </p>
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ) : null}
                </div>

                {/* Footer */}
                <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 flex justify-end">
                    <button
                        onClick={onClose}
                        className="px-8 py-2.5 rounded-xl bg-slate-900 dark:bg-slate-800 text-white text-sm font-bold hover:bg-slate-800 dark:hover:bg-slate-700 transition-all cursor-pointer shadow-lg shadow-slate-900/10"
                    >
                        Tutup
                    </button>
                </div>
            </div>
        </div>
    );
};

export default KPMDetailModal;
