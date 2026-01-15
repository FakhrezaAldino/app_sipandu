import crypto from 'crypto';
import { pgTable, uuid, text, decimal, integer, date, timestamp, pgEnum } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { kpm } from './kpm';

// Enums
export const statusUsahaEnum = pgEnum('status_usaha', ['aktif', 'non-aktif', 'berkembang']);

// Usaha table (Business data per KPM)
export const usaha = pgTable('usaha', {
    id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
    // Foreign key to kpm - CASCADE: if KPM deleted, business records deleted too
    // Alternative: use RESTRICT to preserve business history
    kpmId: text('kpm_id').notNull().references(() => kpm.id, { onDelete: 'cascade' }),
    namaUsaha: text('nama_usaha').notNull(),
    jenisUsaha: text('jenis_usaha').notNull(),
    deskripsi: text('deskripsi'),
    modalAwal: decimal('modal_awal', { precision: 15, scale: 2 }),
    omzetBulanan: decimal('omzet_bulanan', { precision: 15, scale: 2 }),
    keuntunganBulanan: decimal('keuntungan_bulanan', { precision: 15, scale: 2 }),
    jumlahKaryawan: integer('jumlah_karyawan').default(0),
    tanggalMulai: date('tanggal_mulai'),
    status: statusUsahaEnum('status').notNull().default('aktif'),
    kendala: text('kendala'),
    catatan: text('catatan'),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// Relations
export const usahaRelations = relations(usaha, ({ one }) => ({
    // Each usaha belongs to one KPM
    kpm: one(kpm, {
        fields: [usaha.kpmId],
        references: [kpm.id],
    }),
}));

// Types
export type Usaha = typeof usaha.$inferSelect;
export type NewUsaha = typeof usaha.$inferInsert;
