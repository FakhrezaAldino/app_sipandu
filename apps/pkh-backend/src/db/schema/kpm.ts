import crypto from 'crypto';
import { pgTable, uuid, text, date, boolean, timestamp, integer, pgEnum } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { kelompok } from './kelompok';
import { usaha } from './usaha';
import { prestasi } from './prestasi';
import { permasalahan } from './permasalahan';
import { graduasi } from './graduasi';
import { absensiDetail } from './absensi';

// Enums
export const jenisKelaminEnum = pgEnum('jenis_kelamin', ['L', 'P']);

// KPM (Keluarga Penerima Manfaat) table
export const kpm = pgTable('kpm', {
    id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
    nik: text('nik').notNull().unique(),
    namaLengkap: text('nama_lengkap').notNull(),
    tempatLahir: text('tempat_lahir'),
    tanggalLahir: date('tanggal_lahir'),
    jenisKelamin: jenisKelaminEnum('jenis_kelamin').notNull(),
    alamat: text('alamat'),
    noTelepon: text('no_telepon'),
    pekerjaan: text('pekerjaan'),
    statusPernikahan: text('status_pernikahan'),
    jumlahTanggungan: integer('jumlah_tanggungan').default(0),
    // Foreign key to kelompok
    // RESTRICT on delete: cannot delete kelompok if it has KPM members
    kelompokId: text('kelompok_id').notNull().references(() => kelompok.id, { onDelete: 'restrict' }),
    isActive: boolean('is_active').notNull().default(true),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// Relations
export const kpmRelations = relations(kpm, ({ one, many }) => ({
    // Each KPM belongs to one kelompok
    kelompok: one(kelompok, {
        fields: [kpm.kelompokId],
        references: [kelompok.id],
    }),
    // One KPM can have many usaha (businesses)
    usahaList: many(usaha),
    // One KPM can have many prestasi (achievements)
    prestasiList: many(prestasi),
    // One KPM can have many permasalahan (issues)
    permasalahanList: many(permasalahan),
    // One KPM can have one or more graduasi records (if reactivated then graduated again)
    graduasiRecords: many(graduasi),
    // One KPM can have many attendance records
    absensiRecords: many(absensiDetail),
}));

// Types
export type Kpm = typeof kpm.$inferSelect;
export type NewKpm = typeof kpm.$inferInsert;
