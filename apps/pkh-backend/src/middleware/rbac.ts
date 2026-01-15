import { Request, Response, NextFunction } from 'express';
import { db } from '../db';
import { kelompok, kpm } from '../db/schema';
import { eq } from 'drizzle-orm';

/**
 * Middleware to check if user has access to a specific kelompok
 * Admin has access to all, Pendamping only to their own
 */
export const requireKelompokAccess = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        // Admin has access to everything
        if (req.user?.role === 'admin') {
            return next();
        }

        // Get kelompokId from params
        const kelompokId = req.params.kelompokId || req.params.id;

        if (!kelompokId) {
            res.status(400).json({
                success: false,
                error: 'Bad Request',
                message: 'Kelompok ID is required',
            });
            return;
        }

        // Check if user is the owner of the kelompok
        const kelompokRecord = await db.query.kelompok.findFirst({
            where: eq(kelompok.id, kelompokId),
        });

        if (!kelompokRecord) {
            res.status(404).json({
                success: false,
                error: 'Not Found',
                message: 'Kelompok not found',
            });
            return;
        }

        if (kelompokRecord.pendampingId !== req.user?.id) {
            res.status(403).json({
                success: false,
                error: 'Forbidden',
                message: 'You do not have access to this kelompok',
            });
            return;
        }

        // Attach kelompok to request for later use
        req.kelompok = kelompokRecord;
        next();
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Internal Server Error',
            message: 'Failed to verify kelompok access',
        });
    }
};

/**
 * Middleware to check if user has access to a specific KPM
 * through their kelompok ownership
 */
export const requireKpmAccess = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        // Admin has access to everything
        if (req.user?.role === 'admin') {
            return next();
        }

        // Get kpmId from params
        const kpmId = req.params.kpmId || req.params.id;

        if (!kpmId) {
            res.status(400).json({
                success: false,
                error: 'Bad Request',
                message: 'KPM ID is required',
            });
            return;
        }

        // Get KPM with kelompok
        const kpmRecord = await db.query.kpm.findFirst({
            where: eq(kpm.id, kpmId),
            with: {
                kelompok: true,
            },
        });

        if (!kpmRecord) {
            res.status(404).json({
                success: false,
                error: 'Not Found',
                message: 'KPM not found',
            });
            return;
        }

        if (kpmRecord.kelompok.pendampingId !== req.user?.id) {
            res.status(403).json({
                success: false,
                error: 'Forbidden',
                message: 'You do not have access to this KPM',
            });
            return;
        }

        // Attach KPM to request for later use
        req.kpm = kpmRecord;
        next();
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Internal Server Error',
            message: 'Failed to verify KPM access',
        });
    }
};

// Extend Express Request type for RBAC
declare global {
    namespace Express {
        interface Request {
            kelompok?: typeof kelompok.$inferSelect;
            kpm?: typeof kpm.$inferSelect & { kelompok: typeof kelompok.$inferSelect };
        }
    }
}
