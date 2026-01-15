import { Request, Response, NextFunction } from 'express';
import { permasalahanService } from './permasalahan.service';

export class PermasalahanController {
    async findByKelompok(req: Request, res: Response, next: NextFunction) {
        try {
            const { kelompokId } = req.params;
            const { page, limit } = req.query;
            const result = await permasalahanService.findByKelompok(kelompokId, { page: page ? parseInt(page as string) : undefined, limit: limit ? parseInt(limit as string) : undefined });
            res.json({ success: true, ...result });
        } catch (error) { next(error); }
    }

    async findByKpm(req: Request, res: Response, next: NextFunction) {
        try {
            const { kpmId } = req.params;
            const { page, limit } = req.query;
            const result = await permasalahanService.findByKpm(kpmId, { page: page ? parseInt(page as string) : undefined, limit: limit ? parseInt(limit as string) : undefined });
            res.json({ success: true, ...result });
        } catch (error) { next(error); }
    }

    async findById(req: Request, res: Response, next: NextFunction) {
        try { res.json({ success: true, data: await permasalahanService.findById(req.params.id) }); } catch (error) { next(error); }
    }

    async create(req: Request, res: Response, next: NextFunction) {
        try {
            const result = await permasalahanService.create(req.params.kpmId, req.body);
            res.status(201).json({ success: true, message: 'Permasalahan berhasil ditambahkan', data: result });
        } catch (error) { next(error); }
    }

    async update(req: Request, res: Response, next: NextFunction) {
        try {
            const result = await permasalahanService.update(req.params.id, req.body);
            res.json({ success: true, message: 'Permasalahan berhasil diperbarui', data: result });
        } catch (error) { next(error); }
    }

    async delete(req: Request, res: Response, next: NextFunction) {
        try { await permasalahanService.delete(req.params.id); res.json({ success: true, message: 'Permasalahan berhasil dihapus' }); } catch (error) { next(error); }
    }
}

export const permasalahanController = new PermasalahanController();
