import React, { useState, useEffect } from 'react';
import { adminApi } from '../../services/adminApi';
import type { UserDTO } from '../../types/api';

interface PendampingModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess?: () => void;
    pendamping?: UserDTO | null;
}

const PendampingModal: React.FC<PendampingModalProps> = ({ isOpen, onClose, onSuccess, pendamping }) => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [nik, setNik] = useState('');
    const [noHp, setNoHp] = useState('');
    const [wilayahBinaan, setWilayahBinaan] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Reset state when modal opens/closes
    useEffect(() => {
        if (isOpen) {
            if (pendamping) {
                // Edit mode - name and email
                setName(pendamping.name);
                setEmail(pendamping.email);
                // Profile fields might need to be fetched or passed if available in UserDTO
                // For now we'll leave them as is or reset if not available
                setNik('');
                setNoHp('');
                setWilayahBinaan('');
            } else {
                // Add mode - reset everything
                setName('');
                setEmail('');
                setNik('');
                setNoHp('');
                setWilayahBinaan('');
                setError(null);
            }
        }
    }, [pendamping, isOpen]);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        try {
            if (pendamping) {
                // Update
                await adminApi.updatePendamping(pendamping.id, { name, email });
            } else {
                // Create
                const response = await adminApi.createPendamping({
                    name,
                    email,
                    nik,
                    no_hp: noHp,
                    wilayah_binaan: wilayahBinaan
                } as any);

                if (!response.success) {
                    throw new Error(response.message || 'Gagal menambahkan pendamping');
                }
            }
            onSuccess?.();
            onClose();
        } catch (err: any) {
            setError(err.response?.data?.error || err.message || 'Terjadi kesalahan');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="bg-white dark:bg-[#1c2936] w-full max-w-md rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                <div className="flex items-center justify-between px-6 py-4 border-b border-[#f0f2f4] dark:border-[#2a3b4d]">
                    <h3 className="text-lg font-bold text-[#111418] dark:text-white">
                        {pendamping ? 'Edit Pendamping' : 'Tambah Pendamping'}
                    </h3>
                    <button onClick={onClose} className="text-[#617589] hover:text-[#111418] dark:text-slate-400 dark:hover:text-white transition-colors">
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-4">
                    {error && (
                        <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm border border-red-100 dark:bg-red-900/20 dark:border-red-900/30 dark:text-red-400">
                            {error}
                        </div>
                    )}

                    <div className="flex flex-col gap-1.5">
                        <label className="text-sm font-semibold text-[#111418] dark:text-slate-200">Nama Lengkap</label>
                        <input
                            className="w-full rounded-lg border border-[#e5e7eb] dark:border-[#2a3b4d] bg-white dark:bg-[#151e29] px-3 py-2.5 text-sm dark:text-white outline-none focus:ring-2 focus:ring-primary/20 transition-all font-inter"
                            placeholder="Contoh: Ahmad Sulaiman"
                            type="text"
                            required
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            disabled={isLoading}
                        />
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <label className="text-sm font-semibold text-[#111418] dark:text-slate-200">Email</label>
                        <input
                            className="w-full rounded-lg border border-[#e5e7eb] dark:border-[#2a3b4d] bg-white dark:bg-[#151e29] px-3 py-2.5 text-sm dark:text-white outline-none focus:ring-2 focus:ring-primary/20 transition-all font-inter"
                            placeholder="email@pkh.go.id"
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            disabled={isLoading || !!pendamping}
                        />
                    </div>

                    {!pendamping && (
                        <>
                            <div className="flex flex-col gap-1.5">
                                <label className="text-sm font-semibold text-[#111418] dark:text-slate-200">NIK (Sebagai Password Default)</label>
                                <input
                                    className="w-full rounded-lg border border-[#e5e7eb] dark:border-[#2a3b4d] bg-white dark:bg-[#151e29] px-3 py-2.5 text-sm dark:text-white outline-none focus:ring-2 focus:ring-primary/20 transition-all font-inter"
                                    placeholder="16 digit NIK"
                                    type="text"
                                    required
                                    maxLength={16}
                                    value={nik}
                                    onChange={(e) => setNik(e.target.value.replace(/\D/g, ''))}
                                    disabled={isLoading}
                                />
                            </div>

                            <div className="flex flex-col gap-1.5">
                                <label className="text-sm font-semibold text-[#111418] dark:text-slate-200">No. HP</label>
                                <input
                                    className="w-full rounded-lg border border-[#e5e7eb] dark:border-[#2a3b4d] bg-white dark:bg-[#151e29] px-3 py-2.5 text-sm dark:text-white outline-none focus:ring-2 focus:ring-primary/20 transition-all font-inter"
                                    placeholder="08xxxxxxxxxx"
                                    type="tel"
                                    required
                                    value={noHp}
                                    onChange={(e) => setNoHp(e.target.value.replace(/\D/g, ''))}
                                    disabled={isLoading}
                                />
                            </div>

                            <div className="flex flex-col gap-1.5">
                                <label className="text-sm font-semibold text-[#111418] dark:text-slate-200">Wilayah Binaan</label>
                                <input
                                    className="w-full rounded-lg border border-[#e5e7eb] dark:border-[#2a3b4d] bg-white dark:bg-[#151e29] px-3 py-2.5 text-sm dark:text-white outline-none focus:ring-2 focus:ring-primary/20 transition-all font-inter"
                                    placeholder="Contoh: Kecamatan Sukajadi"
                                    type="text"
                                    required
                                    value={wilayahBinaan}
                                    onChange={(e) => setWilayahBinaan(e.target.value)}
                                    disabled={isLoading}
                                />
                            </div>
                        </>
                    )}

                    <div className="flex justify-end gap-3 mt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={isLoading}
                            className="px-4 py-2 text-sm font-bold text-[#617589] hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg transition-all"
                        >
                            BATAL
                        </button>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="px-6 py-2.5 text-sm font-bold text-white bg-primary hover:bg-blue-600 rounded-lg shadow-md transition-all flex items-center gap-2"
                        >
                            {isLoading ? (
                                <>
                                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                                    <span>MENYIMPAN...</span>
                                </>
                            ) : (
                                <>
                                    <span className="material-symbols-outlined text-[18px]">save</span>
                                    <span>{pendamping ? 'SIMPAN PERUBAHAN' : 'TAMBAH PENDAMPING'}</span>
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default PendampingModal;
