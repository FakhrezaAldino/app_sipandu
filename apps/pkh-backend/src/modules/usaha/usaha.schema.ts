import { z } from 'zod';

export const createUsahaSchema = z.object({
    namaUsaha: z.string().min(3, 'Nama usaha minimal 3 karakter'),
    jenisUsaha: z.string().min(1, 'Jenis usaha wajib diisi'),
    deskripsi: z.string().optional(),
    modalAwal: z.string().optional(),
    omzetBulanan: z.string().optional(),
    keuntunganBulanan: z.string().optional(),
    jumlahKaryawan: z.number().int().min(0).optional(),
    tanggalMulai: z.string().optional(),
    status: z.enum(['aktif', 'non-aktif', 'berkembang']).optional(),
    kendala: z.string().optional(),
    catatan: z.string().optional(),
});

export const updateUsahaSchema = createUsahaSchema.partial();

export type CreateUsahaInput = z.infer<typeof createUsahaSchema>;
export type UpdateUsahaInput = z.infer<typeof updateUsahaSchema>;
