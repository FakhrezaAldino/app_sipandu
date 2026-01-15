import { z } from 'zod';

export const createPrestasiSchema = z.object({
    namaPrestasi: z.string().min(3, 'Nama prestasi minimal 3 karakter'),
    namaAnak: z.string().optional(),
    jenisPrestasi: z.string().min(1, 'Jenis prestasi wajib diisi'),
    tingkat: z.string().optional(),
    tanggalPrestasi: z.string().optional(),
    penyelenggara: z.string().optional(),
    peringkat: z.string().optional(),
    deskripsi: z.string().optional(),
    buktiPath: z.string().optional(),
});

export const updatePrestasiSchema = createPrestasiSchema.partial();
export type CreatePrestasiInput = z.infer<typeof createPrestasiSchema>;
export type UpdatePrestasiInput = z.infer<typeof updatePrestasiSchema>;
