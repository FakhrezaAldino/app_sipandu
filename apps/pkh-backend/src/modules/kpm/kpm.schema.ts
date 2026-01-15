import { z } from 'zod';

// Create KPM schema
export const createKpmSchema = z.object({
    nik: z.string().length(16, 'NIK harus 16 digit'),
    namaLengkap: z.string().min(3, 'Nama lengkap minimal 3 karakter'),
    tempatLahir: z.string().optional(),
    tanggalLahir: z.string().optional(),
    jenisKelamin: z.enum(['L', 'P'], {
        errorMap: () => ({ message: 'Jenis kelamin harus L atau P' })
    }),
    alamat: z.string().optional(),
    noTelepon: z.string().optional(),
    pekerjaan: z.string().optional(),
    statusPernikahan: z.string().optional(),
    jumlahTanggungan: z.number().int().min(0).optional(),
    isActive: z.boolean().optional().default(true),
});

// Update KPM schema
export const updateKpmSchema = createKpmSchema.partial();

// Types
export type CreateKpmInput = z.infer<typeof createKpmSchema>;
export type UpdateKpmInput = z.infer<typeof updateKpmSchema>;
