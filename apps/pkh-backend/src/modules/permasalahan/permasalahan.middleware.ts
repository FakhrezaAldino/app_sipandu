import { Request, Response, NextFunction } from 'express';
import { db } from '../../db';
import { permasalahan } from '../../db/schema';
import { eq } from 'drizzle-orm';

/**
 * Middleware to check if user has access to a specific permasalahan record
 */
export const requirePermasalahanAccess = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        if (req.user?.role === 'admin') {
            return next();
        }

        const permasalahanId = req.params.id;
        if (!permasalahanId) {
            res.status(400).json({ success: false, error: 'Bad Request', message: 'Permasalahan ID is required' });
            return;
        }

        const record = await db.query.permasalahan.findFirst({
            where: eq(permasalahan.id, permasalahanId),
            with: { kpm: { with: { kelompok: true } } },
        });

        if (!record) {
            res.status(404).json({ success: false, error: 'Not Found', message: 'Permasalahan record not found' });
            return;
        }

        if (record.kpm.kelompok.pendampingId !== req.user?.id) {
            res.status(403).json({ success: false, error: 'Forbidden', message: 'You do not have access to this permasalahan record' });
            return;
        }

        next();
    } catch (error) {
        res.status(500).json({ success: false, error: 'Internal Server Error', message: 'Failed to verify permasalahan access' });
    }
};
