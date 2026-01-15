import { z } from 'zod';

export const createGraduasiSchema = z.object({
    tanggalGraduasi: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Format tanggal: YYYY-MM-DD'),
    alasanGraduasi: z.string().min(10, 'Alasan graduasi minimal 10 karakter'),
    jenisGraduasi: z.enum(['kepesertaan', 'alami', 'mandiri']),
    catatan: z.string().optional(),
    dokumenPath: z.string().optional(),
});

export const updateGraduasiSchema = createGraduasiSchema.partial();
export type CreateGraduasiInput = z.infer<typeof createGraduasiSchema>;
export type UpdateGraduasiInput = z.infer<typeof updateGraduasiSchema>;
