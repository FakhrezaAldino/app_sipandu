import React from 'react';
import { NavLink } from 'react-router-dom';

const InputLaporan: React.FC = () => {
    return (
        <div className="layout-container flex grow flex-col">
            <div className="mx-auto w-full max-w-[960px] flex-1 flex flex-col gap-6 py-5 px-4 md:px-0">
                {/* Breadcrumbs */}
                <div className="flex flex-wrap gap-2 text-sm">
                    <NavLink to="/dashboard" className="text-slate-500 hover:text-primary transition-colors font-medium dark:text-slate-400">Home</NavLink>
                    <span className="text-slate-400 dark:text-slate-500">/</span>
                    <span className="text-slate-500 font-medium dark:text-slate-400">Laporan</span>
                    <span className="text-slate-400 dark:text-slate-500">/</span>
                    <span className="text-slate-900 font-semibold dark:text-white">Input Laporan</span>
                </div>

                {/* Page Heading */}
                <div className="flex flex-col gap-2">
                    <h1 className="text-[#111418] dark:text-white text-3xl md:text-4xl font-black leading-tight tracking-[-0.033em]">Input Laporan Pendamping</h1>
                    <p className="text-[#617589] dark:text-gray-400 text-base font-normal">Isi formulir di bawah ini untuk melaporkan kegiatan bulanan, kendala, dan rencana tindak lanjut Anda.</p>
                </div>

                {/* Form Container */}
                <div className="bg-white dark:bg-[#1a2632] rounded-xl shadow-sm border border-[#e5e7eb] dark:border-gray-700 overflow-hidden mb-10">
                    {/* Section: Detail Laporan */}
                    <div className="border-b border-[#f0f2f4] dark:border-gray-700 p-6">
                        <h3 className="text-[#111418] dark:text-white text-lg font-bold leading-tight tracking-[-0.015em] mb-4 flex items-center gap-2">
                            <span className="material-symbols-outlined text-primary">article</span>
                            Detail Laporan
                        </h3>
                        <div className="flex flex-col gap-6">
                            {/* Periode Laporan Row */}
                            <div className="flex flex-wrap items-end gap-4">
                                <label className="flex flex-col min-w-[150px] flex-1">
                                    <p className="text-[#111418] dark:text-gray-200 text-sm font-medium leading-normal pb-2">Bulan</p>
                                    <div className="relative">
                                        <select className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-[#111418] dark:text-white focus:outline-0 focus:ring-2 focus:ring-primary/20 border border-[#dbe0e6] dark:border-gray-600 bg-white dark:bg-[#22303e] focus:border-primary h-12 px-4 text-base font-normal leading-normal appearance-none cursor-pointer">
                                            <option disabled selected value="">Pilih Bulan</option>
                                            <option value="1">Januari</option>
                                            <option value="2">Februari</option>
                                            <option value="3">Maret</option>
                                            <option value="4">April</option>
                                            <option value="5">Mei</option>
                                            <option value="6">Juni</option>
                                            <option value="7">Juli</option>
                                            <option value="8">Agustus</option>
                                            <option value="9">September</option>
                                            <option value="10">Oktober</option>
                                            <option value="11">November</option>
                                            <option value="12">Desember</option>
                                        </select>
                                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-[#617589]">
                                            <span className="material-symbols-outlined">expand_more</span>
                                        </div>
                                    </div>
                                </label>
                                <label className="flex flex-col min-w-[150px] flex-1">
                                    <p className="text-[#111418] dark:text-gray-200 text-sm font-medium leading-normal pb-2">Tahun</p>
                                    <div className="relative">
                                        <select className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-[#111418] dark:text-white focus:outline-0 focus:ring-2 focus:ring-primary/20 border border-[#dbe0e6] dark:border-gray-600 bg-white dark:bg-[#22303e] focus:border-primary h-12 px-4 text-base font-normal leading-normal appearance-none cursor-pointer">
                                            <option disabled value="">Pilih Tahun</option>
                                            <option value="2026">2026</option>
                                            <option value="2025" selected>2025</option>
                                            <option value="2024">2024</option>
                                            <option value="2023">2023</option>
                                        </select>
                                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-[#617589]">
                                            <span className="material-symbols-outlined">expand_more</span>
                                        </div>
                                    </div>
                                </label>
                            </div>
                            {/* Judul Laporan */}
                            <label className="flex flex-col w-full">
                                <p className="text-[#111418] dark:text-gray-200 text-sm font-medium leading-normal pb-2">Judul Laporan</p>
                                <input
                                    className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-[#111418] dark:text-white focus:outline-0 focus:ring-2 focus:ring-primary/20 border border-[#dbe0e6] dark:border-gray-600 bg-white dark:bg-[#22303e] focus:border-primary h-12 placeholder:text-[#617589] px-4 text-base font-normal leading-normal"
                                    placeholder="Contoh: Laporan Pendampingan KPM Desa Sukamaju"
                                />
                            </label>
                        </div>
                    </div>

                    {/* Section: Isi Laporan */}
                    <div className="p-6">
                        <h3 className="text-[#111418] dark:text-white text-lg font-bold leading-tight tracking-[-0.015em] mb-4 flex items-center gap-2">
                            <span className="material-symbols-outlined text-primary">edit_note</span>
                            Isi Laporan
                        </h3>
                        <div className="flex flex-col gap-6">
                            {/* Ringkasan Kegiatan */}
                            <label className="flex flex-col w-full group">
                                <div className="flex justify-between items-baseline pb-2">
                                    <p className="text-[#111418] dark:text-gray-200 text-sm font-medium leading-normal">Ringkasan Kegiatan</p>
                                    <span className="text-xs text-[#617589]">Min. 50 kata</span>
                                </div>
                                <textarea
                                    className="form-textarea flex w-full min-w-0 flex-1 resize-y rounded-lg text-[#111418] dark:text-white focus:outline-0 focus:ring-2 focus:ring-primary/20 border border-[#dbe0e6] dark:border-gray-600 bg-white dark:bg-[#22303e] focus:border-primary min-h-[160px] placeholder:text-[#617589] p-4 text-base font-normal leading-normal"
                                    placeholder="Jelaskan secara rinci kegiatan pendampingan yang telah dilakukan bulan ini..."
                                ></textarea>
                                <div className="flex justify-end pt-1">
                                    <span className="text-xs text-[#617589]">0 / 2000 karakter</span>
                                </div>
                            </label>
                            {/* Kendala Umum */}
                            <label className="flex flex-col w-full">
                                <p className="text-[#111418] dark:text-gray-200 text-sm font-medium leading-normal pb-2">Kendala Umum di Lapangan</p>
                                <textarea
                                    className="form-textarea flex w-full min-w-0 flex-1 resize-y rounded-lg text-[#111418] dark:text-white focus:outline-0 focus:ring-2 focus:ring-primary/20 border border-[#dbe0e6] dark:border-gray-600 bg-white dark:bg-[#22303e] focus:border-primary min-h-[120px] placeholder:text-[#617589] p-4 text-base font-normal leading-normal"
                                    placeholder="Sebutkan kendala atau masalah yang ditemui saat pendampingan, misal: KPM pindah alamat, kartu error, dll."
                                ></textarea>
                            </label>
                            {/* Rencana Tindak Lanjut */}
                            <label className="flex flex-col w-full">
                                <p className="text-[#111418] dark:text-gray-200 text-sm font-medium leading-normal pb-2">Rencana Tindak Lanjut</p>
                                <textarea
                                    className="form-textarea flex w-full min-w-0 flex-1 resize-y rounded-lg text-[#111418] dark:text-white focus:outline-0 focus:ring-2 focus:ring-primary/20 border border-[#dbe0e6] dark:border-gray-600 bg-white dark:bg-[#22303e] focus:border-primary min-h-[120px] placeholder:text-[#617589] p-4 text-base font-normal leading-normal"
                                    placeholder="Jelaskan langkah selanjutnya yang akan diambil untuk mengatasi kendala atau rencana kegiatan bulan depan."
                                ></textarea>
                            </label>
                        </div>
                    </div>

                    {/* Footer Actions */}
                    <div className="border-t border-[#f0f2f4] dark:border-gray-700 bg-slate-50 dark:bg-[#151f28] p-6 flex flex-col sm:flex-row justify-end gap-3">
                        <NavLink
                            to="/dashboard"
                            className="flex min-w-[120px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-12 px-6 flex-1 sm:flex-none bg-transparent text-[#617589] dark:text-gray-400 text-base font-bold leading-normal tracking-[0.015em] hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors border border-transparent hover:border-gray-200"
                        >
                            <span className="truncate">Batal</span>
                        </NavLink>
                        <button className="flex min-w-[140px] cursor-pointer items-center justify-center gap-2 overflow-hidden rounded-lg h-12 px-6 flex-1 sm:flex-none bg-primary text-white text-base font-bold leading-normal tracking-[0.015em] hover:bg-blue-600 transition-colors shadow-sm">
                            <span className="material-symbols-outlined text-[20px]">save</span>
                            <span className="truncate">Simpan Laporan</span>
                        </button>
                    </div>
                </div>

                {/* Helper Text */}
                <div className="px-4 pb-10 text-center">
                    <p className="text-sm text-[#617589]">Pastikan semua data sudah benar sebelum menyimpan. Laporan yang sudah difinalisasi tidak dapat diubah kembali.</p>
                </div>
            </div>
        </div>
    );
};

export default InputLaporan;
