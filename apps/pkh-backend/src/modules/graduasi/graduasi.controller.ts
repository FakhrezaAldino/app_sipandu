import { Request, Response, NextFunction } from 'express';
import { graduasiService } from './graduasi.service';

export class GraduasiController {
    async findByKelompok(req: Request, res: Response, next: NextFunction) {
        try {
            const { kelompokId } = req.params;
            const { page, limit } = req.query;
            const result = await graduasiService.findByKelompok(kelompokId, {
                page: page ? parseInt(page as string) : undefined,
                limit: limit ? parseInt(limit as string) : undefined,
            });
            res.json({ success: true, ...result });
        } catch (error) { next(error); }
    }

    async findById(req: Request, res: Response, next: NextFunction) {
        try { res.json({ success: true, data: await graduasiService.findById(req.params.id) }); } catch (error) { next(error); }
    }

    async create(req: Request, res: Response, next: NextFunction) {
        try {
            const result = await graduasiService.create(req.params.kpmId, req.body);
            res.status(201).json({ success: true, message: 'KPM berhasil digraduasi', data: result });
        } catch (error) { next(error); }
    }

    async update(req: Request, res: Response, next: NextFunction) {
        try {
            const result = await graduasiService.update(req.params.id, req.body, req.user?.id);
            res.json({ success: true, message: 'Data graduasi berhasil diperbarui', data: result });
        } catch (error) { next(error); }
    }

    async delete(req: Request, res: Response, next: NextFunction) {
        try {
            await graduasiService.delete(req.params.id);
            res.json({ success: true, message: 'Graduasi berhasil dibatalkan' });
        } catch (error) { next(error); }
    }
}

export const graduasiController = new GraduasiController();
