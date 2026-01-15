import crypto from 'crypto';
import { pgTable, uuid, text, date, timestamp, pgEnum } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { kpm } from './kpm';

// Enums
export const kategoriMasalahEnum = pgEnum('kategori_masalah', [
    'ekonomi',
    'kesehatan',
    'pendidikan',
    'sosial',
    'lainnya'
]);

export const prioritasMasalahEnum = pgEnum('prioritas_masalah', [
    'rendah',
    'sedang',
    'tinggi',
    'kritis'
]);

export const statusMasalahEnum = pgEnum('status_masalah', [
    'baru',
    'diproses',
    'selesai',
    'tidak_terselesaikan'
]);

// Permasalahan table (Issues/Problems per KPM)
export const permasalahan = pgTable('permasalahan', {
    id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
    // Foreign key to kpm - CASCADE: if KPM deleted, issue records deleted too
    kpmId: text('kpm_id').notNull().references(() => kpm.id, { onDelete: 'cascade' }),
    judulMasalah: text('judul_masalah').notNull(),
    deskripsiMasalah: text('deskripsi_masalah').notNull(),
    kategori: kategoriMasalahEnum('kategori').notNull(),
    prioritas: prioritasMasalahEnum('prioritas').notNull().default('sedang'),
    status: statusMasalahEnum('status').notNull().default('baru'),
    solusi: text('solusi'),
    tindakLanjut: text('tindak_lanjut'),
    tanggalLapor: date('tanggal_lapor').notNull(),
    tanggalSelesai: date('tanggal_selesai'),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// Relations
export const permasalahanRelations = relations(permasalahan, ({ one }) => ({
    // Each permasalahan belongs to one KPM
    kpm: one(kpm, {
        fields: [permasalahan.kpmId],
        references: [kpm.id],
    }),
}));

// Types
export type Permasalahan = typeof permasalahan.$inferSelect;
export type NewPermasalahan = typeof permasalahan.$inferInsert;
