import { Request, Response, NextFunction } from 'express';
import PDFDocument from 'pdfkit';
import { db } from '../../db';
import { users, accounts, pendampings, kelompok, kpm, absensi, usaha, prestasi, permasalahan, graduasi } from '../../db/schema';
import { auth } from '../../lib/auth';
import { count, eq, and, ilike, sql, inArray } from 'drizzle-orm';
import { calculateOffset, paginate } from '../../lib/utils';
import { ApiResponse, PaginatedResponse, AdminDashboardSummaryDTO, UserDTO, KelompokDTO, KpmDTO } from '../../types/dto';
import { config } from '../../config';

export class AdminController {
    /**
     * Check user existence (Public)
     */
    async checkUserPublic(req: Request, res: Response, next: NextFunction) {
        try {
            const email = req.query.email as string;
            const user = await db.query.users.findFirst({
                where: (users, { eq }) => eq(users.email, email),
                columns: { id: true, email: true, name: true, role: true, emailVerified: true, isActive: true }
            });
            res.json({
                success: true,
                exists: !!user,
                user
            });
        } catch (error) {
            next(error);
        }
    }
    /**
     * Manual sync for Jadwal table
     */
    async syncJadwal(req: Request, res: Response, next: NextFunction) {
        try {
            // Create Enum
            await db.execute(sql`
                DO $$ BEGIN
                    CREATE TYPE status_jadwal AS ENUM ('terjadwal', 'selesai', 'dibatalkan');
                EXCEPTION
                    WHEN duplicate_object THEN null;
                END $$;
            `);

            // Create Table
            await db.execute(sql`
                CREATE TABLE IF NOT EXISTS jadwal (
                    id text PRIMARY KEY,
                    kelompok_id text NOT NULL REFERENCES kelompok(id) ON DELETE CASCADE,
                    tanggal timestamp NOT NULL,
                    lokasi text NOT NULL,
                    aktivitas text NOT NULL,
                    catatan text,
                    status status_jadwal NOT NULL DEFAULT 'terjadwal',
                    created_at timestamp NOT NULL DEFAULT NOW(),
                    updated_at timestamp NOT NULL DEFAULT NOW()
                );
            `);

            res.json({ success: true, message: 'Jadwal table synced successfully' });
        } catch (error) {
            next(error);
        }
    }
    /**
     * GET /api/admin/dashboard/summary
     * Comprehensive summary statistics for admin
     */
    async getDashboardSummary(req: Request, res: Response, next: NextFunction) {
        try {
            const [
                pendampingCount,
                kelompokCount,
                kpmCount,
                absensiCount,
                usahaCount,
                prestasiCount,
                permasalahanCount,
                graduasiCount
            ] = await Promise.all([
                db.select({ count: count() }).from(users).where(eq(users.role, 'pendamping')),
                db.select({ count: count() }).from(kelompok),
                db.select({ count: count() }).from(kpm), // Count all KPM including inactive
                db.select({ count: count() }).from(absensi),
                db.select({ count: count() }).from(usaha), // Count all Usaha
                db.select({ count: count() }).from(prestasi), // Count all Prestasi
                db.select({ count: count() }).from(permasalahan), // Count all Permasalahan
                db.select({ count: count() }).from(graduasi), // Count all Graduasi
            ]);

            const summary: AdminDashboardSummaryDTO = {
                totalPendamping: pendampingCount[0].count,
                totalKelompok: kelompokCount[0].count,
                totalKpm: kpmCount[0].count,
                totalAbsensi: absensiCount[0].count,
                totalUsaha: usahaCount[0].count,
                totalPrestasi: prestasiCount[0].count,
                totalPermasalahan: permasalahanCount[0].count,
                totalGraduasi: graduasiCount[0].count,
            };

            const response: ApiResponse<AdminDashboardSummaryDTO> = {
                success: true,
                data: summary,
            };

            res.json(response);
        } catch (error) {
            next(error);
        }
    }

    /**
     * GET /api/admin/pendamping
     * List all pendamping users
     */
    async listPendamping(req: Request, res: Response, next: NextFunction) {
        try {
            const list = await db.query.users.findMany({
                where: eq(users.role, 'pendamping'),
                orderBy: (users, { desc }) => [desc(users.createdAt)],
            });

            const response: ApiResponse<any[]> = {
                success: true,
                data: list,
            };

            res.json(response);
        } catch (error) {
            next(error);
        }
    }

    /**
     * POST /api/admin/pendamping
     * Create a new pendamping account and profile (Transaction)
     */
    async createPendamping(req: Request, res: Response, next: NextFunction) {
        try {
            const { name, email, nik, no_hp, wilayah_binaan } = req.body;

            if (!nik) {
                return res.status(400).json({ success: false, error: 'NIK is required and will be used as default password.' });
            }

            // Start Database Transaction
            const result = await db.transaction(async (tx) => {
                // 1. Check if user already exists
                const existingUser = await tx.query.users.findFirst({
                    where: eq(users.email, email.toLowerCase()),
                });

                if (existingUser) {
                    throw new Error('Email sudah terdaftar');
                }

                // 2. Hash NIK as the default password
                // Better Auth uses scrypt by default through its context
                const ctx = await auth.$context;
                const hashedPassword = await ctx.password.hash(nik);

                // 3. Create User in Better Auth compatible way
                // We use UUID-like text ID as per project standard
                const userId = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);

                const [newUser] = await tx.insert(users).values({
                    id: userId,
                    name,
                    email: email.toLowerCase(),
                    role: 'pendamping',
                    emailVerified: true,
                    isFirstLogin: true, // Mark as first login
                }).returning();

                // 4. Create record in 'accounts' table for Better Auth credentials
                await tx.insert(accounts).values({
                    id: Math.random().toString(36).substring(2, 15),
                    userId: newUser.id,
                    accountId: newUser.id,
                    providerId: 'credential',
                    password: hashedPassword,
                });

                // 5. Create Pendamping Profile
                const [profile] = await tx.insert(pendampings).values({
                    userId: newUser.id,
                    nama: name,
                    nik,
                    noHp: no_hp,
                    wilayahBinaan: wilayah_binaan,
                }).returning();

                return { user: newUser, profile };
            });

            const response: ApiResponse<any> = {
                success: true,
                message: 'Pendamping dan profil berhasil ditambahkan',
                data: result,
            };

            res.status(201).json(response);
        } catch (error: any) {
            if (error.message === 'Email sudah terdaftar') {
                return res.status(400).json({ success: false, error: error.message });
            }
            if (error.code === '23505') { // Postgres Unique Constraint Error
                return res.status(400).json({ success: false, error: 'NIK atau Email sudah terdaftar' });
            }
            next(error);
        }
    }



    /**
     * PUT /api/admin/pendamping/:id
     * Update pendamping details
     */
    async updatePendamping(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;
            const { name, email } = req.body;

            const [updated] = await db
                .update(users)
                .set({ name, email, updatedAt: new Date() })
                .where(and(eq(users.id, id), eq(users.role, 'pendamping')))
                .returning();

            if (!updated) {
                return res.status(404).json({ success: false, error: 'Pendamping tidak ditemukan' });
            }

            const response: ApiResponse<UserDTO> = {
                success: true,
                message: 'Profil pendamping berhasil diperbarui',
                data: updated as UserDTO,
            };

            res.json(response);
        } catch (error) {
            next(error);
        }
    }

    /**
     * PATCH /api/admin/pendamping/:id/deactivate
     * Toggle pendamping active status
     */
    async togglePendampingStatus(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;
            const { isActive } = req.body;

            const [updated] = await db
                .update(users)
                .set({ isActive, updatedAt: new Date() })
                .where(and(eq(users.id, id), eq(users.role, 'pendamping')))
                .returning();

            if (!updated) {
                return res.status(404).json({ success: false, error: 'Pendamping tidak ditemukan' });
            }

            const response: ApiResponse<UserDTO> = {
                success: true,
                message: `Status pendamping berhasil di${isActive ? 'aktifkan' : 'nonaktifkan'}`,
                data: updated as UserDTO,
            };

            res.json(response);
        } catch (error) {
            next(error);
        }
    }

    /**
     * GET /api/admin/kelompok
     * List all kelompok with pendamping data
     */
    async listKelompok(req: Request, res: Response, next: NextFunction) {
        try {
            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 10;
            const q = req.query.q as string;
            const pendampingId = req.query.pendampingId as string;

            const whereClauses = [];
            if (q) {
                whereClauses.push(ilike(kelompok.namaKelompok, `%${q}%`));
            }
            if (pendampingId) {
                whereClauses.push(eq(kelompok.pendampingId, pendampingId));
            }

            const where = whereClauses.length > 0 ? and(...whereClauses) : undefined;

            const [totalResult] = await db
                .select({ count: count() })
                .from(kelompok)
                .where(where);

            const total = totalResult.count;
            const offset = calculateOffset(page, limit);

            const data = await db.query.kelompok.findMany({
                where,
                limit,
                offset,
                with: {
                    pendamping: {
                        columns: {
                            id: true,
                            name: true,
                            email: true,
                            isActive: true,
                            createdAt: true,
                            role: true,
                        },
                    },
                },
                orderBy: (kelompok, { desc }) => [desc(kelompok.createdAt)],
            });

            // Fetch counts for these kelompoks
            const kelompokIds = data.map((k) => k.id);
            const [kpmCounts, usahaCounts, prestasiCounts, permasalahanCounts, graduasiCounts] = await Promise.all([
                kelompokIds.length > 0
                    ? db.select({ id: kpm.kelompokId, count: count() }).from(kpm).where(and(inArray(kpm.kelompokId, kelompokIds), eq(kpm.isActive, true))).groupBy(kpm.kelompokId)
                    : Promise.resolve([]),
                kelompokIds.length > 0
                    ? db.select({ id: kpm.kelompokId, count: count() }).from(usaha).innerJoin(kpm, eq(usaha.kpmId, kpm.id)).where(and(inArray(kpm.kelompokId, kelompokIds), eq(kpm.isActive, true))).groupBy(kpm.kelompokId)
                    : Promise.resolve([]),
                kelompokIds.length > 0
                    ? db.select({ id: kpm.kelompokId, count: count() }).from(prestasi).innerJoin(kpm, eq(prestasi.kpmId, kpm.id)).where(and(inArray(kpm.kelompokId, kelompokIds), eq(kpm.isActive, true))).groupBy(kpm.kelompokId)
                    : Promise.resolve([]),
                kelompokIds.length > 0
                    ? db.select({ id: kpm.kelompokId, count: count() }).from(permasalahan).innerJoin(kpm, eq(permasalahan.kpmId, kpm.id)).where(and(inArray(kpm.kelompokId, kelompokIds), eq(kpm.isActive, true))).groupBy(kpm.kelompokId)
                    : Promise.resolve([]),
                kelompokIds.length > 0
                    ? db.select({ id: kpm.kelompokId, count: count() }).from(graduasi).innerJoin(kpm, eq(graduasi.kpmId, kpm.id)).where(inArray(kpm.kelompokId, kelompokIds)).groupBy(kpm.kelompokId)
                    : Promise.resolve([]),
            ]);

            const kpmMap = new Map(kpmCounts.map((c) => [c.id, Number(c.count)]));
            const usahaMap = new Map(usahaCounts.map((c) => [c.id, Number(c.count)]));
            const prestasiMap = new Map(prestasiCounts.map((c) => [c.id, Number(c.count)]));
            const permasalahanMap = new Map(permasalahanCounts.map((c) => [c.id, Number(c.count)]));
            const graduasiMap = new Map(graduasiCounts.map((c) => [c.id, Number(c.count)]));

            const dataWithCounts = data.map((k) => ({
                ...k,
                kpmCount: kpmMap.get(k.id) || 0,
                usahaCount: usahaMap.get(k.id) || 0,
                prestasiCount: prestasiMap.get(k.id) || 0,
                permasalahanCount: permasalahanMap.get(k.id) || 0,
                graduasiCount: graduasiMap.get(k.id) || 0,
            }));

            const response: PaginatedResponse<KelompokDTO> = {
                success: true,
                ...paginate(dataWithCounts as any[], total, { page, limit }),
            };

            res.json(response);
        } catch (error) {
            next(error);
        }
    }

    /**
     * GET /api/admin/kpm
     * List all KPM with kelompok and graduasi info
     */
    async listKpm(req: Request, res: Response, next: NextFunction) {
        try {
            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 10;
            const q = req.query.q as string;
            const kelompokId = req.query.kelompokId as string;
            const statusGraduasi = req.query.statusGraduasi as string; // 'active' or 'graduated'

            const whereClauses = [];
            if (q) {
                whereClauses.push(
                    sql`(${ilike(kpm.namaLengkap, `%${q}%`)} OR ${ilike(kpm.nik, `%${q}%`)})`
                );
            }
            if (kelompokId) {
                whereClauses.push(eq(kpm.kelompokId, kelompokId));
            }

            const where = whereClauses.length > 0 ? and(...whereClauses) : undefined;

            const [totalResult] = await db
                .select({ count: count() })
                .from(kpm)
                .where(where);

            const total = totalResult.count;
            const offset = calculateOffset(page, limit);

            const data = await db.query.kpm.findMany({
                where,
                limit,
                offset,
                with: {
                    kelompok: {
                        columns: {
                            id: true,
                            namaKelompok: true,
                        },
                    },
                    graduasiRecords: {
                        limit: 1,
                        orderBy: (graduasi, { desc }) => [desc(graduasi.tanggalGraduasi)],
                    },
                },
                orderBy: (kpm, { desc }) => [desc(kpm.createdAt)],
            });

            // Map and filter by status if requested
            let filteredData = data.map(item => ({
                ...item,
                isGraduated: item.graduasiRecords.length > 0,
            }));

            if (statusGraduasi === 'graduated') {
                filteredData = filteredData.filter(item => item.isGraduated);
            } else if (statusGraduasi === 'active') {
                filteredData = filteredData.filter(item => !item.isGraduated);
            }

            const response: PaginatedResponse<KpmDTO> = {
                success: true,
                ...paginate(filteredData as any[], total, { page, limit }),
            };

            res.json(response);
        } catch (error) {
            next(error);
        }
    }

    /**
     * POST /api/admin/reports/pdf
     * Generate a PDF report of system statistics
     */
    async generatePdfReport(req: Request, res: Response, next: NextFunction) {
        try {
            // 1. Fetch data for the report in parallel
            const [
                [totalPendamping],
                [totalKelompok],
                [totalKpm],
                [totalAbsensi],
                [totalUsaha],
                [totalPrestasi],
                [totalPermasalahan],
                [totalGraduasi]
            ] = await Promise.all([
                db.select({ count: count() }).from(users).where(eq(users.role, 'pendamping')),
                db.select({ count: count() }).from(kelompok),
                db.select({ count: count() }).from(kpm),
                db.select({ count: count() }).from(absensi),
                db.select({ count: count() }).from(usaha),
                db.select({ count: count() }).from(prestasi),
                db.select({ count: count() }).from(permasalahan),
                db.select({ count: count() }).from(graduasi),
            ]);

            // 2. Create PDF document
            const doc = new PDFDocument({ margin: 50 });

            // Stream it directly to response
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', 'attachment; filename=pkh-report-summary.pdf');
            doc.pipe(res);

            // 3. Document Content
            // Header
            doc.fontSize(20).text('LAPORAN RINGKASAN SISTEM PKH', { align: 'center' });
            doc.moveDown();
            doc.fontSize(10).text(`Dicetak pada: ${new Date().toLocaleString('id-ID')}`, { align: 'right' });
            doc.moveDown();

            // Divider
            doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
            doc.moveDown();

            // Statistics Table-like Layout
            const stats = [
                { label: 'Total Pendamping', value: totalPendamping.count },
                { label: 'Total Kelompok', value: totalKelompok.count },
                { label: 'Total KPM', value: totalKpm.count },
                { label: 'Total Kehadiran Pertemuan', value: totalAbsensi.count },
                { label: 'Total Usaha KPM', value: totalUsaha.count },
                { label: 'Total Prestasi', value: totalPrestasi.count },
                { label: 'Total Permasalahan', value: totalPermasalahan.count },
                { label: 'Total Graduasi', value: totalGraduasi.count },
            ];

            doc.fontSize(14).text('Statistik Umum', { underline: true });
            doc.moveDown(0.5);

            stats.forEach(stat => {
                doc.fontSize(12).text(`${stat.label}:`, { continued: true });
                doc.text(` ${stat.value}`, { align: 'right' });
            });

            doc.moveDown();
            doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
            doc.moveDown();

            // Footer
            doc.fontSize(10).fillColor('grey').text('Antigravity PKH System - Laporan Otomatis', { align: 'center' });

            // Finalize PDF
            doc.end();
        } catch (error) {
            next(error);
        }
    }
}

export const adminController = new AdminController();
