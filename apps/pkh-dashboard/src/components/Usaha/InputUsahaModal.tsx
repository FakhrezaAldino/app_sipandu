
import React, { useState, useEffect, useCallback } from 'react';
import { kpmService } from '../../services/kpm.service';
import { inputDataService } from '../../services/inputData.service';

interface InputUsahaModalProps {
    isOpen: boolean;
    onClose: () => void;
    kelompokId: string;
    kelompokNama?: string;
    onSuccess?: () => void;
    editData?: any;
}

// Helper: Format number to Rupiah display (with thousand separators)
const formatRupiah = (value: string | number): string => {
    const numStr = String(value).replace(/\D/g, '');
    if (!numStr) return '';
    return new Intl.NumberFormat('id-ID').format(Number(numStr));
};

// Helper: Parse formatted string back to raw number
const parseRupiah = (formatted: string): string => {
    return formatted.replace(/\D/g, '');
};

// Smart Currency Input Component
const CurrencyInput: React.FC<{
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    maxValue?: number;
}> = ({ value, onChange, placeholder = '0', maxValue = 9999999999999 }) => {
    const [displayValue, setDisplayValue] = useState(formatRupiah(value));

    useEffect(() => {
        setDisplayValue(formatRupiah(value));
    }, [value]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const raw = parseRupiah(e.target.value);
        if (raw && Number(raw) > maxValue) {
            return; // Prevent exceeding max value
        }
        setDisplayValue(formatRupiah(raw));
        onChange(raw);
    };

    return (
        <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-medium">Rp</span>
            <input
                type="text"
                inputMode="numeric"
                className="w-full rounded-lg border border-slate-200 dark:border-gray-600 bg-white dark:bg-slate-800 p-3 pl-10 text-sm focus:ring-1 focus:ring-primary outline-none dark:text-white"
                placeholder={placeholder}
                value={displayValue}
                onChange={handleChange}
            />
        </div>
    );
};

const InputUsahaModal: React.FC<InputUsahaModalProps> = ({ isOpen, onClose, kelompokId, kelompokNama, onSuccess, editData }) => {
    const [members, setMembers] = useState<any[]>([]);
    const [isLoadingMembers, setIsLoadingMembers] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Form State
    const [kpmId, setKpmId] = useState('');
    const [namaUsaha, setNamaUsaha] = useState('');
    const [jenisUsaha, setJenisUsaha] = useState('');
    const [deskripsi, setDeskripsi] = useState('');
    const [modalAwal, setModalAwal] = useState('');
    const [omzet, setOmzet] = useState('');

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

    // Initialize/Reset Form
    useEffect(() => {
        if (isOpen && editData) {
            setKpmId(editData.kpmId || editData.kpm?.id || '');
            setNamaUsaha(editData.namaUsaha || '');
            setJenisUsaha(editData.jenisUsaha || '');
            setDeskripsi(editData.deskripsi || '');
            setModalAwal(editData.modalAwal || '');
            setOmzet(editData.omzetBulanan || '');
        } else if (isOpen) {
            setKpmId('');
            setNamaUsaha('');
            setJenisUsaha('');
            setDeskripsi('');
            setModalAwal('');
            setOmzet('');
        }
    }, [isOpen, editData]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Basic Validation
        if (!namaUsaha || !jenisUsaha || (!editData && !kpmId)) {
            setError(editData ? 'Isi nama dan jenis usaha' : 'Pilih anggota dan isi nama serta jenis usaha');
            return;
        }

        setIsSubmitting(true);
        setError(null);
        try {
            const payload = {
                namaUsaha,
                jenisUsaha,
                deskripsi,
                modalAwal: modalAwal || undefined,
                omzetBulanan: omzet || undefined,
                status: editData?.status || 'aktif'
            };

            if (editData) {
                await inputDataService.usaha.update(editData.id, payload);
            } else {
                await inputDataService.usaha.create(kpmId, payload);
            }

            onSuccess?.();
            onClose();
        } catch (err: any) {
            setError(err.message || 'Gagal menyimpan data usaha');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="relative z-50">
            <div className="fixed inset-0 bg-[#111418]/60 backdrop-blur-sm transition-opacity" onClick={onClose}></div>
            <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
                <div className="flex min-h-full items-center justify-center p-4 sm:p-6 text-center">
                    <form
                        onSubmit={handleSubmit}
                        className="bg-white dark:bg-[#1a2632] w-full max-w-[720px] max-h-[90vh] flex flex-col rounded-xl shadow-2xl overflow-hidden text-left"
                    >
                        {/* Header */}
                        <div className="flex flex-col border-b border-gray-100 dark:border-gray-700 px-6 py-5 sticky top-0 z-10 bg-inherit">
                            <div className="flex justify-between items-start mb-3">
                                <h2 className="text-[#111418] dark:text-white text-2xl font-bold">
                                    {editData ? 'Edit Data Usaha KPM' : 'Input Data Usaha KPM'}
                                </h2>
                                <button type="button" onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
                                    <span className="material-symbols-outlined text-[24px]">close</span>
                                </button>
                            </div>
                            <div className="flex gap-3 flex-wrap">
                                <div className="flex h-8 items-center gap-x-2 rounded-lg bg-slate-100 dark:bg-slate-800 px-3">
                                    <span className="material-symbols-outlined text-gray-500 text-[18px]">groups</span>
                                    <p className="text-slate-700 dark:text-gray-200 text-sm font-medium">{kelompokNama || 'Kelompok'}</p>
                                </div>
                                {editData && (
                                    <div className="flex h-8 items-center gap-x-2 rounded-lg bg-blue-50 dark:bg-blue-900/40 px-3 border border-blue-100 dark:border-blue-800">
                                        <span className="material-symbols-outlined text-blue-500 text-[18px]">person</span>
                                        <p className="text-blue-700 dark:text-blue-300 text-sm font-bold">
                                            {editData.kpm?.namaLengkap || editData.kpm?.nama}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Content */}
                        <div className="flex-1 overflow-y-auto p-6 sm:p-8 flex flex-col gap-6">
                            {error && (
                                <div className="p-4 bg-red-50 text-red-600 border border-red-200 rounded-lg text-sm font-medium">
                                    {error}
                                </div>
                            )}

                            {/* Pilih Anggota */}
                            {!editData && (
                                <div className="flex flex-col gap-2">
                                    <label className="text-sm font-medium text-slate-700 dark:text-gray-200"> Pilih Anggota KPM </label>
                                    <select
                                        className="w-full rounded-lg border border-slate-200 dark:border-gray-600 bg-white dark:bg-slate-800 p-3 text-sm focus:ring-1 focus:ring-primary outline-none dark:text-white disabled:opacity-60"
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
                            )}

                            {/* Nama Usaha */}
                            <div className="flex flex-col gap-2">
                                <label className="text-sm font-medium text-slate-700 dark:text-gray-200"> Nama Usaha </label>
                                <input
                                    className="w-full rounded-lg border border-slate-200 dark:border-gray-600 bg-white dark:bg-slate-800 p-3 text-sm focus:ring-1 focus:ring-primary outline-none dark:text-white"
                                    placeholder="Contoh: Toko Berkah, Bengkel Maju..."
                                    value={namaUsaha}
                                    onChange={(e) => setNamaUsaha(e.target.value)}
                                    required
                                />
                            </div>

                            {/* Jenis Usaha */}
                            <div className="flex flex-col gap-2">
                                <label className="text-sm font-medium text-slate-700 dark:text-gray-200"> Jenis Usaha </label>
                                <input
                                    className="w-full rounded-lg border border-slate-200 dark:border-gray-600 bg-white dark:bg-slate-800 p-3 text-sm focus:ring-1 focus:ring-primary outline-none dark:text-white"
                                    placeholder="Contoh: Warung Kelontong, Ternak Lele..."
                                    value={jenisUsaha}
                                    onChange={(e) => setJenisUsaha(e.target.value)}
                                    required
                                />
                            </div>

                            {/* Modal Awal & Omzet */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="flex flex-col gap-2">
                                    <label className="text-sm font-medium text-slate-700 dark:text-gray-200"> Modal Awal </label>
                                    <CurrencyInput
                                        value={modalAwal}
                                        onChange={setModalAwal}
                                        placeholder="0"
                                        maxValue={9999999999999}
                                    />
                                    <p className="text-[10px] text-gray-500">Maks: 9,999,999,999,999</p>
                                </div>
                                <div className="flex flex-col gap-2">
                                    <label className="text-sm font-medium text-slate-700 dark:text-gray-200"> Estimasi Omzet/Bulan </label>
                                    <CurrencyInput
                                        value={omzet}
                                        onChange={setOmzet}
                                        placeholder="0"
                                        maxValue={9999999999999}
                                    />
                                    <p className="text-[10px] text-gray-500">Maks: 9,999,999,999,999</p>
                                </div>
                            </div>

                            {/* Deskripsi */}
                            <div className="flex flex-col gap-2">
                                <label className="text-sm font-medium text-slate-700 dark:text-gray-200"> Keterangan/Perkembangan Usaha </label>
                                <textarea
                                    className="w-full rounded-lg border border-slate-200 dark:border-gray-600 bg-white dark:bg-slate-800 p-3 text-sm focus:ring-1 focus:ring-primary outline-none min-h-[100px] dark:text-white"
                                    placeholder="Jelaskan kondisi usaha saat ini..."
                                    value={deskripsi}
                                    onChange={(e) => setDeskripsi(e.target.value)}
                                ></textarea>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="border-t border-gray-100 dark:border-gray-700 p-6 bg-slate-50 dark:bg-[#151f28] flex justify-end gap-3">
                            <button type="button" onClick={onClose} className="px-6 py-2.5 rounded-lg border border-slate-200 bg-white dark:bg-slate-800 text-sm font-bold hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors dark:text-white">
                                BATAL
                            </button>
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="flex items-center gap-2 px-8 py-2.5 rounded-lg bg-primary hover:bg-blue-600 text-sm font-bold text-white shadow-md transition-all disabled:opacity-50"
                            >
                                {isSubmitting ? 'MENYIMPAN...' : (
                                    <>
                                        <span className="material-symbols-outlined text-[20px]">save</span>
                                        {editData ? 'PERBARUI' : 'SIMPAN'}
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

export default InputUsahaModal;
