import { Request, Response, NextFunction } from 'express';
import { db } from '../../db';
import { kelompok, kpm, absensi, usaha, prestasi, permasalahan, graduasi } from '../../db/schema';
import { eq, count, and, sql, inArray, desc, gte } from 'drizzle-orm';
import { jadwalService } from '../jadwal/jadwal.service';

export class ReportsController {
    /**
     * GET /api/reports/dashboard
     * Dashboard statistics for authenticated user
     */
    async getDashboard(req: Request, res: Response, next: NextFunction) {
        try {
            const userId = req.user!.id;
            const isAdmin = req.user!.role === 'admin';

            // Build where clause based on role
            const kelompokWhere = isAdmin ? undefined : eq(kelompok.pendampingId, userId);

            // Fetch counts
            let kpmCount = 0;
            let usahaCount = 0;
            let prestasiCount = 0;
            let permasalahanCount = 0;
            let graduasiCount = 0;

            const [kelompokCount] = await db
                .select({ count: count() })
                .from(kelompok)
                .where(kelompokWhere);

            // Fetch recent activities
            let recentActivities: any[] = [];
            const activityLimit = 20;

            let attendanceTrend: { month: string; percentage: number }[] = [];
            const sixMonthsAgo = new Date();
            sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
            sixMonthsAgo.setDate(1);
            const dateStr = sixMonthsAgo.toISOString().split('T')[0];

            if (isAdmin) {
                const [kResult, uResult, pResult, prResult, gResult] = await Promise.all([
                    db.select({ count: count() }).from(kpm),
                    db.select({ count: count() }).from(usaha),
                    db.select({ count: count() }).from(prestasi),
                    db.select({ count: count() }).from(permasalahan).where(sql`${permasalahan.status} != 'selesai'`),
                    db.select({ count: count() }).from(graduasi),
                ]);
                kpmCount = Number(kResult[0].count);
                usahaCount = Number(uResult[0].count);
                prestasiCount = Number(pResult[0].count);
                permasalahanCount = Number(prResult[0].count);
                graduasiCount = Number(gResult[0].count);

                const [
                    absensiRecent,
                    usahaRecent,
                    prestasiRecent,
                    permasalahanRecent,
                    graduasiRecent,
                    kpmRecent
                ] = await Promise.all([
                    db.query.absensi.findMany({
                        limit: activityLimit,
                        orderBy: desc(absensi.createdAt),
                        with: { kelompok: { columns: { id: true, namaKelompok: true } } }
                    }),
                    db.query.usaha.findMany({
                        limit: activityLimit,
                        orderBy: desc(usaha.createdAt),
                        with: { kpm: { columns: { id: true, namaLengkap: true, kelompokId: true } } }
                    }),
                    db.query.prestasi.findMany({
                        limit: activityLimit,
                        orderBy: desc(prestasi.createdAt),
                        with: { kpm: { columns: { id: true, namaLengkap: true, kelompokId: true } } }
                    }),
                    db.query.permasalahan.findMany({
                        limit: activityLimit,
                        orderBy: desc(permasalahan.createdAt),
                        with: { kpm: { columns: { id: true, namaLengkap: true, kelompokId: true } } }
                    }),
                    db.query.graduasi.findMany({
                        limit: activityLimit,
                        orderBy: desc(graduasi.createdAt),
                        with: { kpm: { columns: { id: true, namaLengkap: true, kelompokId: true } } }
                    }),
                    db.query.kpm.findMany({
                        limit: activityLimit,
                        orderBy: desc(kpm.createdAt),
                        with: { kelompok: { columns: { id: true, namaKelompok: true } } }
                    })
                ]);

                recentActivities = [
                    ...absensiRecent.map(a => ({ id: a.id, kelompokId: a.kelompokId, type: 'Absensi', subject: a.kelompok?.namaKelompok || 'Kelompok', detail: `Absensi pertemuan tanggal ${new Date(a.tanggal).toLocaleDateString('id-ID')}`, status: 'Selesai', createdAt: a.createdAt })),
                    ...usahaRecent.map(u => ({ id: u.id, kelompokId: u.kpm?.kelompokId || '', type: 'Usaha', subject: u.kpm?.namaLengkap || 'KPM', detail: `Update data usaha: ${u.namaUsaha}`, status: 'Selesai', createdAt: u.createdAt })),
                    ...prestasiRecent.map(p => ({ id: p.id, kelompokId: p.kpm?.kelompokId || '', type: 'Prestasi', subject: p.kpm?.namaLengkap || 'KPM', detail: `Input prestasi: ${p.namaPrestasi || p.jenisPrestasi}`, status: 'Selesai', createdAt: p.createdAt })),
                    ...permasalahanRecent.map(pr => ({ id: pr.id, kelompokId: pr.kpm?.kelompokId || '', type: 'Permasalahan', subject: pr.kpm?.namaLengkap || 'KPM', detail: `Laporan masalah: ${pr.judulMasalah}`, status: 'Proses', createdAt: pr.createdAt })),
                    ...graduasiRecent.map(g => ({ id: g.id, kelompokId: g.kpm?.kelompokId || '', type: 'Graduasi', subject: g.kpm?.namaLengkap || 'KPM', detail: `Proses graduasi: ${g.jenisGraduasi}`, status: 'Selesai', createdAt: g.createdAt })),
                    ...kpmRecent.map(k => ({ id: k.id, kelompokId: k.kelompokId, type: 'KPM', subject: k.namaLengkap, detail: `Penambahan KPM baru di ${k.kelompok?.namaKelompok}`, status: 'Selesai', createdAt: k.createdAt }))
                ];

                // Calculate attendance trend for Admin (Global)
                const attendanceData = await db.query.absensi.findMany({
                    where: gte(absensi.tanggal, dateStr),
                    with: { details: true }
                });
                attendanceTrend = processAttendanceTrend(attendanceData);
            } else {
                const userKelompoks = await db.query.kelompok.findMany({
                    where: eq(kelompok.pendampingId, userId),
                    columns: { id: true },
                });
                const kelompokIds = userKelompoks.map((k) => k.id);

                if (kelompokIds.length > 0) {
                    const [kResult, uResult, pResult, prResult, gResult] = await Promise.all([
                        db.select({ count: count() }).from(kpm).where(and(inArray(kpm.kelompokId, kelompokIds), eq(kpm.isActive, true))),
                        db.select({ count: count() }).from(usaha).innerJoin(kpm, eq(usaha.kpmId, kpm.id)).where(and(inArray(kpm.kelompokId, kelompokIds), eq(kpm.isActive, true))),
                        db.select({ count: count() }).from(prestasi).innerJoin(kpm, eq(prestasi.kpmId, kpm.id)).where(and(inArray(kpm.kelompokId, kelompokIds), eq(kpm.isActive, true))),
                        db.select({ count: count() }).from(permasalahan).innerJoin(kpm, eq(permasalahan.kpmId, kpm.id)).where(and(inArray(kpm.kelompokId, kelompokIds), eq(kpm.isActive, true), sql`${permasalahan.status} != 'selesai'`)),
                        db.select({ count: count() }).from(graduasi).innerJoin(kpm, eq(graduasi.kpmId, kpm.id)).where(inArray(kpm.kelompokId, kelompokIds)),
                    ]);
                    kpmCount = Number(kResult[0].count);
                    usahaCount = Number(uResult[0].count);
                    prestasiCount = Number(pResult[0].count);
                    permasalahanCount = Number(prResult[0].count);
                    graduasiCount = Number(gResult[0].count);

                    const [
                        absensiRecent,
                        usahaRecent,
                        prestasiRecent,
                        permasalahanRecent,
                        graduasiRecent,
                        kpmRecent
                    ] = await Promise.all([
                        db.query.absensi.findMany({
                            where: inArray(absensi.kelompokId, kelompokIds),
                            limit: activityLimit,
                            orderBy: desc(absensi.createdAt),
                            with: { kelompok: { columns: { id: true, namaKelompok: true } } }
                        }),
                        db.query.usaha.findMany({
                            where: inArray(usaha.kpmId, db.select({ id: kpm.id }).from(kpm).where(inArray(kpm.kelompokId, kelompokIds))),
                            limit: activityLimit,
                            orderBy: desc(usaha.createdAt),
                            with: { kpm: { columns: { id: true, namaLengkap: true, kelompokId: true } } }
                        }),
                        db.query.prestasi.findMany({
                            where: inArray(prestasi.kpmId, db.select({ id: kpm.id }).from(kpm).where(inArray(kpm.kelompokId, kelompokIds))),
                            limit: activityLimit,
                            orderBy: desc(prestasi.createdAt),
                            with: { kpm: { columns: { id: true, namaLengkap: true, kelompokId: true } } }
                        }),
                        db.query.permasalahan.findMany({
                            where: inArray(permasalahan.kpmId, db.select({ id: kpm.id }).from(kpm).where(inArray(kpm.kelompokId, kelompokIds))),
                            limit: activityLimit,
                            orderBy: desc(permasalahan.createdAt),
                            with: { kpm: { columns: { id: true, namaLengkap: true, kelompokId: true } } }
                        }),
                        db.query.graduasi.findMany({
                            where: inArray(graduasi.kpmId, db.select({ id: kpm.id }).from(kpm).where(inArray(kpm.kelompokId, kelompokIds))),
                            limit: activityLimit,
                            orderBy: desc(graduasi.createdAt),
                            with: { kpm: { columns: { id: true, namaLengkap: true, kelompokId: true } } }
                        }),
                        db.query.kpm.findMany({
                            where: inArray(kpm.kelompokId, kelompokIds),
                            limit: activityLimit,
                            orderBy: desc(kpm.createdAt),
                            with: { kelompok: { columns: { id: true, namaKelompok: true } } }
                        })
                    ]);

                    recentActivities = [
                        ...absensiRecent.map(a => ({ id: a.id, kelompokId: a.kelompokId, type: 'Absensi', subject: a.kelompok?.namaKelompok || 'Kelompok', detail: `Absensi pertemuan tanggal ${new Date(a.tanggal).toLocaleDateString('id-ID')}`, status: 'Selesai', createdAt: a.createdAt })),
                        ...usahaRecent.map(u => ({ id: u.id, kelompokId: u.kpm?.kelompokId || '', type: 'Usaha', subject: u.kpm?.namaLengkap || 'KPM', detail: `Update data usaha: ${u.namaUsaha}`, status: 'Selesai', createdAt: u.createdAt })),
                        ...prestasiRecent.map(p => ({ id: p.id, kelompokId: p.kpm?.kelompokId || '', type: 'Prestasi', subject: p.kpm?.namaLengkap || 'KPM', detail: `Input prestasi: ${p.namaPrestasi || p.jenisPrestasi}`, status: 'Selesai', createdAt: p.createdAt })),
                        ...permasalahanRecent.map(pr => ({ id: pr.id, kelompokId: pr.kpm?.kelompokId || '', type: 'Permasalahan', subject: pr.kpm?.namaLengkap || 'KPM', detail: `Laporan masalah: ${pr.judulMasalah}`, status: 'Proses', createdAt: pr.createdAt })),
                        ...graduasiRecent.map(g => ({ id: g.id, kelompokId: g.kpm?.kelompokId || '', type: 'Graduasi', subject: g.kpm?.namaLengkap || 'KPM', detail: `Proses graduasi: ${g.jenisGraduasi}`, status: 'Selesai', createdAt: g.createdAt })),
                        ...kpmRecent.map(k => ({ id: k.id, kelompokId: k.kelompokId, type: 'KPM', subject: k.namaLengkap, detail: `Penambahan KPM baru di ${k.kelompok?.namaKelompok}`, status: 'Selesai', createdAt: k.createdAt }))
                    ];

                    // Calculate attendance trend for User (Filtered by Kelompok)
                    const attendanceData = await db.query.absensi.findMany({
                        where: and(gte(absensi.tanggal, dateStr), inArray(absensi.kelompokId, kelompokIds)),
                        with: { details: true }
                    });
                    attendanceTrend = processAttendanceTrend(attendanceData);
                }
            }

            // Final sort and limit
            recentActivities = recentActivities
                .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                .slice(0, 10);

            const upcomingSchedules = await jadwalService.getUpcoming(userId, req.user!.role);

            res.json({
                success: true,
                data: {
                    totalKelompok: kelompokCount.count,
                    totalKpm: kpmCount,
                    totalUsaha: usahaCount,
                    totalPrestasi: prestasiCount,
                    totalPermasalahan: permasalahanCount,
                    totalGraduasi: graduasiCount,
                    recentActivities,
                    upcomingSchedules,
                    attendanceTrend,
                },
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * GET /api/reports/kelompok/:id
     * Comprehensive kelompok report
     */
    async getKelompokReport(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;

            // Get kelompok with pendamping
            const kelompokData = await db.query.kelompok.findFirst({
                where: eq(kelompok.id, id),
                with: {
                    pendamping: { columns: { id: true, name: true, email: true } },
                },
            });

            if (!kelompokData) {
                return res.status(404).json({ success: false, error: 'Kelompok tidak ditemukan' });
            }

            // Get all statistics
            const [kpmStats, usahaStats, prestasiStats, permasalahanStats, graduasiStats, absensiStats] = await Promise.all([
                db.select({ count: count() }).from(kpm).where(and(eq(kpm.kelompokId, id), eq(kpm.isActive, true))),
                db.select({ count: count() }).from(usaha).innerJoin(kpm, eq(usaha.kpmId, kpm.id)).where(and(eq(kpm.kelompokId, id), eq(kpm.isActive, true))),
                db.select({ count: count() }).from(prestasi).innerJoin(kpm, eq(prestasi.kpmId, kpm.id)).where(and(eq(kpm.kelompokId, id), eq(kpm.isActive, true))),
                db.select({ count: count() }).from(permasalahan).innerJoin(kpm, eq(permasalahan.kpmId, kpm.id)).where(and(eq(kpm.kelompokId, id), eq(kpm.isActive, true))),
                db.select({ count: count() }).from(graduasi).innerJoin(kpm, eq(graduasi.kpmId, kpm.id)).where(eq(kpm.kelompokId, id)),
                db.select({ count: count() }).from(absensi).where(eq(absensi.kelompokId, id)),
            ]);

            res.json({
                success: true,
                data: {
                    kelompok: kelompokData,
                    statistics: {
                        totalKpm: kpmStats[0].count,
                        totalUsaha: usahaStats[0].count,
                        totalPrestasi: prestasiStats[0].count,
                        totalPermasalahan: permasalahanStats[0].count,
                        totalGraduasi: graduasiStats[0].count,
                        totalAbsensi: absensiStats[0].count,
                    },
                },
            });
        } catch (error) {
            next(error);
        }
    }

}


function processAttendanceTrend(attendanceData: any[]) {
    // Initialize last 6 months buckets
    const last6Months: { label: string; total: number; present: number }[] = [];
    for (let i = 5; i >= 0; i--) {
        const d = new Date();
        d.setMonth(d.getMonth() - i);
        d.setDate(1);
        last6Months.push({
            label: d.toLocaleDateString('id-ID', { month: 'short' }),
            total: 0,
            present: 0
        });
    }

    // Aggregate data
    attendanceData.forEach(record => {
        const recordDate = new Date(record.tanggal);
        const monthLabel = recordDate.toLocaleDateString('id-ID', { month: 'short' });
        const monthStat = last6Months.find(m => m.label === monthLabel);

        if (monthStat && record.details) {
            record.details.forEach((detail: any) => {
                monthStat.total++;
                if (detail.status === 'hadir') {
                    monthStat.present++;
                }
            });
        }
    });

    // Calculate percentage
    return last6Months.map(m => ({
        month: m.label,
        percentage: m.total > 0 ? Math.round((m.present / m.total) * 100) : 0
    }));
}

export const reportsController = new ReportsController();
