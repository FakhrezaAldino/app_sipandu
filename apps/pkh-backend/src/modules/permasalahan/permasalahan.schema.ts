import { z } from 'zod';

export const createPermasalahanSchema = z.object({
    judulMasalah: z.string().min(3, 'Judul masalah minimal 3 karakter'),
    deskripsiMasalah: z.string().min(5, 'Deskripsi masalah minimal 5 karakter'),
    kategori: z.enum(['ekonomi', 'kesehatan', 'pendidikan', 'sosial', 'lainnya']),
    prioritas: z.enum(['rendah', 'sedang', 'tinggi', 'kritis']).optional(),
    tanggalLapor: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Format tanggal: YYYY-MM-DD'),
    solusi: z.string().optional(),
    tindakLanjut: z.string().optional(),
});

export const updatePermasalahanSchema = z.object({
    judulMasalah: z.string().min(5).optional(),
    deskripsiMasalah: z.string().min(10).optional(),
    kategori: z.enum(['ekonomi', 'kesehatan', 'pendidikan', 'sosial', 'lainnya']).optional(),
    prioritas: z.enum(['rendah', 'sedang', 'tinggi', 'kritis']).optional(),
    status: z.enum(['baru', 'diproses', 'selesai', 'tidak_terselesaikan']).optional(),
    solusi: z.string().optional(),
    tindakLanjut: z.string().optional(),
    tanggalSelesai: z.string().optional(),
});

export type CreatePermasalahanInput = z.infer<typeof createPermasalahanSchema>;
export type UpdatePermasalahanInput = z.infer<typeof updatePermasalahanSchema>;
