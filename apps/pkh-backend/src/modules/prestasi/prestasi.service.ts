import { db } from '../../db';
import { prestasi, kpm } from '../../db/schema';
import { eq, count, desc } from 'drizzle-orm';
import type { CreatePrestasiInput, UpdatePrestasiInput } from './prestasi.schema';
import { calculateOffset, paginate, PaginationParams } from '../../lib/utils';
import { ApiError } from '../../middleware/error';

export class PrestasiService {
    async findByKelompok(kelompokId: string, params: PaginationParams) {
        const { page = 1, limit = 10 } = params;
        const offset = calculateOffset(page, limit);

        const whereClause = eq(kpm.kelompokId, kelompokId);

        const [data, [{ total }]] = await Promise.all([
            db.select({
                id: prestasi.id,
                namaAnak: prestasi.namaAnak,
                namaPrestasi: prestasi.namaPrestasi,
                jenisPrestasi: prestasi.jenisPrestasi,
                tingkat: prestasi.tingkat,
                tanggalPrestasi: prestasi.tanggalPrestasi,
                penyelenggara: prestasi.penyelenggara,
                peringkat: prestasi.peringkat,
                deskripsi: prestasi.deskripsi,
                createdAt: prestasi.createdAt,
                kpm: {
                    id: kpm.id,
                    namaLengkap: kpm.namaLengkap,
                    nik: kpm.nik,
                },
            })
                .from(prestasi)
                .innerJoin(kpm, eq(prestasi.kpmId, kpm.id))
                .where(whereClause)
                .orderBy(desc(prestasi.createdAt))
                .limit(limit)
                .offset(offset),
            db.select({ total: count() })
                .from(prestasi)
                .innerJoin(kpm, eq(prestasi.kpmId, kpm.id))
                .where(whereClause),
        ]);

        return paginate(data, total, { page, limit });
    }

    async findByKpm(kpmId: string, params: PaginationParams) {
        const { page = 1, limit = 10 } = params;
        const offset = calculateOffset(page, limit);
        const [data, [{ total }]] = await Promise.all([
            db.query.prestasi.findMany({ where: eq(prestasi.kpmId, kpmId), orderBy: desc(prestasi.createdAt), limit, offset }),
            db.select({ total: count() }).from(prestasi).where(eq(prestasi.kpmId, kpmId)),
        ]);
        return paginate(data, total, { page, limit });
    }

    async findById(id: string) {
        const result = await db.query.prestasi.findFirst({ where: eq(prestasi.id, id), with: { kpm: { with: { kelompok: true } } } });
        if (!result) throw ApiError.notFound('Data prestasi tidak ditemukan');
        return result;
    }

    async create(kpmId: string, data: CreatePrestasiInput) {
        const [result] = await db.insert(prestasi).values({ ...data, kpmId }).returning();
        return result;
    }

    async update(id: string, data: UpdatePrestasiInput) {
        const [result] = await db.update(prestasi).set({ ...data, updatedAt: new Date() }).where(eq(prestasi.id, id)).returning();
        if (!result) throw ApiError.notFound('Data prestasi tidak ditemukan');
        return result;
    }

    async delete(id: string) {
        const [result] = await db.delete(prestasi).where(eq(prestasi.id, id)).returning();
        if (!result) throw ApiError.notFound('Data prestasi tidak ditemukan');
        return result;
    }
}

export const prestasiService = new PrestasiService();
