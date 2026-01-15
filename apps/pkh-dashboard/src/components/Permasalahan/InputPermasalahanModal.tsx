import React, { useState, useEffect, useCallback } from 'react';
import { kpmService } from '../../services/kpm.service';
import { inputDataService } from '../../services/inputData.service';

interface InputPermasalahanModalProps {
    isOpen: boolean;
    onClose: () => void;
    kelompokId: string;
    kelompokNama?: string;
    onSuccess?: () => void;
}

const InputPermasalahanModal: React.FC<InputPermasalahanModalProps> = ({
    isOpen,
    onClose,
    kelompokId,
    kelompokNama,
    onSuccess
}) => {
    const [members, setMembers] = useState<any[]>([]);
    const [isLoadingMembers, setIsLoadingMembers] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Form state
    const [kpmId, setKpmId] = useState('');
    const [judulMasalah, setJudulMasalah] = useState('');
    const [kategori, setKategori] = useState('');
    const [keterangan, setKeterangan] = useState('');

    const fetchMembers = useCallback(async () => {
        if (!kelompokId) return;
        setIsLoadingMembers(true);
        try {
            const response = await kpmService.getByKelompok(kelompokId, { limit: 100 });
            setMembers(response.data);
        } catch (err: any) {
            console.error('Failed to fetch members:', err);
        } finally {
            setIsLoadingMembers(false);
        }
    }, [kelompokId]);

    useEffect(() => {
        if (isOpen) {
            fetchMembers();
            // Reset form when modal opens
            setKpmId('');
            setJudulMasalah('');
            setKategori('');
            setKeterangan('');
            setError(null);
        }
    }, [isOpen, fetchMembers]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!kpmId || !judulMasalah || !kategori || !keterangan) {
            setError('Semua field harus diisi');
            return;
        }

        setIsSubmitting(true);
        setError(null);
        try {
            await inputDataService.permasalahan.create(kpmId, {
                judulMasalah,
                deskripsiMasalah: keterangan,
                kategori,
                prioritas: 'sedang',
                tanggalLapor: new Date().toISOString().split('T')[0]
            });
            onSuccess?.();
            onClose();
        } catch (err: any) {
            console.error('Submit error:', err);
            const message = err.response?.data?.message || err.message || 'Gagal menyimpan data permasalahan';
            const details = err.response?.data?.details;

            if (Array.isArray(details)) {
                setError(`${message}: ${details.map((d: any) => d.message || d.field).join(', ')}`);
            } else {
                setError(message);
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="relative z-50" aria-labelledby="modal-title" role="dialog" aria-modal="true">
            <div className="fixed inset-0 bg-[#111418]/60 backdrop-blur-sm transition-opacity" onClick={onClose}></div>

            <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
                <div className="flex min-h-full items-center justify-center p-4 sm:p-6 text-center">
                    <form
                        onSubmit={handleSubmit}
                        className="bg-white dark:bg-[#1a2632] w-full max-w-[600px] flex flex-col rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 ring-1 ring-gray-200 dark:ring-gray-700 text-left"
                    >
                        <div className="flex flex-col border-b border-gray-100 dark:border-gray-700 px-6 py-5 bg-white dark:bg-[#1a2632] sticky top-0 z-10">
                            <div className="flex justify-between items-start mb-2">
                                <h2 className="text-[#111418] dark:text-white tracking-tight text-[22px] font-bold leading-tight">Input Data Permasalahan</h2>
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
                                >
                                    <span className="material-symbols-outlined text-[24px]">close</span>
                                </button>
                            </div>
                            <div className="flex h-8 shrink-0 items-center gap-x-2 rounded-lg bg-[#f0f2f4] dark:bg-gray-700/50 border border-transparent px-3 w-fit">
                                <span className="material-symbols-outlined text-gray-500 dark:text-gray-400 text-[18px]">groups</span>
                                <p className="text-[#111418] dark:text-gray-200 text-sm font-medium leading-normal">Kelompok: {kelompokNama}</p>
                            </div>
                        </div>

                        <div className="p-6 flex flex-col gap-5 bg-white dark:bg-[#1a2632]">
                            {error && (
                                <div className="p-3 bg-red-50 text-red-600 border border-red-100 rounded-lg text-sm font-medium">
                                    {error}
                                </div>
                            )}

                            <div className="flex flex-col gap-2">
                                <label className="text-[#111418] dark:text-gray-200 text-sm font-semibold">Pilih Anggota KPM</label>
                                <div className="relative">
                                    <select
                                        className="appearance-none w-full rounded-lg text-[#111418] dark:text-white border border-[#dbe0e6] dark:border-gray-600 bg-white dark:bg-[#101922] focus:border-primary focus:ring-1 focus:ring-primary h-11 px-4 text-sm transition-all"
                                        value={kpmId}
                                        onChange={(e) => setKpmId(e.target.value)}
                                        disabled={isLoadingMembers}
                                        required
                                    >
                                        <option value="">{isLoadingMembers ? 'Memuat anggota...' : '--- Pilih Anggota ---'}</option>
                                        {members.map(member => (
                                            <option key={member.id} value={member.id}>{member.namaLengkap || member.nama} ({member.nik})</option>
                                        ))}
                                    </select>
                                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-400">
                                        <span className="material-symbols-outlined text-[20px]">expand_more</span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-col gap-2">
                                <label className="text-[#111418] dark:text-gray-200 text-sm font-semibold">Judul Permasalahan</label>
                                <input
                                    type="text"
                                    className="w-full rounded-lg text-[#111418] dark:text-white border border-[#dbe0e6] dark:border-gray-600 bg-white dark:bg-[#101922] focus:border-primary focus:ring-1 focus:ring-primary h-11 px-4 text-sm transition-all"
                                    placeholder="Contoh: Kesulitan biaya sekolah, Masalah kesehatan kronis"
                                    value={judulMasalah}
                                    onChange={(e) => setJudulMasalah(e.target.value)}
                                    required
                                />
                            </div>

                            <div className="flex flex-col gap-2">
                                <label className="text-[#111418] dark:text-gray-200 text-sm font-semibold">Kategori Permasalahan</label>
                                <div className="relative">
                                    <select
                                        className="appearance-none w-full rounded-lg text-[#111418] dark:text-white border border-[#dbe0e6] dark:border-gray-600 bg-white dark:bg-[#101922] focus:border-primary focus:ring-1 focus:ring-primary h-11 px-4 text-sm transition-all"
                                        value={kategori}
                                        onChange={(e) => setKategori(e.target.value)}
                                        required
                                    >
                                        <option value="">--- Pilih Kategori ---</option>
                                        <option value="ekonomi">Ekonomi</option>
                                        <option value="kesehatan">Kesehatan</option>
                                        <option value="pendidikan">Pendidikan</option>
                                        <option value="sosial">Sosial</option>
                                        <option value="lainnya">Lainnya</option>
                                    </select>
                                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-400">
                                        <span className="material-symbols-outlined text-[20px]">expand_more</span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-col gap-2">
                                <label className="text-[#111418] dark:text-gray-200 text-sm font-semibold">Keterangan / Deskripsi</label>
                                <textarea
                                    className="w-full rounded-lg text-[#111418] dark:text-white border border-[#dbe0e6] dark:border-gray-600 bg-white dark:bg-[#101922] focus:border-primary focus:ring-1 focus:ring-primary min-h-[120px] p-4 text-sm transition-all placeholder:text-gray-400"
                                    placeholder="Jelaskan permasalahan secara detail..."
                                    value={keterangan}
                                    onChange={(e) => setKeterangan(e.target.value)}
                                    required
                                ></textarea>
                            </div>
                        </div>

                        <div className="border-t border-gray-100 dark:border-gray-700 p-6 bg-gray-50 dark:bg-[#151f28] flex justify-end gap-3 rounded-b-xl">
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-6 py-2 rounded-lg border border-[#dbe0e6] dark:border-gray-600 text-sm font-bold text-[#111418] dark:text-white hover:bg-gray-100 transition-colors"
                            >
                                BATAL
                            </button>
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="flex items-center gap-2 px-6 py-2 rounded-lg bg-primary hover:bg-blue-600 text-sm font-bold text-white transition-all disabled:opacity-50"
                            >
                                {isSubmitting ? (
                                    <>
                                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></span>
                                        MENYIMPAN...
                                    </>
                                ) : (
                                    <>
                                        <span className="material-symbols-outlined text-[18px]">save</span>
                                        SIMPAN DATA
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default InputPermasalahanModal;
