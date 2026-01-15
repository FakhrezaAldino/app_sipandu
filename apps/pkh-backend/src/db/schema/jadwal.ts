import crypto from 'crypto';
import { pgTable, text, timestamp, pgEnum } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { kelompok } from './kelompok';

export const statusJadwalEnum = pgEnum('status_jadwal', ['terjadwal', 'selesai', 'dibatalkan']);

export const jadwal = pgTable('jadwal', {
    id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
    kelompokId: text('kelompok_id').notNull().references(() => kelompok.id, { onDelete: 'cascade' }),
    tanggal: timestamp('tanggal').notNull(),
    lokasi: text('lokasi').notNull(),
    aktivitas: text('aktivitas').notNull(),
    catatan: text('catatan'),
    status: statusJadwalEnum('status').notNull().default('terjadwal'),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export const jadwalRelations = relations(jadwal, ({ one }) => ({
    kelompok: one(kelompok, {
        fields: [jadwal.kelompokId],
        references: [kelompok.id],
    }),
}));

export type Jadwal = typeof jadwal.$inferSelect;
export type NewJadwal = typeof jadwal.$inferInsert;
