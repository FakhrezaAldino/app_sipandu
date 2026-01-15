import crypto from 'crypto';
import { pgTable, uuid, text, date, timestamp, pgEnum } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { kpm } from './kpm';
import { users } from './auth';

// Enums
export const jenisGraduasiEnum = pgEnum('jenis_graduasi', [
    'kepesertaan',       // Graduation due to membership rules
    'alami',             // Natural graduation (age out, etc.)
    'mandiri'            // Economic independence
]);

// Graduasi table
export const graduasi = pgTable('graduasi', {
    id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
    // Foreign key to kpm - RESTRICT: cannot delete KPM if graduation record exists
    // Note: KPM should be soft-deleted (isActive=false) when graduated, not hard-deleted
    kpmId: text('kpm_id').notNull().references(() => kpm.id, { onDelete: 'restrict' }),
    tanggalGraduasi: date('tanggal_graduasi').notNull(),
    alasanGraduasi: text('alasan_graduasi').notNull(),
    jenisGraduasi: jenisGraduasiEnum('jenis_graduasi').notNull(),
    catatan: text('catatan'),
    dokumenPath: text('dokumen_path'),
    // Foreign key to users - SET NULL: if verifier deleted, record remains with null verifier
    verifiedBy: text('verified_by').references(() => users.id, { onDelete: 'set null' }),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// Relations
export const graduasiRelations = relations(graduasi, ({ one }) => ({
    // Each graduasi record belongs to one KPM
    kpm: one(kpm, {
        fields: [graduasi.kpmId],
        references: [kpm.id],
    }),
    // Each graduasi was verified by one user (optional)
    verifier: one(users, {
        fields: [graduasi.verifiedBy],
        references: [users.id],
    }),
}));

// Types
export type Graduasi = typeof graduasi.$inferSelect;
export type NewGraduasi = typeof graduasi.$inferInsert;
