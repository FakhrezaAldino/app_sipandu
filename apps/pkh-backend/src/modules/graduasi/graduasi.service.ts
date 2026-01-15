import { db } from '../../db';
import { graduasi, kpm } from '../../db/schema';
import { eq, count, desc } from 'drizzle-orm';
import type { CreateGraduasiInput, UpdateGraduasiInput } from './graduasi.schema';
import { calculateOffset, paginate, PaginationParams } from '../../lib/utils';
import { ApiError } from '../../middleware/error';

export class GraduasiService {
    async findByKelompok(kelompokId: string, params: PaginationParams) {
        const { page = 1, limit = 10 } = params;
        const offset = calculateOffset(page, limit);

        const whereClause = eq(kpm.kelompokId, kelompokId);

        const [data, [{ total }]] = await Promise.all([
            db.select({
                id: graduasi.id,
                tanggalGraduasi: graduasi.tanggalGraduasi,
                alasanGraduasi: graduasi.alasanGraduasi,
                jenisGraduasi: graduasi.jenisGraduasi,
                catatan: graduasi.catatan,
                createdAt: graduasi.createdAt,
                kpm: {
                    id: kpm.id,
                    namaLengkap: kpm.namaLengkap,
                    nik: kpm.nik,
                },
            })
                .from(graduasi)
                .innerJoin(kpm, eq(graduasi.kpmId, kpm.id))
                .where(whereClause)
                .orderBy(desc(graduasi.createdAt))
                .limit(limit)
                .offset(offset),
            db.select({ total: count() })
                .from(graduasi)
                .innerJoin(kpm, eq(graduasi.kpmId, kpm.id))
                .where(whereClause),
        ]);

        return paginate(data, total, { page, limit });
    }

    async findById(id: string) {
        const result = await db.query.graduasi.findFirst({
            where: eq(graduasi.id, id),
            with: { kpm: { with: { kelompok: true } }, verifier: { columns: { id: true, name: true } } },
        });
        if (!result) throw ApiError.notFound('Data graduasi tidak ditemukan');
        return result;
    }

    async create(kpmId: string, data: CreateGraduasiInput) {
        // Check if KPM already graduated
        const existing = await db.query.graduasi.findFirst({ where: eq(graduasi.kpmId, kpmId) });
        if (existing) throw ApiError.conflict('KPM sudah memiliki data graduasi');

        const [result] = await db.transaction(async (tx) => {
            // Create graduasi record
            const graduasiResult = await tx.insert(graduasi).values({ ...data, kpmId }).returning();
            // Set KPM as inactive
            await tx.update(kpm).set({ isActive: false, updatedAt: new Date() }).where(eq(kpm.id, kpmId));
            return graduasiResult;
        });

        return result;
    }

    async update(id: string, data: UpdateGraduasiInput, verifierId?: string) {
        const [result] = await db.update(graduasi).set({
            ...data,
            ...(verifierId && { verifiedBy: verifierId }),
            updatedAt: new Date(),
        }).where(eq(graduasi.id, id)).returning();
        if (!result) throw ApiError.notFound('Data graduasi tidak ditemukan');
        return result;
    }

    async delete(id: string) {
        const result = await db.transaction(async (tx) => {
            const [graduasiRecord] = await tx.delete(graduasi).where(eq(graduasi.id, id)).returning();
            if (!graduasiRecord) throw ApiError.notFound('Data graduasi tidak ditemukan');
            // Reactivate KPM
            await tx.update(kpm).set({ isActive: true, updatedAt: new Date() }).where(eq(kpm.id, graduasiRecord.kpmId));
            return graduasiRecord;
        });
        return result;
    }
}

export const graduasiService = new GraduasiService();
