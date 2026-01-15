import crypto from 'crypto';
import { pgTable, date, text, timestamp, pgEnum, unique } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { kelompok } from './kelompok';
import { kpm } from './kpm';
import { users } from './auth';

// Enums
export const statusAbsensiEnum = pgEnum('status_absensi', ['hadir', 'izin', 'sakit', 'alpha']);

// Absensi table (attendance per kelompok per date)
export const absensi = pgTable('absensi', {
    id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
    // Foreign key to kelompok - CASCADE: if kelompok deleted, attendance records are deleted too
    kelompokId: text('kelompok_id').notNull().references(() => kelompok.id, { onDelete: 'cascade' }),
    tanggal: date('tanggal').notNull(),
    keterangan: text('keterangan'),
    // Foreign key to users - SET NULL: if user deleted, record remains with null creator
    createdBy: text('created_by').references(() => users.id, { onDelete: 'set null' }),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
}, (table) => ({
    // Ensure only one attendance record per kelompok per date
    uniqueKelompokTanggal: unique().on(table.kelompokId, table.tanggal),
}));

// Absensi Detail table (individual KPM attendance)
export const absensiDetail = pgTable('absensi_detail', {
    id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
    // Foreign key to absensi - CASCADE: if absensi deleted, all details deleted
    absensiId: text('absensi_id').notNull().references(() => absensi.id, { onDelete: 'cascade' }),
    // Foreign key to kpm - RESTRICT: cannot delete KPM if attendance records exist
    // This preserves attendance history
    kpmId: text('kpm_id').notNull().references(() => kpm.id, { onDelete: 'restrict' }),
    status: statusAbsensiEnum('status').notNull().default('alpha'),
    keterangan: text('keterangan'),
    createdAt: timestamp('created_at').notNull().defaultNow(),
}, (table) => ({
    // Ensure each KPM appears only once per attendance record
    uniqueAbsensiKpm: unique().on(table.absensiId, table.kpmId),
}));

// Relations
export const absensiRelations = relations(absensi, ({ one, many }) => ({
    // Each absensi belongs to one kelompok
    kelompok: one(kelompok, {
        fields: [absensi.kelompokId],
        references: [kelompok.id],
    }),
    // Each absensi was created by one user
    createdByUser: one(users, {
        fields: [absensi.createdBy],
        references: [users.id],
    }),
    // Each absensi has many detail records
    details: many(absensiDetail),
}));

export const absensiDetailRelations = relations(absensiDetail, ({ one }) => ({
    // Each detail belongs to one absensi record
    absensi: one(absensi, {
        fields: [absensiDetail.absensiId],
        references: [absensi.id],
    }),
    // Each detail records attendance for one KPM
    kpm: one(kpm, {
        fields: [absensiDetail.kpmId],
        references: [kpm.id],
    }),
}));

// Types
export type Absensi = typeof absensi.$inferSelect;
export type NewAbsensi = typeof absensi.$inferInsert;
export type AbsensiDetail = typeof absensiDetail.$inferSelect;
export type NewAbsensiDetail = typeof absensiDetail.$inferInsert;
