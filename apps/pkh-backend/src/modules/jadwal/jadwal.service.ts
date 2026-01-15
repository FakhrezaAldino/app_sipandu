import { db } from '../../db';
import { jadwal, kelompok } from '../../db/schema';
import { eq, and, desc, gte } from 'drizzle-orm';

function startOfDay(date: Date): Date {
    // Create a date at the start of the current day in local timezone
    const newDate = new Date(date);
    newDate.setHours(0, 0, 0, 0);
    return newDate;
}

export class JadwalService {
    async create(data: typeof jadwal.$inferInsert) {
        // Ensure tanggal is a Date object
        const payload = {
            ...data,
            tanggal: new Date(data.tanggal),
        };
        const [newJadwal] = await db.insert(jadwal).values(payload).returning();
        return newJadwal;
    }

    async getByKelompok(kelompokId: string) {
        return await db.query.jadwal.findMany({
            where: eq(jadwal.kelompokId, kelompokId),
            orderBy: desc(jadwal.tanggal),
            with: {
                kelompok: true,
            },
        });
    }

    async getUpcoming(userId: string, role: string = 'pendamping', limit: number = 5) {
        const now = new Date();
        const startOfToday = startOfDay(now);

        let kelompokIds: string[] = [];

        if (role === 'admin') {
            // Admin sees all schedules
        } else {
            // Get user's groups first
            const userKelompoks = await db.query.kelompok.findMany({
                where: eq(kelompok.pendampingId, userId),
                columns: { id: true },
            });

            kelompokIds = userKelompoks.map(k => k.id);

            if (kelompokIds.length === 0) {
                return [];
            }
        }

        // Query schedules
        const result = await db.query.jadwal.findMany({
            where: (jdwl, { and, inArray, gte, eq: eqOp }) => {
                const conditions: any[] = [
                    gte(jdwl.tanggal, startOfToday),
                    eqOp(jdwl.status, 'terjadwal')
                ];

                // Only add kelompok filter for non-admin users
                if (role !== 'admin' && kelompokIds.length > 0) {
                    conditions.push(inArray(jdwl.kelompokId, kelompokIds));
                }

                return and(...conditions);
            },
            orderBy: (jdwl, { asc }) => [asc(jdwl.tanggal)],
            limit: limit,
            with: {
                kelompok: true,
            },
        });

        return result;
    }
}

export const jadwalService = new JadwalService();
