import { Request, Response, NextFunction } from 'express';
import { db } from '../../db';
import { absensi, kelompok } from '../../db/schema';
import { eq } from 'drizzle-orm';

/**
 * Middleware to check if user has access to a specific absensi record
 * through their kelompok ownership
 */
export const requireAbsensiAccess = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        // Admin has access to everything
        if (req.user?.role === 'admin') {
            return next();
        }

        const absensiId = req.params.id;

        if (!absensiId) {
            res.status(400).json({
                success: false,
                error: 'Bad Request',
                message: 'Absensi ID is required',
            });
            return;
        }

        // Get absensi with kelompok
        const absensiRecord = await db.query.absensi.findFirst({
            where: eq(absensi.id, absensiId),
            with: {
                kelompok: true,
            },
        });

        if (!absensiRecord) {
            res.status(404).json({
                success: false,
                error: 'Not Found',
                message: 'Absensi record not found',
            });
            return;
        }

        if (absensiRecord.kelompok.pendampingId !== req.user?.id) {
            res.status(403).json({
                success: false,
                error: 'Forbidden',
                message: 'You do not have access to this absensi record',
            });
            return;
        }

        next();
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Internal Server Error',
            message: 'Failed to verify absensi access',
        });
    }
};
