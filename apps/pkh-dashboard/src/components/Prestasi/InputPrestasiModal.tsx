import React, { useState, useEffect, useCallback } from 'react';
import { kpmService } from '../../services/kpm.service';
import { inputDataService } from '../../services/inputData.service';

interface InputPrestasiModalProps {
    isOpen: boolean;
    onClose: () => void;
    kelompokId: string;
    kelompokNama?: string;
    onSuccess?: () => void;
}

const InputPrestasiModal: React.FC<InputPrestasiModalProps> = ({ isOpen, onClose, kelompokId, kelompokNama, onSuccess }) => {
    const [members, setMembers] = useState<any[]>([]);
    const [isLoadingMembers, setIsLoadingMembers] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Form State
    const [kpmId, setKpmId] = useState('');
    const [namaAnak, setNamaAnak] = useState('');
    const [namaPrestasi, setNamaPrestasi] = useState('');
    const [jenisPrestasi, setJenisPrestasi] = useState('Akademik');
    const [tingkat, setTingkat] = useState('Kecamatan');
    const [deskripsi, setDeskripsi] = useState('');

    const fetchMembers = useCallback(async () => {
        if (!isOpen || !kelompokId) return;
        setIsLoadingMembers(true);
        try {
            const resp = await kpmService.getByKelompok(kelompokId, { limit: 100 });
            setMembers(resp.data);
        } catch (err: any) {
            console.error('Failed to fetch members', err);
        } finally {
            setIsLoadingMembers(false);
        }
    }, [isOpen, kelompokId]);

    useEffect(() => {
        fetchMembers();
    }, [fetchMembers]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!kpmId || !namaPrestasi) {
            setError('Pilih anggota dan isi nama prestasi');
            return;
        }

        setIsSubmitting(true);
        setError(null);
        try {
            await inputDataService.prestasi.create(kpmId, {
                namaAnak,
                namaPrestasi,
                jenisPrestasi,
                tingkat,
                deskripsi,
            });
            onSuccess?.();
            onClose();
            // Reset form
            setKpmId('');
            setNamaAnak('');
            setNamaPrestasi('');
            setJenisPrestasi('Akademik');
            setTingkat('Kecamatan');
            setDeskripsi('');
        } catch (err: any) {
            setError(err.message || 'Gagal menyimpan data prestasi');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-[#111418]/60 backdrop-blur-sm transition-opacity">
            <div className="bg-white dark:bg-[#1a202c] w-full max-w-[720px] max-h-[90vh] flex flex-col rounded-xl shadow-2xl overflow-hidden ring-1 ring-[#e5e7eb] dark:ring-[#2a3441]">
                {/* Header */}
                <div className="flex flex-col border-b border-[#f3f4f6] dark:border-[#2a3441] px-6 py-5 bg-white dark:bg-[#1a202c] sticky top-0 z-10">
                    <div className="flex justify-between items-start mb-3">
                        <h2 className="text-[#111418] dark:text-white text-2xl font-bold">Input Data Prestasi KPM</h2>
                        <button onClick={onClose} className="text-[#9ba8b8] hover:text-[#617589] dark:hover:text-gray-200 transition-colors p-1 rounded-full hover:bg-[#f3f4f6] dark:hover:bg-gray-800">
                            <span className="material-symbols-outlined text-[24px]">close</span>
                        </button>
                    </div>
                    <div className="flex gap-3 flex-wrap">
                        <div className="flex h-8 items-center gap-x-2 rounded-lg bg-[#f0f2f4] dark:bg-[#2a3441] px-3">
                            <span className="material-symbols-outlined text-[#617589] dark:text-gray-400 text-[18px]">groups</span>
                            <p className="text-[#111418] dark:text-gray-200 text-sm font-medium">{kelompokNama || 'Kelompok'}</p>
                        </div>
                    </div>
                </div>

                {/* Body */}
                <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 sm:p-8 flex flex-col gap-6 bg-white dark:bg-[#1a202c]">
                    {error && (
                        <div className="p-4 bg-red-50 text-red-600 border border-red-200 rounded-lg text-sm font-medium">
                            {error}
                        </div>
                    )}

                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-medium text-[#111418] dark:text-gray-200"> Pilih Anggota KPM </label>
                        <select
                            className="w-full rounded-lg border border-[#dbe0e6] dark:border-[#2a3441] bg-white dark:bg-[#101922] h-12 px-4 text-[#111418] dark:text-white focus:ring-1 focus:ring-primary outline-none"
                            value={kpmId}
                            onChange={(e) => setKpmId(e.target.value)}
                            disabled={isLoadingMembers}
                        >
                            <option value="">{isLoadingMembers ? 'Memuat anggota...' : 'Pilih anggota...'}</option>
                            {members.map(m => (
                                <option key={m.id} value={m.id}>{m.namaLengkap || m.nama} ({m.nik})</option>
                            ))}
                        </select>
                    </div>

                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-medium text-[#111418] dark:text-gray-200"> Nama Anak KPM </label>
                        <input
                            className="w-full rounded-lg border border-[#dbe0e6] dark:border-[#2a3441] bg-white dark:bg-[#101922] h-12 px-4 text-[#111418] dark:text-white focus:ring-1 focus:ring-primary outline-none"
                            placeholder="Tuliskan nama lengkap anak yang meraih prestasi"
                            value={namaAnak}
                            onChange={(e) => setNamaAnak(e.target.value)}
                        />
                    </div>

                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-medium text-[#111418] dark:text-gray-200"> Nama/Judul Prestasi </label>
                        <input
                            className="w-full rounded-lg border border-[#dbe0e6] dark:border-[#2a3441] bg-white dark:bg-[#101922] h-12 px-4 text-[#111418] dark:text-white focus:ring-1 focus:ring-primary outline-none"
                            placeholder="Contoh: Juara 1 Lomba Mewarnai Tingkat Kecamatan"
                            value={namaPrestasi}
                            onChange={(e) => setNamaPrestasi(e.target.value)}
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-medium text-[#111418] dark:text-gray-200"> Kategori </label>
                            <select
                                className="w-full rounded-lg border border-[#dbe0e6] dark:border-[#2a3441] bg-white dark:bg-[#101922] h-12 px-4 text-[#111418] dark:text-white focus:ring-1 focus:ring-primary outline-none"
                                value={jenisPrestasi}
                                onChange={(e) => setJenisPrestasi(e.target.value)}
                            >
                                <option value="Akademik">Akademik</option>
                                <option value="Non-Akademik">Non-Akademik</option>
                                <option value="Seni">Seni</option>
                                <option value="Olahraga">Olahraga</option>
                                <option value="Religi">Religi</option>
                            </select>
                        </div>
                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-medium text-[#111418] dark:text-gray-200"> Tingkat </label>
                            <select
                                className="w-full rounded-lg border border-[#dbe0e6] dark:border-[#2a3441] bg-white dark:bg-[#101922] h-12 px-4 text-[#111418] dark:text-white focus:ring-1 focus:ring-primary outline-none"
                                value={tingkat}
                                onChange={(e) => setTingkat(e.target.value)}
                            >
                                <option value="Kecamatan">Kecamatan</option>
                                <option value="Kabupaten">Kabupaten</option>
                                <option value="Provinsi">Provinsi</option>
                                <option value="Nasional">Nasional</option>
                                <option value="Internasional">Internasional</option>
                            </select>
                        </div>
                    </div>

                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-medium text-[#111418] dark:text-gray-200"> Keterangan/Detail Prestasi </label>
                        <textarea
                            className="w-full rounded-lg border border-[#dbe0e6] dark:border-[#2a3441] bg-white dark:bg-[#101922] min-h-[120px] p-4 text-[#111418] dark:text-white focus:ring-1 focus:ring-primary outline-none"
                            placeholder="Jelaskan detail prestasi yang diraih..."
                            value={deskripsi}
                            onChange={(e) => setDeskripsi(e.target.value)}
                        ></textarea>
                    </div>

                    <div className="flex justify-end gap-3 pt-6 border-t border-[#f3f4f6] dark:border-[#2a3441]">
                        <button type="button" onClick={onClose} className="px-6 py-2.5 rounded-lg border border-[#dbe0e6] dark:border-[#2a3441] bg-white dark:bg-transparent text-sm font-bold text-[#111418] dark:text-white hover:bg-[#f9fafb] transition-colors">
                            BATAL
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="flex items-center gap-2 px-8 py-2.5 rounded-lg bg-primary hover:bg-blue-600 text-sm font-bold text-white shadow-md disabled:opacity-50 transition-all font-bold"
                        >
                            {isSubmitting ? 'MENYIMPAN...' : (
                                <>
                                    <span className="material-symbols-outlined text-[20px]">save</span>
                                    SIMPAN
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default InputPrestasiModal;
