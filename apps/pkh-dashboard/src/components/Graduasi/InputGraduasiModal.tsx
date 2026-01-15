import React, { useState, useEffect, useCallback } from 'react';
import { kpmService } from '../../services/kpm.service';
import { inputDataService } from '../../services/inputData.service';

interface InputGraduasiModalProps {
    isOpen: boolean;
    onClose: () => void;
    kelompokId: string;
    kelompokNama?: string;
    initialData?: any;
    onSuccess: () => void;
}

const InputGraduasiModal: React.FC<InputGraduasiModalProps> = ({
    isOpen,
    onClose,
    kelompokId,
    kelompokNama,
    initialData,
    onSuccess
}) => {
    const isEditMode = !!initialData;
    const [members, setMembers] = useState<any[]>([]);
    const [isLoadingMembers, setIsLoadingMembers] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        kpmId: '',
        jenisGraduasi: 'kepesertaan',
        tanggal: new Date().toISOString().split('T')[0],
        keterangan: '',
    });

    const fetchMembers = useCallback(async () => {
        if (!isOpen || !kelompokId) return;
        setIsLoadingMembers(true);
        try {
            const response = await kpmService.getByKelompok(kelompokId);
            setMembers(response.data || response);
        } catch (err: any) {
            console.error('Error fetching members:', err);
        } finally {
            setIsLoadingMembers(false);
        }
    }, [isOpen, kelompokId]);

    useEffect(() => {
        if (isOpen) {
            if (!initialData) {
                fetchMembers();
            }

            if (initialData) {
                setFormData({
                    kpmId: initialData.kpmId,
                    jenisGraduasi: initialData.jenisGraduasi,
                    tanggal: initialData.tanggalGraduasi ? new Date(initialData.tanggalGraduasi).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
                    keterangan: initialData.alasanGraduasi || '',
                });
            } else {
                setFormData({
                    kpmId: '',
                    jenisGraduasi: 'kepesertaan',
                    tanggal: new Date().toISOString().split('T')[0],
                    keterangan: '',
                });
            }
            setError(null);
        }
    }, [isOpen, fetchMembers, initialData]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.kpmId && !isEditMode) {
            setError('Semua field harus diisi');
            return;
        }
        if (!formData.tanggal || !formData.keterangan) {
            setError('Semua field harus diisi');
            return;
        }

        setIsSubmitting(true);
        setError(null);
        try {
            if (isEditMode) {
                await inputDataService.graduasi.update(initialData.id, {
                    tanggalGraduasi: formData.tanggal,
                    alasanGraduasi: formData.keterangan,
                    jenisGraduasi: formData.jenisGraduasi as 'kepesertaan' | 'alami' | 'mandiri',
                    catatan: formData.keterangan
                });
            } else {
                await inputDataService.graduasi.create(formData.kpmId, {
                    tanggalGraduasi: formData.tanggal,
                    alasanGraduasi: formData.keterangan,
                    jenisGraduasi: formData.jenisGraduasi as 'kepesertaan' | 'alami' | 'mandiri',
                    catatan: formData.keterangan
                });
            }
            onSuccess();
            onClose();
        } catch (err: any) {
            setError(err.message || 'Gagal menyimpan data graduasi');
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
                        className="bg-white dark:bg-[#1a2632] w-full max-w-[720px] max-h-[90vh] flex flex-col rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 ring-1 ring-gray-200 dark:ring-gray-700 text-left"
                    >
                        {/* Header */}
                        <div className="flex flex-col border-b border-gray-100 dark:border-gray-700 px-6 py-5 bg-white dark:bg-[#1a2632] sticky top-0 z-10">
                            <div className="flex justify-between items-start mb-3">
                                <h2 className="text-[#111418] dark:text-white tracking-tight text-[24px] font-bold leading-tight">
                                    {isEditMode ? 'Edit Data Graduasi KPM' : 'Input Data Graduasi KPM'}
                                </h2>
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="text-gray-400 hover:text-gray-600 dark:text-gray-400 dark:hover:text-gray-200 transition-colors p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
                                >
                                    <span className="material-symbols-outlined text-[24px]">close</span>
                                </button>
                            </div>
                            <div className="flex gap-3 flex-wrap">
                                <div className="flex h-8 shrink-0 items-center justify-center gap-x-2 rounded-lg bg-[#f0f2f4] dark:bg-gray-700/50 border border-transparent dark:border-gray-600 px-3">
                                    <span className="material-symbols-outlined text-gray-500 dark:text-gray-400 text-[18px]">groups</span>
                                    <p className="text-[#111418] dark:text-gray-200 text-sm font-medium leading-normal">Kelompok: {kelompokNama}</p>
                                </div>
                            </div>
                        </div>

                        {/* Content */}
                        <div className="flex-1 overflow-y-auto modal-content p-6 sm:p-8 flex flex-col gap-6 bg-white dark:bg-[#1a2632]">
                            {error && (
                                <div className="p-4 bg-red-50 text-red-600 border border-red-100 rounded-lg text-sm">
                                    {error}
                                </div>
                            )}

                            {/* Pilih Anggota KPM */}
                            <div className="flex flex-col gap-2">
                                <label className="text-[#111418] dark:text-gray-200 text-sm font-medium leading-normal">
                                    Anggota KPM
                                </label>
                                {isEditMode ? (
                                    <div className="w-full rounded-lg bg-gray-100 dark:bg-gray-800 border border-[#dbe0e6] dark:border-gray-600 px-4 py-3 text-[#111418] dark:text-white text-base font-medium">
                                        {initialData?.kpm?.namaLengkap || initialData?.kpm?.nama} ({initialData?.kpm?.nik})
                                    </div>
                                ) : (
                                    <div className="relative w-full">
                                        <select
                                            required
                                            className="appearance-none flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-[#111418] dark:text-white border border-[#dbe0e6] dark:border-gray-600 bg-white dark:bg-[#101922] focus:border-primary focus:ring-1 focus:ring-primary h-12 px-4 pr-10 text-base font-normal leading-normal transition-shadow"
                                            value={formData.kpmId}
                                            onChange={(e) => setFormData({ ...formData, kpmId: e.target.value })}
                                        >
                                            <option value="" disabled>{isLoadingMembers ? 'Loading...' : 'Pilih anggota...'}</option>
                                            {members.map((member) => (
                                                <option key={member.id} value={member.id}>
                                                    {member.namaLengkap || member.nama} ({member.nik})
                                                </option>
                                            ))}
                                        </select>
                                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-[#617589] dark:text-gray-400">
                                            <span className="material-symbols-outlined">expand_more</span>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Jenis Graduasi */}
                            <div className="flex flex-col gap-2">
                                <label className="text-[#111418] dark:text-gray-200 text-sm font-medium leading-normal">
                                    Jenis Graduasi
                                </label>
                                <div className="grid grid-cols-3 gap-3">
                                    <label className={`flex items-center justify-center gap-2 p-3 rounded-lg border cursor-pointer transition-all ${formData.jenisGraduasi === 'kepesertaan'
                                        ? 'border-primary bg-blue-50 dark:bg-blue-900/20 text-primary'
                                        : 'border-[#dbe0e6] dark:border-gray-600 text-gray-600'
                                        }`}>
                                        <input
                                            type="radio"
                                            className="sr-only"
                                            name="jenisGraduasi"
                                            value="kepesertaan"
                                            checked={formData.jenisGraduasi === 'kepesertaan'}
                                            onChange={(e) => setFormData({ ...formData, jenisGraduasi: e.target.value })}
                                        />
                                        <span className="text-sm font-medium text-inherit text-center">Kepesertaan</span>
                                    </label>
                                    <label className={`flex items-center justify-center gap-2 p-3 rounded-lg border cursor-pointer transition-all ${formData.jenisGraduasi === 'alami'
                                        ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20 text-orange-600'
                                        : 'border-[#dbe0e6] dark:border-gray-600 text-gray-600'
                                        }`}>
                                        <input
                                            type="radio"
                                            className="sr-only"
                                            name="jenisGraduasi"
                                            value="alami"
                                            checked={formData.jenisGraduasi === 'alami'}
                                            onChange={(e) => setFormData({ ...formData, jenisGraduasi: e.target.value })}
                                        />
                                        <span className="text-sm font-medium text-inherit text-center">Alami</span>
                                    </label>
                                    <label className={`flex items-center justify-center gap-2 p-3 rounded-lg border cursor-pointer transition-all ${formData.jenisGraduasi === 'mandiri'
                                        ? 'border-green-500 bg-green-50 dark:bg-green-900/20 text-green-600'
                                        : 'border-[#dbe0e6] dark:border-gray-600 text-gray-600'
                                        }`}>
                                        <input
                                            type="radio"
                                            className="sr-only"
                                            name="jenisGraduasi"
                                            value="mandiri"
                                            checked={formData.jenisGraduasi === 'mandiri'}
                                            onChange={(e) => setFormData({ ...formData, jenisGraduasi: e.target.value })}
                                        />
                                        <span className="text-sm font-medium text-inherit text-center">Mandiri</span>
                                    </label>
                                </div>
                            </div>

                            {/* Tanggal Graduasi */}
                            <div className="flex flex-col gap-2">
                                <label className="text-[#111418] dark:text-gray-200 text-sm font-medium leading-normal">
                                    Tanggal Graduasi
                                </label>
                                <div className="relative w-full flex rounded-lg shadow-sm">
                                    <input
                                        required
                                        className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-l-lg text-[#111418] dark:text-white border border-[#dbe0e6] dark:border-gray-600 bg-white dark:bg-[#101922] focus:border-primary focus:ring-1 focus:ring-primary h-12 px-4 text-base font-normal leading-normal z-0"
                                        type="date"
                                        value={formData.tanggal}
                                        onChange={(e) => setFormData({ ...formData, tanggal: e.target.value })}
                                    />
                                    <div className="bg-gray-50 dark:bg-gray-700 border border-l-0 border-[#dbe0e6] dark:border-gray-600 rounded-r-lg px-3 flex items-center justify-center">
                                        <span className="material-symbols-outlined text-[#617589] dark:text-gray-300">calendar_today</span>
                                    </div>
                                </div>
                            </div>

                            {/* Deskripsi Graduasi */}
                            <div className="flex flex-col gap-2">
                                <label className="text-[#111418] dark:text-gray-200 text-sm font-medium leading-normal">
                                    Deskripsi Graduasi
                                </label>
                                <textarea
                                    required
                                    className="form-textarea flex w-full min-w-0 flex-1 resize-none rounded-lg text-[#111418] dark:text-white border border-[#dbe0e6] dark:border-gray-600 bg-white dark:bg-[#101922] focus:border-primary focus:ring-1 focus:ring-primary min-h-[140px] p-4 text-base font-normal leading-normal placeholder:text-gray-400"
                                    placeholder="Jelaskan alasan graduasi..."
                                    value={formData.keterangan}
                                    onChange={(e) => setFormData({ ...formData, keterangan: e.target.value })}
                                    maxLength={500}
                                ></textarea>
                                <p className="text-xs text-gray-500 dark:text-gray-400 text-right">{formData.keterangan.length}/500 karakter</p>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="border-t border-gray-100 dark:border-gray-700 p-6 bg-gray-50 dark:bg-[#151f28] flex justify-end gap-3 rounded-b-xl">
                            <button
                                type="button"
                                onClick={onClose}
                                className="flex items-center justify-center px-6 py-2.5 rounded-lg border border-[#dbe0e6] dark:border-gray-600 bg-white dark:bg-transparent text-sm font-bold text-[#111418] dark:text-white hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer"
                                disabled={isSubmitting}
                            >
                                BATAL
                            </button>
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg bg-primary hover:bg-blue-600 text-sm font-bold text-white shadow-sm transition-all cursor-pointer disabled:opacity-50"
                            >
                                {isSubmitting ? (
                                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                                ) : (
                                    <span className="material-symbols-outlined text-[20px]">save</span>
                                )}
                                {isSubmitting ? 'MENYIMPAN...' : 'SIMPAN'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default InputGraduasiModal;
