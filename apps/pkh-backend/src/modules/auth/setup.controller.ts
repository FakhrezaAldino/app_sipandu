import { Request, Response, NextFunction } from 'express';
import { auth } from '../../lib/auth';
import { ApiResponse } from '../../types/dto';

export class SetupController {


    /**
     * GET /api/auth/debug-session
     * Return current session data as seen by the server
     */
    async getDebugSession(req: Request, res: Response, next: NextFunction) {
        try {
            const session = await auth.api.getSession({
                headers: req.headers
            });

            res.json({
                success: true,
                session: session?.session,
                user: session?.user,
                serverTime: new Date().toISOString()
            });
        } catch (error) {
            next(error);
        }
    }
}

export const setupController = new SetupController();
