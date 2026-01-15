import React, { useState } from 'react';
import { kpmService } from '../../services/kpm.service';

interface TambahKPMModalProps {
    isOpen: boolean;
    onClose: () => void;
    kelompokId?: string;
    onSuccess?: () => void;
}

const TambahKPMModal: React.FC<TambahKPMModalProps> = ({ isOpen, onClose, kelompokId, onSuccess }) => {
    const [nama, setNama] = useState('');
    const [nik, setNik] = useState('');
    const [jenisKelamin, setJenisKelamin] = useState<'laki-laki' | 'perempuan'>('perempuan');
    const [tanggalLahir, setTanggalLahir] = useState('');
    const [noHp, setNoHp] = useState('');
    const [alamat, setAlamat] = useState('');
    const [status, setStatus] = useState<'aktif' | 'graduasi' | 'nonaktif'>('aktif');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!kelompokId) return;

        setIsLoading(true);
        if (nik.length !== 16) {
            setError('NIK harus 16 digit');
            setIsLoading(false);
            return;
        }

        try {
            await kpmService.create(kelompokId, {
                namaLengkap: nama,
                nik,
                jenisKelamin: jenisKelamin === 'laki-laki' ? 'L' : 'P',
                tanggalLahir,
                noTelepon: noHp,
                alamat,
                isActive: status === 'aktif'
            });
            onSuccess?.();
            onClose();
            // Reset form
            setNama('');
            setNik('');
            setTanggalLahir('');
            setNoHp('');
            setAlamat('');
        } catch (err: any) {
            setError(err.message || 'Gagal menambahkan KPM');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div
            className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-opacity"
            role="dialog"
            aria-modal="true"
        >
            <div className="relative bg-white dark:bg-[#1a202c] rounded-xl text-left overflow-hidden shadow-2xl transform transition-all w-full max-w-2xl border border-gray-200 dark:border-gray-700 animate-in fade-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="bg-white dark:bg-[#1a202c] px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center text-center sm:text-left">
                    <h3 className="text-xl font-bold leading-6 text-gray-900 dark:text-white">Tambah KPM</h3>
                    <button
                        onClick={onClose}
                        disabled={isLoading}
                        className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 focus:outline-none transition-colors rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 p-1 cursor-pointer disabled:opacity-50"
                        type="button"
                    >
                        <span className="material-symbols-outlined block">close</span>
                    </button>
                </div>

                {/* Body */}
                <div className="px-6 py-5 bg-white dark:bg-[#1a202c] max-h-[70vh] overflow-y-auto">
                    <form id="add-kpm-form" onSubmit={handleSubmit} className="grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2">
                        {error && (
                            <div className="sm:col-span-2 p-3 bg-red-50 text-red-600 rounded-lg text-sm border border-red-100">
                                {error}
                            </div>
                        )}
                        <div className="sm:col-span-1">
                            <label className="block text-sm font-medium leading-6 text-gray-900 dark:text-white" htmlFor="nama_lengkap">Nama Lengkap</label>
                            <div className="mt-1.5">
                                <input
                                    className="block w-full rounded-lg border-0 py-2.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm sm:leading-6 dark:bg-[#1a202c] dark:ring-gray-600 dark:text-white dark:focus:ring-blue-500"
                                    id="nama_lengkap"
                                    name="nama_lengkap"
                                    placeholder="Masukkan nama lengkap"
                                    type="text"
                                    required
                                    value={nama}
                                    onChange={(e) => setNama(e.target.value)}
                                    disabled={isLoading}
                                />
                            </div>
                        </div>

                        <div className="sm:col-span-1">
                            <label className="block text-sm font-medium leading-6 text-gray-900 dark:text-white" htmlFor="nik">NIK</label>
                            <div className="mt-1.5">
                                <input
                                    className="block w-full rounded-lg border-0 py-2.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm sm:leading-6 dark:bg-[#1a202c] dark:ring-gray-600 dark:text-white dark:focus:ring-blue-500"
                                    id="nik"
                                    name="nik"
                                    placeholder="16 digit NIK"
                                    type="text"
                                    required
                                    maxLength={16}
                                    value={nik}
                                    onChange={(e) => setNik(e.target.value)}
                                    disabled={isLoading}
                                />
                            </div>
                        </div>

                        <div className="sm:col-span-1">
                            <label className="block text-sm font-medium leading-6 text-gray-900 dark:text-white mb-2">Jenis Kelamin</label>
                            <div className="flex items-center gap-4 mt-2">
                                <div className="flex items-center">
                                    <input
                                        className="h-4 w-4 border-gray-300 text-primary focus:ring-primary dark:bg-[#1a202c] dark:border-gray-600 cursor-pointer"
                                        id="gender-male"
                                        name="gender"
                                        type="radio"
                                        checked={jenisKelamin === 'laki-laki'}
                                        onChange={() => setJenisKelamin('laki-laki')}
                                        disabled={isLoading}
                                    />
                                    <label className="ml-2 block text-sm text-gray-700 dark:text-gray-300 cursor-pointer" htmlFor="gender-male">Laki-laki</label>
                                </div>
                                <div className="flex items-center">
                                    <input
                                        className="h-4 w-4 border-gray-300 text-primary focus:ring-primary dark:bg-[#1a202c] dark:border-gray-600 cursor-pointer"
                                        id="gender-female"
                                        name="gender"
                                        type="radio"
                                        checked={jenisKelamin === 'perempuan'}
                                        onChange={() => setJenisKelamin('perempuan')}
                                        disabled={isLoading}
                                    />
                                    <label className="ml-2 block text-sm text-gray-700 dark:text-gray-300 cursor-pointer" htmlFor="gender-female">Perempuan</label>
                                </div>
                            </div>
                        </div>

                        <div className="sm:col-span-1">
                            <label className="block text-sm font-medium leading-6 text-gray-900 dark:text-white" htmlFor="birthdate">Tanggal Lahir</label>
                            <div className="mt-1.5">
                                <input
                                    className="block w-full rounded-lg border-0 py-2.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm sm:leading-6 dark:bg-[#1a202c] dark:ring-gray-600 dark:text-white dark:focus:ring-blue-500 [color-scheme:light] dark:[color-scheme:dark]"
                                    id="birthdate"
                                    name="birthdate"
                                    type="date"
                                    required
                                    max={new Date().toISOString().split('T')[0]}
                                    value={tanggalLahir}
                                    onChange={(e) => setTanggalLahir(e.target.value)}
                                    disabled={isLoading}
                                />
                            </div>
                        </div>

                        <div className="sm:col-span-2">
                            <label className="block text-sm font-medium leading-6 text-gray-900 dark:text-white" htmlFor="phone">No HP</label>
                            <div className="mt-1.5">
                                <input
                                    className="block w-full rounded-lg border-0 py-2.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm sm:leading-6 dark:bg-[#1a202c] dark:ring-gray-600 dark:text-white dark:focus:ring-blue-500"
                                    id="phone"
                                    name="phone"
                                    placeholder="Contoh: 081234567890"
                                    type="tel"
                                    value={noHp}
                                    onChange={(e) => setNoHp(e.target.value)}
                                    disabled={isLoading}
                                />
                            </div>
                        </div>

                        <div className="sm:col-span-2">
                            <label className="block text-sm font-medium leading-6 text-gray-900 dark:text-white" htmlFor="address">Alamat Lengkap</label>
                            <div className="mt-1.5">
                                <textarea
                                    className="block w-full rounded-lg border-0 py-2.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm sm:leading-6 dark:bg-[#1a202c] dark:ring-gray-600 dark:text-white dark:focus:ring-blue-500 resize-none"
                                    id="address"
                                    name="address"
                                    placeholder="Nama Jalan, RT/RW, Dusun"
                                    rows={3}
                                    required
                                    value={alamat}
                                    onChange={(e) => setAlamat(e.target.value)}
                                    disabled={isLoading}
                                ></textarea>
                            </div>
                        </div>

                        <div className="sm:col-span-2">
                            <label className="block text-sm font-medium leading-6 text-gray-900 dark:text-white mb-2">Status KPM</label>
                            <div className="flex items-center gap-6 mt-1.5 p-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                                <div className="flex items-center">
                                    <input
                                        className="h-4 w-4 border-gray-300 text-green-600 focus:ring-green-600 dark:bg-[#1a202c] dark:border-gray-600 cursor-pointer"
                                        id="status-active"
                                        name="status"
                                        type="radio"
                                        checked={status === 'aktif'}
                                        onChange={() => setStatus('aktif')}
                                        disabled={isLoading}
                                    />
                                    <label className="ml-2 block text-sm font-medium text-gray-900 dark:text-white cursor-pointer" htmlFor="status-active">Aktif</label>
                                </div>
                                <div className="flex items-center">
                                    <input
                                        className="h-4 w-4 border-gray-300 text-blue-600 focus:ring-blue-600 dark:bg-[#1a202c] dark:border-gray-600 cursor-pointer"
                                        id="status-graduated"
                                        name="status"
                                        type="radio"
                                        checked={status === 'graduasi'}
                                        onChange={() => setStatus('graduasi')}
                                        disabled={isLoading}
                                    />
                                    <label className="ml-2 block text-sm font-medium text-gray-900 dark:text-white cursor-pointer" htmlFor="status-graduated">Graduasi</label>
                                </div>
                                <div className="flex items-center">
                                    <input
                                        className="h-4 w-4 border-gray-300 text-gray-600 focus:ring-gray-600 dark:bg-[#1a202c] dark:border-gray-600 cursor-pointer"
                                        id="status-inactive"
                                        name="status"
                                        type="radio"
                                        checked={status === 'nonaktif'}
                                        onChange={() => setStatus('nonaktif')}
                                        disabled={isLoading}
                                    />
                                    <label className="ml-2 block text-sm font-medium text-gray-900 dark:text-white cursor-pointer" htmlFor="status-inactive">Nonaktif</label>
                                </div>
                            </div>
                        </div>
                    </form>
                </div>

                {/* Footer */}
                <div className="bg-gray-50 dark:bg-[#1a202c] px-6 py-4 sm:flex sm:flex-row-reverse border-t border-gray-200 dark:border-gray-700 gap-3">
                    <button
                        type="submit"
                        form="add-kpm-form"
                        disabled={isLoading}
                        className="w-full inline-flex justify-center rounded-lg border border-transparent shadow-sm px-4 py-2.5 bg-primary text-sm font-bold text-white hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary sm:w-auto transition-colors cursor-pointer disabled:opacity-50 flex items-center gap-2"
                    >
                        {isLoading && <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>}
                        {isLoading ? 'MENYIMPAN...' : 'SIMPAN'}
                    </button>
                    <button
                        onClick={onClose}
                        disabled={isLoading}
                        className="mt-3 w-full inline-flex justify-center rounded-lg border border-gray-300 dark:border-gray-600 shadow-sm px-4 py-2.5 bg-white dark:bg-[#1a202c] text-sm font-bold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 sm:mt-0 sm:w-auto transition-colors cursor-pointer disabled:opacity-50"
                        type="button"
                    >
                        BATAL
                    </button>
                </div>
            </div>
        </div>
    );
};

export default TambahKPMModal;
