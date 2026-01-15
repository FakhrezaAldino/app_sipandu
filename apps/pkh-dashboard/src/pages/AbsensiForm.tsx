import { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { kpmService } from '../services/kpm.service';
import { kelompokService } from '../services/kelompok.service';
import { absensiService } from '../services/absensi.service';

const AbsensiForm = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const kelompokId = searchParams.get('kelompokId');

    const [absensiId, setAbsensiId] = useState<string | null>(null);
    const [isEdit, setIsEdit] = useState(false);
    const [kelompok, setKelompok] = useState<any>(null);
    const [members, setMembers] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const paramTanggal = searchParams.get('tanggal') || new Date().toISOString().slice(0, 7);
    const [tanggal] = useState(paramTanggal.length === 7 ? `${paramTanggal}-01` : paramTanggal);
    const [keterangan, setKeterangan] = useState('');

    const fetchData = useCallback(async () => {
        if (!kelompokId) {
            setError('ID Kelompok tidak ditemukan');
            setIsLoading(false);
            return;
        }

        setIsLoading(true);
        setError(null);
        try {
            // Check for existing attendance first (YYY-MM)
            const monthOnly = tanggal.slice(0, 7);
            const [kelompokResp, kpmResp, existingAbsensi] = await Promise.all([
                kelompokService.getById(kelompokId),
                kpmService.getByKelompok(kelompokId, { limit: 100 }),
                absensiService.getByKelompok(kelompokId, { date: monthOnly })
            ]);

            setKelompok(kelompokResp);

            if (existingAbsensi?.data) {
                const data = existingAbsensi.data;
                setAbsensiId(data.id);
                setIsEdit(true);
                setKeterangan(data.keterangan || '');

                // Map members with existing status
                const detailsMap = new Map<string, any>(data.details?.map((d: any) => [d.kpmId, d]) || []);

                setMembers(kpmResp.data.map((k: any) => {
                    const existingDetail = detailsMap.get(k.id);
                    return {
                        id: k.id,
                        nama: k.namaLengkap,
                        nik: k.nik,
                        status: existingDetail?.status || '',
                        keterangan: existingDetail?.keterangan || ''
                    };
                }));
            } else {
                setMembers(kpmResp.data.map((k: any) => ({
                    id: k.id,
                    nama: k.namaLengkap,
                    nik: k.nik,
                    status: '',
                    keterangan: ''
                })));
            }
        } catch (err: any) {
            setError(err.message || 'Gagal mengambil data');
        } finally {
            setIsLoading(false);
        }
    }, [kelompokId]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleStatusChange = (id: string, status: string) => {
        setMembers(prev => prev.map(m => m.id === id ? { ...m, status } : m));
    };

    const handleNoteChange = (id: string, note: string) => {
        setMembers(prev => prev.map(m => m.id === id ? { ...m, keterangan: note } : m));
    };

    const handleSubmit = async () => {
        if (!kelompokId) return;

        // Check if all members have status selected
        const unselectedMembers = members.filter(m => !m.status);
        if (unselectedMembers.length > 0) {
            setError(`Masih ada ${unselectedMembers.length} KPM yang belum dipilih status kehadirannya. Silakan pilih status untuk semua KPM sebelum menyimpan.`);
            return;
        }

        setIsSubmitting(true);
        setError(null);
        try {
            const payload = {
                tanggal,
                keterangan,
                details: members.map(m => ({
                    kpmId: m.id,
                    status: m.status,
                    keterangan: m.keterangan || null
                }))
            };

            if (isEdit && absensiId) {
                await absensiService.update(absensiId, payload);
                alert('Absensi berhasil diperbarui');
            } else {
                await absensiService.create(kelompokId, payload);
                alert('Absensi berhasil disimpan');
            }
            navigate('/absensi');
        } catch (err: any) {
            setError(err.message || 'Gagal menyimpan absensi');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex h-96 items-center justify-center">
                <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
            </div>
        );
    }

    if (error && !kelompok) {
        return (
            <div className="p-8 text-center bg-red-50 text-red-600 rounded-xl border border-red-100 max-w-2xl mx-auto mt-10">
                <p className="text-lg font-bold">Terjadi Kesalahan</p>
                <p>{error}</p>
                <Link to="/absensi" className="mt-4 inline-block text-primary hover:underline font-medium"> Kembali ke Daftar Absensi </Link>
            </div>
        );
    }

    return (
        <div className="flex flex-col min-h-screen">
            <div className="mx-auto w-full max-w-6xl flex flex-col gap-6 p-4 md:p-0 flex-1 pb-24">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
                    <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2 text-sm text-slate-500 mb-2">
                            <Link to="/absensi" className="hover:text-primary transition-colors">Absensi</Link>
                            <span>/</span>
                            <span className="text-slate-900 dark:text-white font-bold">Isi Absensi</span>
                        </div>
                        <h1 className="text-[#111418] dark:text-white text-3xl font-black leading-tight tracking-[-0.033em]">
                            {isEdit ? 'Edit Absensi KPM' : 'Isi Absensi KPM'}
                        </h1>
                        <p className="text-[#617589] dark:text-gray-400 text-base font-normal">
                            {kelompok?.namaKelompok || kelompok?.nama} - {kelompok?.desa} | Absensi Bulan: <span className="text-primary font-bold">{new Date(tanggal).toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}</span>
                        </p>
                    </div>
                </div>

                {/* Stats Summary */}
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
                        <p className="text-xs font-bold text-slate-500 uppercase">Total KPM</p>
                        <p className="text-2xl font-black text-slate-900 dark:text-white">{members.length}</p>
                    </div>
                    <div className="p-4 rounded-xl border border-gray-300 bg-gray-50 shadow-sm dark:border-gray-700 dark:bg-gray-800">
                        <p className="text-xs font-bold text-gray-500 uppercase">Belum Dipilih</p>
                        <p className="text-2xl font-black text-gray-600 dark:text-gray-400">{members.filter(m => !m.status).length}</p>
                    </div>
                    <div className="p-4 rounded-xl border border-green-200 bg-green-50 shadow-sm dark:border-green-900/20 dark:bg-green-900/10">
                        <p className="text-xs font-bold text-green-600 uppercase">Hadir</p>
                        <p className="text-2xl font-black text-green-700 dark:text-green-400">{members.filter(m => m.status === 'hadir').length}</p>
                    </div>
                    <div className="p-4 rounded-xl border border-yellow-200 bg-yellow-50 shadow-sm dark:border-yellow-900/20 dark:bg-yellow-900/10">
                        <p className="text-xs font-bold text-yellow-600 uppercase">Izin/Sakit</p>
                        <p className="text-2xl font-black text-yellow-700 dark:text-yellow-400">{members.filter(m => m.status === 'izin' || m.status === 'sakit').length}</p>
                    </div>
                    <div className="p-4 rounded-xl border border-red-200 bg-red-50 shadow-sm dark:border-red-900/20 dark:bg-red-900/10">
                        <p className="text-xs font-bold text-red-600 uppercase">Alpha</p>
                        <p className="text-2xl font-black text-red-700 dark:text-red-400">{members.filter(m => m.status === 'alpha').length}</p>
                    </div>
                </div>

                {error && (
                    <div className="p-4 bg-red-50 text-red-600 border border-red-200 rounded-lg text-sm font-medium">
                        {error}
                    </div>
                )}

                {/* Table Section */}
                <div className="flex flex-col rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="border-b border-slate-100 bg-slate-50/50 dark:border-slate-800 dark:bg-slate-800/50">
                                <tr>
                                    <th className="px-6 py-4 font-bold text-slate-500 uppercase text-xs w-16">NO</th>
                                    <th className="px-6 py-4 font-bold text-slate-500 uppercase text-xs">NAMA KPM</th>
                                    <th className="px-6 py-4 font-bold text-slate-500 uppercase text-xs">STATUS KEHADIRAN</th>
                                    <th className="px-6 py-4 font-bold text-slate-500 uppercase text-xs">KETERANGAN</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                {members.map((member, index) => (
                                    <tr key={member.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                        <td className="px-6 py-4 text-slate-500">{index + 1}</td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col">
                                                <span className="font-bold text-slate-900 dark:text-white capitalize">{member.nama}</span>
                                                <span className="text-xs text-slate-500 font-mono">{member.nik}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-wrap items-center gap-2">
                                                {[
                                                    { id: 'hadir', label: 'Hadir', color: 'green' },
                                                    { id: 'izin', label: 'Izin', color: 'blue' },
                                                    { id: 'sakit', label: 'Sakit', color: 'yellow' },
                                                    { id: 'alpha', label: 'Alpha', color: 'red' }
                                                ].map(s => (
                                                    <button
                                                        key={s.id}
                                                        onClick={() => handleStatusChange(member.id, s.id)}
                                                        className={`px-3 py-1 rounded-full text-xs font-bold border transition-all cursor-pointer ${member.status === s.id
                                                            ? `bg-${s.color}-100 border-${s.color}-200 text-${s.color}-700 dark:bg-${s.color}-900/40`
                                                            : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300 dark:bg-slate-800 dark:border-slate-700'
                                                            }`}
                                                    >
                                                        {s.label}
                                                    </button>
                                                ))}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <input
                                                type="text"
                                                placeholder="Catatan..."
                                                className="w-full rounded-lg border-slate-200 bg-slate-50/50 px-3 py-1.5 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary dark:border-slate-700 dark:bg-slate-800 dark:text-white transition-all"
                                                value={member.keterangan}
                                                onChange={(e) => handleNoteChange(member.id, e.target.value)}
                                            />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Additional Note */}
                <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                    <label className="text-sm font-bold text-slate-900 dark:text-white mb-2 block">Keterangan Tambahan Pertemuan (Opsional)</label>
                    <textarea
                        className="w-full h-24 rounded-xl border-slate-200 bg-slate-50/50 p-4 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                        placeholder="Contoh: Pembahasan modul kesehatan lingkungan..."
                        value={keterangan}
                        onChange={(e) => setKeterangan(e.target.value)}
                    ></textarea>
                </div>
            </div>

            {/* Sticky Footer */}
            <div className="fixed bottom-0 left-0 right-0 border-t border-slate-200 bg-white/80 backdrop-blur-md p-4 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] dark:border-slate-800 dark:bg-[#1a202c]/80 z-20">
                <div className="mx-auto flex max-w-6xl justify-end gap-4">
                    <button
                        onClick={() => navigate('/absensi')}
                        className="px-6 py-3 text-sm font-bold text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-colors"
                    >
                        Batal
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={isSubmitting}
                        className="flex items-center gap-2 rounded-xl bg-primary px-8 py-3 text-sm font-bold text-white shadow-lg shadow-primary/20 hover:bg-blue-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isSubmitting ? (
                            <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                        ) : (
                            <span className="material-symbols-outlined text-[20px]">save</span>
                        )}
                        SIMPAN ABSENSI
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AbsensiForm;