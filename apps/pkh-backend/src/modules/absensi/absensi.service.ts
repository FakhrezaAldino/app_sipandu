import { db } from '../../db';
import { absensi, absensiDetail, kpm } from '../../db/schema';
import { eq, count, desc, and, sql, gte, lt } from 'drizzle-orm';
import type { CreateAbsensiInput, UpdateAbsensiInput } from './absensi.schema';
import { calculateOffset, paginate, PaginationParams } from '../../lib/utils';
import { ApiError } from '../../middleware/error';

export class AbsensiService {
    /**
     * Get all absensi for a kelompok
     */
    async findByKelompok(kelompokId: string, params: PaginationParams) {
        const { page = 1, limit = 10 } = params;
        const offset = calculateOffset(page, limit);

        const whereClause = eq(absensi.kelompokId, kelompokId);

        const [data, [{ total }]] = await Promise.all([
            db.query.absensi.findMany({
                where: whereClause,
                with: {
                    createdByUser: {
                        columns: { id: true, name: true },
                    },
                },
                orderBy: desc(absensi.tanggal),
                limit,
                offset,
            }),
            db.select({ total: count() }).from(absensi).where(whereClause),
        ]);

        return paginate(data, total, { page, limit });
    }

    /**
     * Get absensi by ID with details
     */
    async findById(id: string) {
        const result = await db.query.absensi.findFirst({
            where: eq(absensi.id, id),
            with: {
                kelompok: true,
                createdByUser: {
                    columns: { id: true, name: true },
                },
                details: {
                    with: {
                        kpm: {
                            columns: { id: true, namaLengkap: true, nik: true },
                        },
                    },
                },
            },
        });

        if (!result) {
            throw ApiError.notFound('Data absensi tidak ditemukan');
        }

        return result;
    }

    /**
     * Get absensi by kelompok and date
     */
    async findByDate(kelompokId: string, tanggal: string) {
        // If the date is YYYY-MM, search by month range
        if (/^\d{4}-\d{2}$/.test(tanggal)) {
            const [year, month] = tanggal.split('-').map(Number);
            const startOfMonth = `${year}-${String(month).padStart(2, '0')}-01`;
            const nextMonthDate = new Date(year, month, 1);
            const endOfMonth = `${nextMonthDate.getFullYear()}-${String(nextMonthDate.getMonth() + 1).padStart(2, '0')}-01`;

            return await db.query.absensi.findFirst({
                where: and(
                    eq(absensi.kelompokId, kelompokId),
                    gte(absensi.tanggal, startOfMonth),
                    lt(absensi.tanggal, endOfMonth)
                ),
                with: {
                    kelompok: true,
                    details: {
                        with: {
                            kpm: {
                                columns: { id: true, namaLengkap: true, nik: true },
                            },
                        },
                    },
                },
            });
        }

        const result = await db.query.absensi.findFirst({
            where: and(
                eq(absensi.kelompokId, kelompokId),
                eq(absensi.tanggal, tanggal)
            ),
            with: {
                kelompok: true,
                details: {
                    with: {
                        kpm: {
                            columns: { id: true, namaLengkap: true, nik: true },
                        },
                    },
                },
            },
        });

        return result;
    }

    /**
     * Create new absensi with details
     */
    async create(kelompokId: string, userId: string, data: CreateAbsensiInput) {
        // Check if absensi for this month already exists (one per month per group)
        const dateObj = new Date(data.tanggal);
        const startOfMonth = `${dateObj.getFullYear()}-${String(dateObj.getMonth() + 1).padStart(2, '0')}-01`;
        const nextMonthDate = new Date(dateObj.getFullYear(), dateObj.getMonth() + 1, 1);
        const endOfMonth = `${nextMonthDate.getFullYear()}-${String(nextMonthDate.getMonth() + 1).padStart(2, '0')}-01`;

        const existing = await db.query.absensi.findFirst({
            where: and(
                eq(absensi.kelompokId, kelompokId),
                gte(absensi.tanggal, startOfMonth),
                lt(absensi.tanggal, endOfMonth)
            ),
        });

        if (existing) {
            const dateObj = new Date(data.tanggal);
            const monthLabel = dateObj.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });
            throw ApiError.conflict(`Absensi untuk periode ${monthLabel} sudah ada. Silakan gunakan menu edit untuk memperbarui.`);
        }

        // Use transaction
        const result = await db.transaction(async (tx) => {
            // Create absensi record
            const [absensiRecord] = await tx
                .insert(absensi)
                .values({
                    kelompokId,
                    tanggal: data.tanggal,
                    keterangan: data.keterangan,
                    createdBy: userId,
                })
                .returning();

            // Create detail records
            if (data.details && data.details.length > 0) {
                await tx.insert(absensiDetail).values(
                    data.details.map((detail) => ({
                        absensiId: absensiRecord.id,
                        kpmId: detail.kpmId,
                        status: detail.status,
                        keterangan: detail.keterangan,
                    }))
                );
            }

            return absensiRecord;
        });

        return result;
    }

    /**
     * Update absensi
     */
    async update(id: string, data: UpdateAbsensiInput) {
        const result = await db.transaction(async (tx) => {
            // Update absensi record
            const [absensiRecord] = await tx
                .update(absensi)
                .set({
                    keterangan: data.keterangan,
                    updatedAt: new Date(),
                })
                .where(eq(absensi.id, id))
                .returning();

            if (!absensiRecord) {
                throw ApiError.notFound('Data absensi tidak ditemukan');
            }

            // Update details if provided
            if (data.details && data.details.length > 0) {
                // Delete existing details
                await tx.delete(absensiDetail).where(eq(absensiDetail.absensiId, id));

                // Insert new details
                await tx.insert(absensiDetail).values(
                    data.details.map((detail) => ({
                        absensiId: id,
                        kpmId: detail.kpmId,
                        status: detail.status,
                        keterangan: detail.keterangan,
                    }))
                );
            }

            return absensiRecord;
        });

        return result;
    }

    /**
     * Delete absensi
     */
    async delete(id: string) {
        const [result] = await db
            .delete(absensi)
            .where(eq(absensi.id, id))
            .returning();

        if (!result) {
            throw ApiError.notFound('Data absensi tidak ditemukan');
        }

        return result;
    }

    /**
     * Get attendance stats for a kelompok
     */
    async getStats(kelompokId: string) {
        const [stats] = await db
            .select({
                totalPertemuan: sql<number>`count(distinct ${absensi.id})`,
                totalHadir: sql<number>`count(*) filter (where ${absensiDetail.status} = 'hadir')`,
                totalIzin: sql<number>`count(*) filter (where ${absensiDetail.status} = 'izin')`,
                totalSakit: sql<number>`count(*) filter (where ${absensiDetail.status} = 'sakit')`,
                totalAlpha: sql<number>`count(*) filter (where ${absensiDetail.status} = 'alpha')`,
            })
            .from(absensi)
            .leftJoin(absensiDetail, eq(absensi.id, absensiDetail.absensiId))
            .where(eq(absensi.kelompokId, kelompokId));

        const totalHadir = Number(stats.totalHadir || 0);
        const totalIzin = Number(stats.totalIzin || 0);
        const totalSakit = Number(stats.totalSakit || 0);
        const totalAlpha = Number(stats.totalAlpha || 0);
        const total = totalHadir + totalIzin + totalSakit + totalAlpha;

        return {
            totalPertemuan: Number(stats.totalPertemuan || 0),
            totalHadir,
            totalIzin,
            totalSakit,
            totalAlpha,
            persentaseKehadiran: total > 0 ? ((totalHadir / total) * 100).toFixed(2) : '0.00',
        };
    }
}

export const absensiService = new AbsensiService();
