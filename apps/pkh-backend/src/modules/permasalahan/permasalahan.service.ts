import { db } from '../../db';
import { permasalahan, kpm } from '../../db/schema';
import { eq, count, desc } from 'drizzle-orm';
import type { CreatePermasalahanInput, UpdatePermasalahanInput } from './permasalahan.schema';
import { calculateOffset, paginate, PaginationParams } from '../../lib/utils';
import { ApiError } from '../../middleware/error';

export class PermasalahanService {
    async findByKelompok(kelompokId: string, params: PaginationParams) {
        const { page = 1, limit = 10 } = params;
        const offset = calculateOffset(page, limit);

        const whereClause = eq(kpm.kelompokId, kelompokId);

        const [data, [{ total }]] = await Promise.all([
            db.select({
                id: permasalahan.id,
                judulMasalah: permasalahan.judulMasalah,
                deskripsiMasalah: permasalahan.deskripsiMasalah,
                kategori: permasalahan.kategori,
                prioritas: permasalahan.prioritas,
                status: permasalahan.status,
                tanggalLapor: permasalahan.tanggalLapor,
                createdAt: permasalahan.createdAt,
                kpm: {
                    id: kpm.id,
                    namaLengkap: kpm.namaLengkap,
                    nik: kpm.nik,
                },
            })
                .from(permasalahan)
                .innerJoin(kpm, eq(permasalahan.kpmId, kpm.id))
                .where(whereClause)
                .orderBy(desc(permasalahan.createdAt))
                .limit(limit)
                .offset(offset),
            db.select({ total: count() })
                .from(permasalahan)
                .innerJoin(kpm, eq(permasalahan.kpmId, kpm.id))
                .where(whereClause),
        ]);

        return paginate(data, total, { page, limit });
    }

    async findByKpm(kpmId: string, params: PaginationParams) {
        const { page = 1, limit = 10 } = params;
        const offset = calculateOffset(page, limit);
        const [data, [{ total }]] = await Promise.all([
            db.query.permasalahan.findMany({ where: eq(permasalahan.kpmId, kpmId), orderBy: desc(permasalahan.createdAt), limit, offset }),
            db.select({ total: count() }).from(permasalahan).where(eq(permasalahan.kpmId, kpmId)),
        ]);
        return paginate(data, total, { page, limit });
    }

    async findById(id: string) {
        const result = await db.query.permasalahan.findFirst({ where: eq(permasalahan.id, id), with: { kpm: { with: { kelompok: true } } } });
        if (!result) throw ApiError.notFound('Data permasalahan tidak ditemukan');
        return result;
    }

    async create(kpmId: string, data: CreatePermasalahanInput) {
        const [result] = await db.insert(permasalahan).values({ ...data, kpmId }).returning();
        return result;
    }

    async update(id: string, data: UpdatePermasalahanInput) {
        const [result] = await db.update(permasalahan).set({ ...data, updatedAt: new Date() }).where(eq(permasalahan.id, id)).returning();
        if (!result) throw ApiError.notFound('Data permasalahan tidak ditemukan');
        return result;
    }

    async delete(id: string) {
        const [result] = await db.delete(permasalahan).where(eq(permasalahan.id, id)).returning();
        if (!result) throw ApiError.notFound('Data permasalahan tidak ditemukan');
        return result;
    }
}

export const permasalahanService = new PermasalahanService();
