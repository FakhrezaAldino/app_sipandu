import { Request, Response, NextFunction } from 'express';
import { auth } from '../lib/auth';
import type { User } from '../db/schema';

// Extend Express Request type
declare global {
    namespace Express {
        interface Request {
            user?: User;
            session?: {
                id: string;
                userId: string;
                token: string;
                expiresAt: Date;
            };
        }
    }
}

/**
 * Middleware to require authentication
 */
export const requireAuth = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const session = await auth.api.getSession({
            headers: req.headers as unknown as Headers,
        });

        if (!session) {
            res.status(401).json({
                success: false,
                error: 'Unauthorized',
                message: 'Authentication required',
            });
            return;
        }

        req.user = session.user as User;
        req.session = session.session;
        next();
    } catch (error) {
        res.status(401).json({
            success: false,
            error: 'Unauthorized',
            message: 'Invalid or expired session',
        });
    }
};

/**
 * Middleware to require admin role
 */
export const requireAdmin = (
    req: Request,
    res: Response,
    next: NextFunction
): void => {
    if (req.user?.role !== 'admin') {
        res.status(403).json({
            success: false,
            error: 'Forbidden',
            message: 'Admin access required',
        });
        return;
    }
    next();
};

/**
 * Middleware to require pendamping role (or admin)
 */
export const requirePendamping = (
    req: Request,
    res: Response,
    next: NextFunction
): void => {
    if (req.user?.role !== 'pendamping' && req.user?.role !== 'admin') {
        res.status(403).json({
            success: false,
            error: 'Forbidden',
            message: 'Pendamping access required',
        });
        return;
    }
    next();
};

/**
 * Optional auth middleware - attaches user if logged in, continues otherwise
 */
export const optionalAuth = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const session = await auth.api.getSession({
            headers: req.headers as unknown as Headers,
        });

        if (session) {
            req.user = session.user as User;
            req.session = session.session;
        }
        next();
    } catch {
        next();
    }
};
/**
 * Combined middleware to require authentication and admin role
 */
export const adminAuthMiddleware = [requireAuth, requireAdmin];
