import { Request, Response, NextFunction } from 'express';
import { db } from '../../db';
import { usaha, kpm, kelompok } from '../../db/schema';
import { eq } from 'drizzle-orm';

/**
 * Middleware to check if user has access to a specific usaha record
 * through their kelompok ownership (via KPM)
 */
export const requireUsahaAccess = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        // Admin has access to everything
        if (req.user?.role === 'admin') {
            return next();
        }

        const usahaId = req.params.id;

        if (!usahaId) {
            res.status(400).json({
                success: false,
                error: 'Bad Request',
                message: 'Usaha ID is required',
            });
            return;
        }

        // Get usaha with kpm and kelompok
        const usahaRecord = await db.query.usaha.findFirst({
            where: eq(usaha.id, usahaId),
            with: {
                kpm: {
                    with: {
                        kelompok: true,
                    },
                },
            },
        });

        if (!usahaRecord) {
            res.status(404).json({
                success: false,
                error: 'Not Found',
                message: 'Usaha record not found',
            });
            return;
        }

        if (usahaRecord.kpm.kelompok.pendampingId !== req.user?.id) {
            res.status(403).json({
                success: false,
                error: 'Forbidden',
                message: 'You do not have access to this usaha record',
            });
            return;
        }

        next();
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Internal Server Error',
            message: 'Failed to verify usaha access',
        });
    }
};
