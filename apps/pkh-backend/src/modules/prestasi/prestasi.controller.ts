import { Request, Response, NextFunction } from 'express';
import { prestasiService } from './prestasi.service';

export class PrestasiController {
    async findByKelompok(req: Request, res: Response, next: NextFunction) {
        try {
            const { kelompokId } = req.params;
            const { page, limit } = req.query;
            const result = await prestasiService.findByKelompok(kelompokId, { page: page ? parseInt(page as string) : undefined, limit: limit ? parseInt(limit as string) : undefined });
            res.json({ success: true, ...result });
        } catch (error) { next(error); }
    }

    async findByKpm(req: Request, res: Response, next: NextFunction) {
        try {
            const { kpmId } = req.params;
            const { page, limit } = req.query;
            const result = await prestasiService.findByKpm(kpmId, { page: page ? parseInt(page as string) : undefined, limit: limit ? parseInt(limit as string) : undefined });
            res.json({ success: true, ...result });
        } catch (error) { next(error); }
    }

    async findById(req: Request, res: Response, next: NextFunction) {
        try { res.json({ success: true, data: await prestasiService.findById(req.params.id) }); } catch (error) { next(error); }
    }

    async create(req: Request, res: Response, next: NextFunction) {
        try {
            const result = await prestasiService.create(req.params.kpmId, req.body);
            res.status(201).json({ success: true, message: 'Prestasi berhasil ditambahkan', data: result });
        } catch (error) { next(error); }
    }

    async update(req: Request, res: Response, next: NextFunction) {
        try {
            const result = await prestasiService.update(req.params.id, req.body);
            res.json({ success: true, message: 'Prestasi berhasil diperbarui', data: result });
        } catch (error) { next(error); }
    }

    async delete(req: Request, res: Response, next: NextFunction) {
        try { await prestasiService.delete(req.params.id); res.json({ success: true, message: 'Prestasi berhasil dihapus' }); } catch (error) { next(error); }
    }
}

export const prestasiController = new PrestasiController();
