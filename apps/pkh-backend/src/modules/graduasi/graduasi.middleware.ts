import { Request, Response, NextFunction } from 'express';
import { db } from '../../db';
import { graduasi } from '../../db/schema';
import { eq } from 'drizzle-orm';

/**
 * Middleware to check if user has access to a specific graduasi record
 */
export const requireGraduasiAccess = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        if (req.user?.role === 'admin') {
            return next();
        }

        const graduasiId = req.params.id;
        if (!graduasiId) {
            res.status(400).json({ success: false, error: 'Bad Request', message: 'Graduasi ID is required' });
            return;
        }

        const record = await db.query.graduasi.findFirst({
            where: eq(graduasi.id, graduasiId),
            with: { kpm: { with: { kelompok: true } } },
        });

        if (!record) {
            res.status(404).json({ success: false, error: 'Not Found', message: 'Graduasi record not found' });
            return;
        }

        if (record.kpm.kelompok.pendampingId !== req.user?.id) {
            res.status(403).json({ success: false, error: 'Forbidden', message: 'You do not have access to this graduasi record' });
            return;
        }

        next();
    } catch (error) {
        res.status(500).json({ success: false, error: 'Internal Server Error', message: 'Failed to verify graduasi access' });
    }
};
