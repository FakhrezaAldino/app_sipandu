import React, { useState, useEffect } from 'react';
import { kelompokService } from '../../services/kelompok.service';

interface EditKelompokModalProps {
    isOpen: boolean;
    onClose: () => void;
    kelompok: any;
    onSuccess?: () => void;
}

const EditKelompokModal: React.FC<EditKelompokModalProps> = ({ isOpen, onClose, kelompok, onSuccess }) => {
    const [nama, setNama] = useState(kelompok?.namaKelompok || kelompok?.nama || '');
    const [kecamatan, setKecamatan] = useState(kelompok?.kecamatan || '');
    const [desa, setDesa] = useState(kelompok?.desa || '');
    const [kabupaten, setKabupaten] = useState(kelompok?.kabupaten || '');
    const [provinsi, setProvinsi] = useState(kelompok?.provinsi || '');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (kelompok) {
            setNama(kelompok.namaKelompok || kelompok.nama);
            setKecamatan(kelompok.kecamatan);
            setDesa(kelompok.desa);
            setKabupaten(kelompok.kabupaten || '');
            setProvinsi(kelompok.provinsi || '');
        }
    }, [kelompok]);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!kelompok?.id) return;

        setIsLoading(true);
        setError(null);

        try {
            await kelompokService.update(kelompok.id, {
                namaKelompok: nama,
                kecamatan,
                desa,
                kabupaten,
                provinsi
            });
            onSuccess?.();
            onClose();
        } catch (err: any) {
            setError(err.message || 'Gagal memperbarui kelompok');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/40 backdrop-blur-sm z-0 transition-opacity"
                onClick={onClose}
            ></div>

            {/* Modal Card */}
            <div className="relative z-10 w-full max-w-[600px] flex flex-col bg-white dark:bg-[#1a222d] rounded-xl shadow-2xl overflow-hidden max-h-[90vh] animate-in fade-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-5 border-b border-[#e5e7eb] dark:border-gray-700 bg-white dark:bg-[#1a222d] sticky top-0 z-20">
                    <h2 className="text-[#111418] dark:text-white text-xl font-bold leading-tight tracking-tight">Edit Kelompok</h2>
                    <button
                        onClick={onClose}
                        disabled={isLoading}
                        className="flex items-center justify-center w-8 h-8 rounded-full text-[#637588] dark:text-gray-400 hover:bg-[#f0f2f4] dark:hover:bg-gray-700 transition-colors cursor-pointer disabled:opacity-50"
                    >
                        <span className="material-symbols-outlined text-2xl">close</span>
                    </button>
                </div>

                {/* Scrollable Content */}
                <form id="edit-kelompok-form" onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 scrollbar-thin">
                    <div className="flex flex-col gap-6">
                        {error && (
                            <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm border border-red-100">
                                {error}
                            </div>
                        )}
                        {/* Nama Kelompok */}
                        <label className="flex flex-col w-full gap-2 text-left">
                            <span className="text-[#111418] dark:text-gray-200 text-sm font-medium leading-normal">Nama Kelompok</span>
                            <input
                                className="form-input flex w-full resize-none overflow-hidden rounded-lg text-[#111418] dark:text-white dark:bg-gray-800 focus:outline-0 focus:ring-0 border border-[#dbe0e6] dark:border-gray-600 focus:border-primary dark:focus:border-primary h-12 px-4 text-base font-normal leading-normal placeholder:text-[#617589] transition-colors"
                                placeholder="Masukkan nama kelompok"
                                type="text"
                                value={nama}
                                onChange={(e) => setNama(e.target.value)}
                                required
                                disabled={isLoading}
                            />
                        </label>

                        <div className="grid grid-cols-2 gap-4">
                            {/* Provinsi */}
                            <label className="flex flex-col w-full gap-2 text-left">
                                <span className="text-[#111418] dark:text-gray-200 text-sm font-medium leading-normal">Provinsi</span>
                                <input
                                    className="form-input flex w-full resize-none overflow-hidden rounded-lg text-[#111418] dark:text-white dark:bg-gray-800 focus:outline-0 focus:ring-0 border border-[#dbe0e6] dark:border-gray-600 focus:border-primary dark:focus:border-primary h-12 px-4 text-base font-normal leading-normal placeholder:text-[#617589] transition-colors"
                                    placeholder="Masukkan provinsi"
                                    type="text"
                                    value={provinsi}
                                    onChange={(e) => setProvinsi(e.target.value)}
                                    required
                                    disabled={isLoading}
                                />
                            </label>

                            {/* Kabupaten */}
                            <label className="flex flex-col w-full gap-2 text-left">
                                <span className="text-[#111418] dark:text-gray-200 text-sm font-medium leading-normal">Kabupaten / Kota</span>
                                <input
                                    className="form-input flex w-full resize-none overflow-hidden rounded-lg text-[#111418] dark:text-white dark:bg-gray-800 focus:outline-0 focus:ring-0 border border-[#dbe0e6] dark:border-gray-600 focus:border-primary dark:focus:border-primary h-12 px-4 text-base font-normal leading-normal placeholder:text-[#617589] transition-colors"
                                    placeholder="Masukkan kabupaten"
                                    type="text"
                                    value={kabupaten}
                                    onChange={(e) => setKabupaten(e.target.value)}
                                    required
                                    disabled={isLoading}
                                />
                            </label>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            {/* Kecamatan */}
                            <label className="flex flex-col w-full gap-2 text-left">
                                <span className="text-[#111418] dark:text-gray-200 text-sm font-medium leading-normal">Kecamatan</span>
                                <input
                                    className="form-input flex w-full resize-none overflow-hidden rounded-lg text-[#111418] dark:text-white dark:bg-gray-800 focus:outline-0 focus:ring-0 border border-[#dbe0e6] dark:border-gray-600 focus:border-primary dark:focus:border-primary h-12 px-4 text-base font-normal leading-normal placeholder:text-[#617589] transition-colors"
                                    placeholder="Masukkan kecamatan"
                                    type="text"
                                    value={kecamatan}
                                    onChange={(e) => setKecamatan(e.target.value)}
                                    required
                                    disabled={isLoading}
                                />
                            </label>

                            {/* Desa / Kelurahan */}
                            <label className="flex flex-col w-full gap-2 text-left">
                                <span className="text-[#111418] dark:text-gray-200 text-sm font-medium leading-normal">Desa / Kelurahan</span>
                                <input
                                    className="form-input flex w-full resize-none overflow-hidden rounded-lg text-[#111418] dark:text-white dark:bg-gray-800 focus:outline-0 focus:ring-0 border border-[#dbe0e6] dark:border-gray-600 focus:border-primary dark:focus:border-primary h-12 px-4 text-base font-normal leading-normal placeholder:text-[#617589] transition-colors"
                                    placeholder="Masukkan desa/kelurahan"
                                    type="text"
                                    value={desa}
                                    onChange={(e) => setDesa(e.target.value)}
                                    required
                                    disabled={isLoading}
                                />
                            </label>
                        </div>
                    </div>
                </form>

                {/* Footer */}
                <div className="p-6 border-t border-[#e5e7eb] dark:border-gray-700 bg-white dark:bg-[#1a222d] sticky bottom-0 z-20">
                    <div className="flex justify-end gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={isLoading}
                            className="h-12 px-6 rounded-lg border border-[#dbe0e6] dark:border-gray-600 text-[#111418] dark:text-white font-bold text-sm tracking-wide hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-200 dark:focus:ring-gray-600 cursor-pointer disabled:opacity-50"
                        >
                            BATAL
                        </button>
                        <button
                            type="submit"
                            form="edit-kelompok-form"
                            disabled={isLoading}
                            className="h-12 px-6 rounded-lg bg-primary text-white font-bold text-sm tracking-wide hover:bg-primary/90 transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/50 cursor-pointer disabled:opacity-50 flex items-center gap-2"
                        >
                            {isLoading && <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>}
                            {isLoading ? 'MENYIMPAN...' : 'SIMPAN PERUBAHAN'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EditKelompokModal;
