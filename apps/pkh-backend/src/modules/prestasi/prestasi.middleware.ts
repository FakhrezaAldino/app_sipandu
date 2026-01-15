import { Request, Response, NextFunction } from 'express';
import { db } from '../../db';
import { prestasi, kpm, kelompok } from '../../db/schema';
import { eq } from 'drizzle-orm';

/**
 * Middleware to check if user has access to a specific prestasi record
 * through their kelompok ownership (via KPM)
 */
export const requirePrestasiAccess = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        if (req.user?.role === 'admin') {
            return next();
        }

        const prestasiId = req.params.id;
        if (!prestasiId) {
            res.status(400).json({ success: false, error: 'Bad Request', message: 'Prestasi ID is required' });
            return;
        }

        const record = await db.query.prestasi.findFirst({
            where: eq(prestasi.id, prestasiId),
            with: { kpm: { with: { kelompok: true } } },
        });

        if (!record) {
            res.status(404).json({ success: false, error: 'Not Found', message: 'Prestasi record not found' });
            return;
        }

        if (record.kpm.kelompok.pendampingId !== req.user?.id) {
            res.status(403).json({ success: false, error: 'Forbidden', message: 'You do not have access to this prestasi record' });
            return;
        }

        next();
    } catch (error) {
        res.status(500).json({ success: false, error: 'Internal Server Error', message: 'Failed to verify prestasi access' });
    }
};
