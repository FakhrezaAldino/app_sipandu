import { z } from 'zod';

export const createJadwalSchema = z.object({
    body: z.object({
        kelompokId: z.string({ required_error: 'Kelompok ID harus diisi' }).uuid('Invalid Kelompok ID'),
        tanggal: z.string({ required_error: 'Tanggal harus diisi' }).datetime({ offset: true }),
        lokasi: z.string({ required_error: 'Lokasi harus diisi' }).min(3, 'Lokasi minimal 3 karakter'),
        aktivitas: z.string({ required_error: 'Aktivitas harus diisi' }).min(3, 'Aktivitas minimal 3 karakter'),
        catatan: z.string().optional(),
    }),
});
