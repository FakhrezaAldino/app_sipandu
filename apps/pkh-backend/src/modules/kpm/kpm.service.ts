import { db } from '../../db';
import { kpm, kelompok, usaha, prestasi, permasalahan, graduasi, absensiDetail } from '../../db/schema';
import { eq, count, desc, and, ilike, inArray } from 'drizzle-orm';
import type { CreateKpmInput, UpdateKpmInput } from './kpm.schema';
import { calculateOffset, paginate, PaginationParams } from '../../lib/utils';
import { ApiError } from '../../middleware/error';

export class KpmService {
    /**
     * Get all KPM in a kelompok
     */
    async findByKelompok(kelompokId: string, params: PaginationParams & { search?: string }) {
        const { page = 1, limit = 10, search } = params;
        const offset = calculateOffset(page, limit);

        const conditions = [eq(kpm.kelompokId, kelompokId)];
        if (search) {
            conditions.push(ilike(kpm.namaLengkap, `%${search}%`));
        }

        const whereClause = and(...conditions);

        const [data, [{ total }]] = await Promise.all([
            db.query.kpm.findMany({
                where: whereClause,
                orderBy: desc(kpm.createdAt),
                limit,
                offset,
            }),
            db.select({ total: count() }).from(kpm).where(whereClause),
        ]);

        return paginate(data, total, { page, limit });
    }

    /**
     * Get KPM by ID with related data
     */
    async findById(id: string) {
        const result = await db.query.kpm.findFirst({
            where: eq(kpm.id, id),
            with: {
                kelompok: true,
            },
        });

        if (!result) {
            throw ApiError.notFound('KPM tidak ditemukan');
        }

        return result;
    }

    /**
     * Get KPM summary with all related data counts
     */
    async getSummary(id: string) {
        const kpmData = await this.findById(id);

        const [usahaCount, prestasiCount, permasalahanCount, graduasiCount] = await Promise.all([
            db.select({ count: count() }).from(usaha).where(eq(usaha.kpmId, id)),
            db.select({ count: count() }).from(prestasi).where(eq(prestasi.kpmId, id)),
            db.select({ count: count() }).from(permasalahan).where(eq(permasalahan.kpmId, id)),
            db.select({ count: count() }).from(graduasi).where(eq(graduasi.kpmId, id)),
        ]);

        return {
            ...kpmData,
            _count: {
                usaha: usahaCount[0].count,
                prestasi: prestasiCount[0].count,
                permasalahan: permasalahanCount[0].count,
                graduasi: graduasiCount[0].count,
            },
        };
    }

    /**
     * Create new KPM
     */
    async create(kelompokId: string, data: CreateKpmInput) {
        // Check if NIK already exists
        const existing = await db.query.kpm.findFirst({
            where: eq(kpm.nik, data.nik),
        });

        if (existing) {
            throw ApiError.conflict('NIK sudah terdaftar');
        }

        const [result] = await db
            .insert(kpm)
            .values({
                ...data,
                kelompokId,
            })
            .returning();

        return result;
    }

    /**
     * Update KPM
     */
    async update(id: string, data: UpdateKpmInput) {
        // If updating NIK, check for duplicates
        if (data.nik) {
            const existing = await db.query.kpm.findFirst({
                where: and(eq(kpm.nik, data.nik), eq(kpm.id, id)),
            });

            if (existing && existing.id !== id) {
                throw ApiError.conflict('NIK sudah terdaftar');
            }
        }

        const [result] = await db
            .update(kpm)
            .set({
                ...data,
                updatedAt: new Date(),
            })
            .where(eq(kpm.id, id))
            .returning();

        if (!result) {
            throw ApiError.notFound('KPM tidak ditemukan');
        }

        return result;
    }

    /**
     * Delete KPM (hard delete)
     */
    async delete(id: string) {
        // Start a transaction to ensure atomic deletion
        return await db.transaction(async (tx) => {
            // Manually cleanup restricted relations
            await tx.delete(graduasi).where(eq(graduasi.kpmId, id));
            await tx.delete(absensiDetail).where(eq(absensiDetail.kpmId, id));

            // Perform hard delete on KPM
            // (Note: usaha, prestasi, and permasalahan will cascade delete automatically)
            const [result] = await tx
                .delete(kpm)
                .where(eq(kpm.id, id))
                .returning();

            if (!result) {
                throw ApiError.notFound('KPM tidak ditemukan');
            }

            return result;
        });
    }
}

export const kpmService = new KpmService();
