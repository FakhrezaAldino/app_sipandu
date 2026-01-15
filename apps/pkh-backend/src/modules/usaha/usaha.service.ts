import { db } from '../../db';
import { usaha, kpm } from '../../db/schema';
import { eq, count, desc } from 'drizzle-orm';
import type { CreateUsahaInput, UpdateUsahaInput } from './usaha.schema';
import { calculateOffset, paginate, PaginationParams } from '../../lib/utils';
import { ApiError } from '../../middleware/error';

export class UsahaService {
    async findByKelompok(kelompokId: string, params: PaginationParams) {
        const { page = 1, limit = 10 } = params;
        const offset = calculateOffset(page, limit);

        const whereClause = eq(kpm.kelompokId, kelompokId);

        const [data, [{ total }]] = await Promise.all([
            db.select({
                id: usaha.id,
                namaUsaha: usaha.namaUsaha,
                jenisUsaha: usaha.jenisUsaha,
                deskripsi: usaha.deskripsi,
                modalAwal: usaha.modalAwal,
                omzetBulanan: usaha.omzetBulanan,
                keuntunganBulanan: usaha.keuntunganBulanan,
                jumlahKaryawan: usaha.jumlahKaryawan,
                tanggalMulai: usaha.tanggalMulai,
                status: usaha.status,
                kendala: usaha.kendala,
                catatan: usaha.catatan,
                createdAt: usaha.createdAt,
                kpm: {
                    id: kpm.id,
                    namaLengkap: kpm.namaLengkap,
                    nik: kpm.nik,
                },
            })
                .from(usaha)
                .innerJoin(kpm, eq(usaha.kpmId, kpm.id))
                .where(whereClause)
                .orderBy(desc(usaha.createdAt))
                .limit(limit)
                .offset(offset),
            db.select({ total: count() })
                .from(usaha)
                .innerJoin(kpm, eq(usaha.kpmId, kpm.id))
                .where(whereClause),
        ]);

        return paginate(data, total, { page, limit });
    }

    async findByKpm(kpmId: string, params: PaginationParams) {
        const { page = 1, limit = 10 } = params;
        const offset = calculateOffset(page, limit);

        const [data, [{ total }]] = await Promise.all([
            db.query.usaha.findMany({
                where: eq(usaha.kpmId, kpmId),
                orderBy: desc(usaha.createdAt),
                limit,
                offset,
            }),
            db.select({ total: count() }).from(usaha).where(eq(usaha.kpmId, kpmId)),
        ]);

        return paginate(data, total, { page, limit });
    }

    async findById(id: string) {
        const result = await db.query.usaha.findFirst({
            where: eq(usaha.id, id),
            with: { kpm: { with: { kelompok: true } } },
        });
        if (!result) throw ApiError.notFound('Data usaha tidak ditemukan');
        return result;
    }

    async create(kpmId: string, data: CreateUsahaInput) {
        const [result] = await db.insert(usaha).values({ ...data, kpmId }).returning();
        return result;
    }

    async update(id: string, data: UpdateUsahaInput) {
        const [result] = await db
            .update(usaha)
            .set({ ...data, updatedAt: new Date() })
            .where(eq(usaha.id, id))
            .returning();
        if (!result) throw ApiError.notFound('Data usaha tidak ditemukan');
        return result;
    }

    async delete(id: string) {
        const [result] = await db.delete(usaha).where(eq(usaha.id, id)).returning();
        if (!result) throw ApiError.notFound('Data usaha tidak ditemukan');
        return result;
    }
}

export const usahaService = new UsahaService();
