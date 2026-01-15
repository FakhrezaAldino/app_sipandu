import { z } from 'zod';

// Absensi detail schema
const absensiDetailSchema = z.object({
    kpmId: z.string().uuid(),
    status: z.enum(['hadir', 'izin', 'sakit', 'alpha']),
    keterangan: z.string().optional(),
});

// Create absensi schema
export const createAbsensiSchema = z.object({
    tanggal: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Format tanggal: YYYY-MM-DD'),
    keterangan: z.string().optional(),
    details: z.array(absensiDetailSchema).min(1, 'Minimal satu data kehadiran'),
});

// Update absensi schema
export const updateAbsensiSchema = z.object({
    keterangan: z.string().optional(),
    details: z.array(absensiDetailSchema).optional(),
});

// Types
export type CreateAbsensiInput = z.infer<typeof createAbsensiSchema>;
export type UpdateAbsensiInput = z.infer<typeof updateAbsensiSchema>;
