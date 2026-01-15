import crypto from 'crypto';
import { pgTable, uuid, text, date, timestamp } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { kpm } from './kpm';

// Prestasi table (Achievements per KPM)
export const prestasi = pgTable('prestasi', {
    id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
    // Foreign key to kpm - CASCADE: if KPM deleted, achievement records deleted too
    kpmId: text('kpm_id').notNull().references(() => kpm.id, { onDelete: 'cascade' }),
    namaAnak: text('nama_anak'),
    namaPrestasi: text('nama_prestasi').notNull(),
    jenisPrestasi: text('jenis_prestasi').notNull(),
    tingkat: text('tingkat'), // Desa, Kecamatan, Kabupaten, Provinsi, Nasional
    tanggalPrestasi: date('tanggal_prestasi'),
    penyelenggara: text('penyelenggara'),
    peringkat: text('peringkat'),
    deskripsi: text('deskripsi'),
    buktiPath: text('bukti_path'), // Path to evidence document/image
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// Relations
export const prestasiRelations = relations(prestasi, ({ one }) => ({
    // Each prestasi belongs to one KPM
    kpm: one(kpm, {
        fields: [prestasi.kpmId],
        references: [kpm.id],
    }),
}));

// Types
export type Prestasi = typeof prestasi.$inferSelect;
export type NewPrestasi = typeof prestasi.$inferInsert;
