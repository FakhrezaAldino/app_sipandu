import crypto from 'crypto';
import { pgTable, uuid, text, timestamp } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { users } from './auth';
import { kpm } from './kpm';
import { absensi } from './absensi';

// Kelompok table
export const kelompok = pgTable('kelompok', {
    id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
    namaKelompok: text('nama_kelompok').notNull(),
    desa: text('desa').notNull(),
    kecamatan: text('kecamatan').notNull(),
    kabupaten: text('kabupaten').notNull(),
    provinsi: text('provinsi').notNull(),
    deskripsi: text('deskripsi'),
    // Foreign key to users - pendamping owns this kelompok
    // SET NULL on delete: if pendamping is deleted, kelompok remains but unassigned
    pendampingId: text('pendamping_id').references(() => users.id, { onDelete: 'set null' }),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// Relations
export const kelompokRelations = relations(kelompok, ({ one, many }) => ({
    // One pendamping (user) manages this kelompok
    pendamping: one(users, {
        fields: [kelompok.pendampingId],
        references: [users.id],
    }),
    // One kelompok has many KPM members
    kpmMembers: many(kpm),
    // One kelompok has many attendance records
    absensiRecords: many(absensi),
}));

// Types
export type Kelompok = typeof kelompok.$inferSelect;
export type NewKelompok = typeof kelompok.$inferInsert;
