import { pgTable, uuid, text, timestamp } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { users } from './auth';

export const pendampings = pgTable('pendampings', {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: text('user_id')
        .notNull()
        .references(() => users.id, { onDelete: 'cascade' }),
    nama: text('nama').notNull(),
    nik: text('nik').notNull().unique(),
    noHp: text('no_hp').notNull(),
    wilayahBinaan: text('wilayah_binaan').notNull(),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export const pendampingsRelations = relations(pendampings, ({ one }) => ({
    user: one(users, {
        fields: [pendampings.userId],
        references: [users.id],
    }),
}));
