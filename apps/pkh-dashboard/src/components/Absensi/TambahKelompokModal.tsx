import React, { useState } from 'react';
import { kelompokService } from '../../services/kelompok.service';

interface TambahKelompokModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess?: () => void;
}

const TambahKelompokModal: React.FC<TambahKelompokModalProps> = ({ isOpen, onClose, onSuccess }) => {
    const [nama, setNama] = useState('');
    const [kecamatan, setKecamatan] = useState('');
    const [desa, setDesa] = useState('');
    const [kabupaten, setKabupaten] = useState('Kota Padang'); // Defaulting to Padang as per user's context in screenshot
    const [provinsi, setProvinsi] = useState('Sumatera Barat');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        try {
            await kelompokService.create({
                namaKelompok: nama,
                kecamatan,
                desa,
                kabupaten,
                provinsi
            });
            onSuccess?.();
            onClose();
            // Reset form
            setNama('');
            setKecamatan('');
            setDesa('');
        } catch (err: any) {
            setError(err.message || 'Gagal menambahkan kelompok');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-opacity"
            role="dialog"
            aria-modal="true"
        >
            <div className="bg-white dark:bg-[#1c2936] w-full max-w-lg rounded-xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden transform transition-all animate-in fade-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-[#f0f2f4] dark:border-[#2a3b4d]">
                    <h3 className="text-lg font-bold text-[#111418] dark:text-white leading-tight">Tambah Kelompok</h3>
                    <button
                        onClick={onClose}
                        disabled={isLoading}
                        className="text-[#617589] hover:text-[#111418] dark:text-slate-400 dark:hover:text-white rounded-full p-1 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors cursor-pointer disabled:opacity-50"
                    >
                        <span className="material-symbols-outlined text-[24px]">close</span>
                    </button>
                </div>

                {/* Form Content */}
                <div className="p-6 overflow-y-auto">
                    <form id="add-kelompok-form" onSubmit={handleSubmit} className="flex flex-col gap-5">
                        {error && (
                            <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm border border-red-100">
                                {error}
                            </div>
                        )}
                        <div className="flex flex-col gap-1.5">
                            <label className="block text-sm font-semibold text-[#111418] dark:text-slate-200" htmlFor="groupName">
                                Nama Kelompok <span className="text-red-500">*</span>
                            </label>
                            <input
                                className="block w-full rounded-lg border border-[#e5e7eb] dark:border-[#2a3b4d] bg-white dark:bg-[#151e29] px-3 py-2.5 text-[#111418] dark:text-white shadow-sm placeholder-[#617589] focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all sm:text-sm"
                                id="groupName"
                                placeholder="Contoh: Kelompok Mawar 01"
                                type="text"
                                required
                                value={nama}
                                onChange={(e) => setNama(e.target.value)}
                                disabled={isLoading}
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="flex flex-col gap-1.5">
                                <label className="block text-sm font-semibold text-[#111418] dark:text-slate-200" htmlFor="provinsi">
                                    Provinsi <span className="text-red-500">*</span>
                                </label>
                                <input
                                    className="block w-full rounded-lg border border-[#e5e7eb] dark:border-[#2a3b4d] bg-white dark:bg-[#151e29] px-3 py-2.5 text-[#111418] dark:text-white shadow-sm placeholder-[#617589] focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all sm:text-sm"
                                    id="provinsi"
                                    placeholder="Sumatera Barat"
                                    type="text"
                                    required
                                    value={provinsi}
                                    onChange={(e) => setProvinsi(e.target.value)}
                                    disabled={isLoading}
                                />
                            </div>
                            <div className="flex flex-col gap-1.5">
                                <label className="block text-sm font-semibold text-[#111418] dark:text-slate-200" htmlFor="kabupaten">
                                    Kabupaten / Kota <span className="text-red-500">*</span>
                                </label>
                                <input
                                    className="block w-full rounded-lg border border-[#e5e7eb] dark:border-[#2a3b4d] bg-white dark:bg-[#151e29] px-3 py-2.5 text-[#111418] dark:text-white shadow-sm placeholder-[#617589] focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all sm:text-sm"
                                    id="kabupaten"
                                    placeholder="Kota Padang"
                                    type="text"
                                    required
                                    value={kabupaten}
                                    onChange={(e) => setKabupaten(e.target.value)}
                                    disabled={isLoading}
                                />
                            </div>
                        </div>
                        <div className="flex flex-col gap-1.5">
                            <label className="block text-sm font-semibold text-[#111418] dark:text-slate-200" htmlFor="kecamatan">
                                Kecamatan <span className="text-red-500">*</span>
                            </label>
                            <input
                                className="block w-full rounded-lg border border-[#e5e7eb] dark:border-[#2a3b4d] bg-white dark:bg-[#151e29] px-3 py-2.5 text-[#111418] dark:text-white shadow-sm placeholder-[#617589] focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all sm:text-sm"
                                id="kecamatan"
                                placeholder="Contoh: Padang Selatan"
                                type="text"
                                required
                                value={kecamatan}
                                onChange={(e) => setKecamatan(e.target.value)}
                                disabled={isLoading}
                            />
                        </div>
                        <div className="flex flex-col gap-1.5">
                            <label className="block text-sm font-semibold text-[#111418] dark:text-slate-200" htmlFor="village">
                                Desa / Kelurahan <span className="text-red-500">*</span>
                            </label>
                            <input
                                className="block w-full rounded-lg border border-[#e5e7eb] dark:border-[#2a3b4d] bg-white dark:bg-[#151e29] px-3 py-2.5 text-[#111418] dark:text-white shadow-sm placeholder-[#617589] focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all sm:text-sm"
                                id="village"
                                placeholder="Contoh: Batang Arau"
                                type="text"
                                required
                                value={desa}
                                onChange={(e) => setDesa(e.target.value)}
                                disabled={isLoading}
                            />
                        </div>
                    </form>
                </div>

                {/* Footer */}
                <div className="px-6 py-4 border-t border-[#f0f2f4] dark:border-[#2a3b4d] bg-slate-50 dark:bg-[#151e29] flex justify-end gap-3">
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={isLoading}
                        className="px-5 py-2.5 text-sm font-bold text-[#617589] hover:text-[#111418] hover:bg-white dark:text-slate-300 dark:hover:text-white dark:hover:bg-slate-700 border border-transparent hover:border-slate-200 dark:hover:border-slate-600 rounded-lg transition-all cursor-pointer disabled:opacity-50"
                    >
                        BATAL
                    </button>
                    <button
                        type="submit"
                        form="add-kelompok-form"
                        disabled={isLoading}
                        className="px-5 py-2.5 text-sm font-bold text-white bg-primary hover:bg-blue-600 rounded-lg shadow-md shadow-blue-500/20 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
                    >
                        {isLoading ? (
                            <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        ) : (
                            <span className="material-symbols-outlined text-[18px]">save</span>
                        )}
                        {isLoading ? 'MENYIMPAN...' : 'SIMPAN'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default TambahKelompokModal;
