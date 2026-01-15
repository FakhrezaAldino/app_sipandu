import { z } from 'zod';

// Create kelompok schema
export const createKelompokSchema = z.object({
    namaKelompok: z.string().min(3, 'Nama kelompok minimal 3 karakter'),
    desa: z.string().min(1, 'Desa wajib diisi'),
    kecamatan: z.string().min(1, 'Kecamatan wajib diisi'),
    kabupaten: z.string().min(1, 'Kabupaten wajib diisi'),
    provinsi: z.string().min(1, 'Provinsi wajib diisi'),
    deskripsi: z.string().optional(),
});

// Update kelompok schema
export const updateKelompokSchema = createKelompokSchema.partial();

// Types
export type CreateKelompokInput = z.infer<typeof createKelompokSchema>;
export type UpdateKelompokInput = z.infer<typeof updateKelompokSchema>;
