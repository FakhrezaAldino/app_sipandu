import { db } from '../../db';
import { kelompok, kpm, absensi, usaha, prestasi, permasalahan, graduasi } from '../../db/schema';
import { eq, count, desc, sql, and, ilike, inArray, gte, lt } from 'drizzle-orm';
import type { CreateKelompokInput, UpdateKelompokInput } from './kelompok.schema';
import { calculateOffset, paginate, PaginationParams } from '../../lib/utils';
import { ApiError } from '../../middleware/error';

export class KelompokService {
    /**
     * Get all kelompok with optional filtering by pendamping
     */
    async findAll(params: PaginationParams & { pendampingId?: string; search?: string; date?: string }) {
        const { page = 1, limit = 10, pendampingId, search, date } = params;
        const offset = calculateOffset(page, limit);

        // Build where conditions
        const conditions = [];
        if (pendampingId) {
            conditions.push(eq(kelompok.pendampingId, pendampingId));
        }
        if (search) {
            conditions.push(ilike(kelompok.namaKelompok, `%${search}%`));
        }

        const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

        // Get data with pagination
        const [data, [{ total }]] = await Promise.all([
            db.query.kelompok.findMany({
                where: whereClause,
                with: {
                    pendamping: {
                        columns: { id: true, name: true, email: true },
                    },
                },
                orderBy: desc(kelompok.createdAt),
                limit,
                offset,
            }),
            db.select({ total: count() }).from(kelompok).where(whereClause),
        ]);

        // Fetch counts for these kelompoks
        const kelompokIds = data.map((k) => k.id);
        const filterDate = date ? new Date(date) : new Date();
        const startOfMonth = `${filterDate.getFullYear()}-${String(filterDate.getMonth() + 1).padStart(2, '0')}-01`;
        const nextMonthDate = new Date(filterDate.getFullYear(), filterDate.getMonth() + 1, 1);
        const endOfMonth = `${nextMonthDate.getFullYear()}-${String(nextMonthDate.getMonth() + 1).padStart(2, '0')}-01`;

        const [kpmCounts, usahaCounts, prestasiCounts, permasalahanCounts, graduasiCounts, latestAbsensi, currentMonthAbsen] = await Promise.all([
            kelompokIds.length > 0
                ? db.select({ id: kpm.kelompokId, count: count() }).from(kpm).where(inArray(kpm.kelompokId, kelompokIds)).groupBy(kpm.kelompokId)
                : Promise.resolve([]),
            kelompokIds.length > 0
                ? db.select({ id: kpm.kelompokId, count: count() }).from(usaha).innerJoin(kpm, eq(usaha.kpmId, kpm.id)).where(inArray(kpm.kelompokId, kelompokIds)).groupBy(kpm.kelompokId)
                : Promise.resolve([]),
            kelompokIds.length > 0
                ? db.select({ id: kpm.kelompokId, count: count() }).from(prestasi).innerJoin(kpm, eq(prestasi.kpmId, kpm.id)).where(inArray(kpm.kelompokId, kelompokIds)).groupBy(kpm.kelompokId)
                : Promise.resolve([]),
            kelompokIds.length > 0
                ? db.select({ id: kpm.kelompokId, count: count() }).from(permasalahan).innerJoin(kpm, eq(permasalahan.kpmId, kpm.id)).where(inArray(kpm.kelompokId, kelompokIds)).groupBy(kpm.kelompokId)
                : Promise.resolve([]),
            kelompokIds.length > 0
                ? db.select({ id: kpm.kelompokId, count: count() }).from(graduasi).innerJoin(kpm, eq(graduasi.kpmId, kpm.id)).where(inArray(kpm.kelompokId, kelompokIds)).groupBy(kpm.kelompokId)
                : Promise.resolve([]),
            kelompokIds.length > 0
                ? db.select({ id: absensi.kelompokId, lastDate: sql<string>`max(${absensi.tanggal})` }).from(absensi).where(inArray(absensi.kelompokId, kelompokIds)).groupBy(absensi.kelompokId)
                : Promise.resolve([]),
            kelompokIds.length > 0
                ? db.select({ id: absensi.kelompokId }).from(absensi).where(and(inArray(absensi.kelompokId, kelompokIds), gte(absensi.tanggal, startOfMonth), lt(absensi.tanggal, endOfMonth))).groupBy(absensi.kelompokId)
                : Promise.resolve([]),
        ]);





        const kpmMap = new Map(kpmCounts.map((c) => [c.id, Number(c.count)]));
        const usahaMap = new Map(usahaCounts.map((c) => [c.id, Number(c.count)]));
        const prestasiMap = new Map(prestasiCounts.map((c) => [c.id, Number(c.count)]));
        const permasalahanMap = new Map(permasalahanCounts.map((c) => [c.id, Number(c.count)]));
        const graduasiMap = new Map(graduasiCounts.map((c) => [c.id, Number(c.count)]));
        const absensiMap = new Map(latestAbsensi.map((c) => [c.id, c.lastDate]));
        const currentMonthAbsenSet = new Set(currentMonthAbsen.map((c) => c.id));

        const dataWithCounts = data.map((k) => {
            const lastDate = absensiMap.get(k.id);
            const isAbsen = currentMonthAbsenSet.has(k.id);



            return {
                ...k,
                kpmCount: kpmMap.get(k.id) || 0,
                usahaCount: usahaMap.get(k.id) || 0,
                prestasiCount: prestasiMap.get(k.id) || 0,
                permasalahanCount: permasalahanMap.get(k.id) || 0,
                graduasiCount: graduasiMap.get(k.id) || 0,
                lastAbsenDate: lastDate || null,
                isAbsenThisMonth: isAbsen,
            };
        });

        return paginate(dataWithCounts, total, { page, limit });
    }

    /**
     * Get kelompok by ID with related data counts
     */
    async findById(id: string) {
        const result = await db.query.kelompok.findFirst({
            where: eq(kelompok.id, id),
            with: {
                pendamping: {
                    columns: { id: true, name: true, email: true },
                },
            },
        });

        if (!result) {
            throw ApiError.notFound('Kelompok tidak ditemukan');
        }

        // Get related counts
        const [kpmStats, usahaStats, prestasiStats, permasalahanStats, graduasiStats, absensiStats, latestAbsensiRecord] = await Promise.all([
            db.select({ count: count() }).from(kpm).where(eq(kpm.kelompokId, id)),
            db.select({ count: count() }).from(usaha).innerJoin(kpm, eq(usaha.kpmId, kpm.id)).where(and(eq(kpm.kelompokId, id), eq(kpm.isActive, true))),
            db.select({ count: count() }).from(prestasi).innerJoin(kpm, eq(prestasi.kpmId, kpm.id)).where(and(eq(kpm.kelompokId, id), eq(kpm.isActive, true))),
            db.select({ count: count() }).from(permasalahan).innerJoin(kpm, eq(permasalahan.kpmId, kpm.id)).where(and(eq(kpm.kelompokId, id), eq(kpm.isActive, true))),
            db.select({ count: count() }).from(graduasi).innerJoin(kpm, eq(graduasi.kpmId, kpm.id)).where(eq(kpm.kelompokId, id)),
            db.select({ count: count() }).from(absensi).where(eq(absensi.kelompokId, id)),
            db.query.absensi.findFirst({
                where: eq(absensi.kelompokId, id),
                orderBy: desc(absensi.tanggal)
            }),
        ]);

        const now = new Date();
        const startOfMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`;
        const nextMonthDate = new Date(now.getFullYear(), now.getMonth() + 1, 1);
        const endOfMonth = `${nextMonthDate.getFullYear()}-${String(nextMonthDate.getMonth() + 1).padStart(2, '0')}-01`;

        const [currentMonthAbsen] = await db
            .select({ count: count() })
            .from(absensi)
            .where(and(eq(absensi.kelompokId, id), gte(absensi.tanggal, startOfMonth), lt(absensi.tanggal, endOfMonth)));

        return {
            ...result,
            kpmCount: Number(kpmStats[0].count),
            usahaCount: Number(usahaStats[0].count),
            prestasiCount: Number(prestasiStats[0].count),
            permasalahanCount: Number(permasalahanStats[0].count),
            graduasiCount: Number(graduasiStats[0].count),
            absensiCount: Number(absensiStats[0].count),
            lastAbsenDate: latestAbsensiRecord?.tanggal || null,
            isAbsenThisMonth: Number(currentMonthAbsen.count) > 0,
            _count: {
                kpm: Number(kpmStats[0].count),
                absensi: Number(absensiStats[0].count),
            },
        };
    }

    /**
     * Create new kelompok
     */
    async create(pendampingId: string, data: CreateKelompokInput) {
        const [result] = await db
            .insert(kelompok)
            .values({
                ...data,
                pendampingId,
            })
            .returning();

        return result;
    }

    /**
     * Update kelompok
     */
    async update(id: string, data: UpdateKelompokInput) {
        const [result] = await db
            .update(kelompok)
            .set({
                ...data,
                updatedAt: new Date(),
            })
            .where(eq(kelompok.id, id))
            .returning();

        if (!result) {
            throw ApiError.notFound('Kelompok tidak ditemukan');
        }

        return result;
    }

    /**
     * Delete kelompok
     */
    async delete(id: string) {
        const [result] = await db
            .delete(kelompok)
            .where(eq(kelompok.id, id))
            .returning();

        if (!result) {
            throw ApiError.notFound('Kelompok tidak ditemukan');
        }

        return result;
    }

    /**
     * Get kelompok statistics
     */
    async getStats(id: string) {
        const [kpmStats, usahaStats, prestasiStats, permasalahanStats, graduasiStats] = await Promise.all([
            db
                .select({ count: count() })
                .from(kpm)
                .where(eq(kpm.kelompokId, id)),
            db
                .select({ count: count() })
                .from(usaha)
                .innerJoin(kpm, eq(usaha.kpmId, kpm.id))
                .where(and(eq(kpm.kelompokId, id), eq(kpm.isActive, true))),
            db
                .select({ count: count() })
                .from(prestasi)
                .innerJoin(kpm, eq(prestasi.kpmId, kpm.id))
                .where(and(eq(kpm.kelompokId, id), eq(kpm.isActive, true))),
            db
                .select({ count: count() })
                .from(permasalahan)
                .innerJoin(kpm, eq(permasalahan.kpmId, kpm.id))
                .where(and(eq(kpm.kelompokId, id), eq(kpm.isActive, true))),
            db
                .select({ count: count() })
                .from(graduasi)
                .innerJoin(kpm, eq(graduasi.kpmId, kpm.id))
                .where(eq(kpm.kelompokId, id)),
        ]);

        return {
            totalKpm: kpmStats[0].count,
            totalUsaha: usahaStats[0].count,
            totalPrestasi: prestasiStats[0].count,
            totalPermasalahan: permasalahanStats[0].count,
            totalGraduasi: graduasiStats[0].count,
        };
    }
}

export const kelompokService = new KelompokService();
