import { Request, Response, NextFunction } from 'express';
import { kpmService } from './kpm.service';

export class KpmController {
    /**
     * GET /api/kelompok/:kelompokId/kpm
     */
    async findByKelompok(req: Request, res: Response, next: NextFunction) {
        try {
            const { kelompokId } = req.params;
            const { page, limit, q } = req.query;

            const result = await kpmService.findByKelompok(kelompokId, {
                page: page ? parseInt(page as string) : undefined,
                limit: limit ? parseInt(limit as string) : undefined,
                search: q as string,
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
     * GET /api/kpm/:id
     */
    async findById(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;
            const result = await kpmService.findById(id);

            res.json({
                success: true,
                data: result,
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * GET /api/kpm/:id/summary
     */
    async getSummary(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;
            const result = await kpmService.getSummary(id);

            res.json({
                success: true,
                data: result,
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * POST /api/kelompok/:kelompokId/kpm
     */
    async create(req: Request, res: Response, next: NextFunction) {
        try {
            const { kelompokId } = req.params;
            const result = await kpmService.create(kelompokId, req.body);

            res.status(201).json({
                success: true,
                message: 'KPM berhasil ditambahkan',
                data: result,
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * PATCH /api/kpm/:id
     */
    async update(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;
            const result = await kpmService.update(id, req.body);

            res.json({
                success: true,
                message: 'Data KPM berhasil diperbarui',
                data: result,
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * DELETE /api/kpm/:id
     */
    async delete(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;
            await kpmService.delete(id);

            res.json({
                success: true,
                message: 'KPM berhasil dihapus',
            });
        } catch (error) {
            next(error);
        }
    }
}

export const kpmController = new KpmController();
