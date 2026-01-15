import { Request, Response, NextFunction } from 'express';
import { kelompokService } from './kelompok.service';

export class KelompokController {
    /**
     * GET /api/kelompok
     * List all kelompok (filtered by role)
     */
    async findAll(req: Request, res: Response, next: NextFunction) {
        try {
            const { page, limit, q, date } = req.query;
            const pendampingId = req.user?.role === 'admin' ? undefined : req.user?.id;

            const result = await kelompokService.findAll({
                page: page ? parseInt(page as string) : undefined,
                limit: limit ? parseInt(limit as string) : undefined,
                pendampingId,
                search: q as string,
                date: date as string,
            });

            res.json({
                success: true,
                ...result,
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * GET /api/kelompok/:id
     * Get kelompok by ID
     */
    async findById(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;
            const result = await kelompokService.findById(id);

            res.json({
                success: true,
                data: result,
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * POST /api/kelompok
     * Create new kelompok
     */
    async create(req: Request, res: Response, next: NextFunction) {
        try {
            const result = await kelompokService.create(req.user!.id, req.body);

            res.status(201).json({
                success: true,
                message: 'Kelompok berhasil dibuat',
                data: result,
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * PATCH /api/kelompok/:id
     * Update kelompok
     */
    async update(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;
            const result = await kelompokService.update(id, req.body);

            res.json({
                success: true,
                message: 'Kelompok berhasil diperbarui',
                data: result,
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * DELETE /api/kelompok/:id
     * Delete kelompok
     */
    async delete(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;
            await kelompokService.delete(id);

            res.json({
                success: true,
                message: 'Kelompok berhasil dihapus',
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * GET /api/kelompok/:id/stats
     * Get kelompok statistics
     */
    async getStats(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;
            const result = await kelompokService.getStats(id);

            res.json({
                success: true,
                data: result,
            });
        } catch (error) {
            next(error);
        }
    }
}

export const kelompokController = new KelompokController();
