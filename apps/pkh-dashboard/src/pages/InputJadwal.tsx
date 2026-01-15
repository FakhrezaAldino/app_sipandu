import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { kelompokService } from '../services/kelompok.service';
import { jadwalService } from '../services/jadwal.service';

interface InputJadwalForm {
    kelompokId: string;
    tanggal: string;
    jam: string;
    lokasi: string;
    aktivitas: string;
    catatan: string;
}

const InputJadwal = () => {
    const navigate = useNavigate();
    const [kelompokList, setKelompokList] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Form state
    const [formData, setFormData] = useState<InputJadwalForm>({
        kelompokId: '',
        tanggal: '',
        jam: '',
        lokasi: '',
        aktivitas: '',
        catatan: ''
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    useEffect(() => {
        const fetchKelompok = async () => {
            try {
                const response = await kelompokService.getAll();
                setKelompokList(response.data || []);
            } catch (err) {
                console.error('Failed to fetch kelompok:', err);
            }
        };

        fetchKelompok();
    }, []);

    const onSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        // Basic validation
        if (!formData.kelompokId || !formData.tanggal || !formData.jam || !formData.lokasi || !formData.aktivitas) {
            setError('Mohon lengkapi semua field yang wajib diisi');
            setIsLoading(false);
            return;
        }

        try {
            // Combine date and time
            const tanggal = new Date(`${formData.tanggal}T${formData.jam}:00`).toISOString();

            await jadwalService.create({
                kelompokId: formData.kelompokId,
                tanggal,
                lokasi: formData.lokasi,
                aktivitas: formData.aktivitas,
                catatan: formData.catatan,
            });

            navigate('/dashboard');
        } catch (err: any) {
            console.error('Submit error:', err);
            const message = err.response?.data?.message || 'Gagal membuat jadwal';
            const details = err.response?.data?.details;

            if (Array.isArray(details)) {
                setError(`${message}:\n${details.map((d: any) => `- ${d.message || d.field}`).join('\n')}`);
            } else if (typeof details === 'object') {
                setError(`${message}: ${JSON.stringify(details)}`);
            } else {
                setError(message);
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto flex flex-col gap-6">
            {/* Breadcrumbs */}
            <div className="flex flex-wrap gap-2 items-center text-sm">
                <Link className="text-[#617589] dark:text-gray-400 font-medium hover:text-primary transition-colors" to="/dashboard">Home</Link>
                <span className="material-symbols-outlined text-base text-[#617589] dark:text-gray-500">chevron_right</span>
                <span className="text-[#111418] dark:text-white font-medium">Input Jadwal</span>
            </div>

            <div className="bg-white dark:bg-[#1a202c] rounded-xl shadow-sm border border-[#e5e7eb] dark:border-[#2a3441] p-6 md:p-8">
                <div className="flex flex-col gap-2 mb-8">
                    <h1 className="text-2xl font-bold text-[#111418] dark:text-white">Buat Jadwal Pertemuan</h1>
                    <p className="text-[#617589] dark:text-gray-400">
                        Jadwalkan pertemuan baru dengan kelompok PKH.
                    </p>
                </div>

                {error && (
                    <div className="p-4 mb-6 bg-red-50 text-red-600 border border-red-200 rounded-lg text-sm font-medium whitespace-pre-wrap">
                        {error}
                    </div>
                )}

                <form onSubmit={onSubmit} className="flex flex-col gap-6">
                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-bold text-[#111418] dark:text-white">Kelompok</label>
                        <select
                            name="kelompokId"
                            value={formData.kelompokId}
                            onChange={handleChange}
                            required
                            className="w-full rounded-lg border border-[#dbe0e6] dark:border-gray-600 bg-white dark:bg-[#2d3748] p-2.5 text-sm text-[#111418] dark:text-white focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                        >
                            <option value="">-- Pilih Kelompok --</option>
                            {kelompokList.map((kelompok) => (
                                <option key={kelompok.id} value={kelompok.id}>{kelompok.namaKelompok}</option>
                            ))}
                        </select>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-bold text-[#111418] dark:text-white">Tanggal</label>
                            <input
                                type="date"
                                name="tanggal"
                                value={formData.tanggal}
                                onChange={handleChange}
                                required
                                className="w-full rounded-lg border border-[#dbe0e6] dark:border-gray-600 bg-white dark:bg-[#2d3748] p-2.5 text-sm text-[#111418] dark:text-white focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                            />
                        </div>
                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-bold text-[#111418] dark:text-white">Jam</label>
                            <input
                                type="time"
                                name="jam"
                                value={formData.jam}
                                onChange={handleChange}
                                required
                                className="w-full rounded-lg border border-[#dbe0e6] dark:border-gray-600 bg-white dark:bg-[#2d3748] p-2.5 text-sm text-[#111418] dark:text-white focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                            />
                        </div>
                    </div>

                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-bold text-[#111418] dark:text-white">Lokasi</label>
                        <input
                            type="text"
                            name="lokasi"
                            value={formData.lokasi}
                            onChange={handleChange}
                            required
                            placeholder="Contoh: Rumah Ketua Kelompok, Balai Desa"
                            className="w-full rounded-lg border border-[#dbe0e6] dark:border-gray-600 bg-white dark:bg-[#2d3748] p-2.5 text-sm text-[#111418] dark:text-white focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                        />
                    </div>

                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-bold text-[#111418] dark:text-white">Aktivitas</label>
                        <input
                            type="text"
                            name="aktivitas"
                            value={formData.aktivitas}
                            onChange={handleChange}
                            required
                            placeholder="Contoh: P2K2 Kesehatan, Pemutakhiran Data, Validasi"
                            className="w-full rounded-lg border border-[#dbe0e6] dark:border-gray-600 bg-white dark:bg-[#2d3748] p-2.5 text-sm text-[#111418] dark:text-white focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                        />
                    </div>

                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-bold text-[#111418] dark:text-white">Catatan (Opsional)</label>
                        <textarea
                            rows={3}
                            name="catatan"
                            value={formData.catatan}
                            onChange={handleChange}
                            placeholder="Tambahkan catatan jika perlu..."
                            className="w-full rounded-lg border border-[#dbe0e6] dark:border-gray-600 bg-white dark:bg-[#2d3748] p-2.5 text-sm text-[#111418] dark:text-white focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                        ></textarea>
                    </div>

                    <div className="flex justify-end gap-3 mt-4">
                        <Link
                            to="/dashboard"
                            className="px-6 py-2.5 rounded-lg border border-[#dbe0e6] dark:border-gray-600 text-[#111418] dark:text-white font-bold text-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                        >
                            Batal
                        </Link>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="px-6 py-2.5 rounded-lg bg-primary text-white font-bold text-sm hover:bg-blue-600 transition-colors disabled:opacity-50 flex items-center gap-2"
                        >
                            {isLoading && <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>}
                            <span>Simpan Jadwal</span>
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default InputJadwal;
