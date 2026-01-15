import { Request, Response, NextFunction } from 'express';
import { usahaService } from './usaha.service';

export class UsahaController {
    async findByKelompok(req: Request, res: Response, next: NextFunction) {
        try {
            const { kelompokId } = req.params;
            const { page, limit } = req.query;
            const result = await usahaService.findByKelompok(kelompokId, {
                page: page ? parseInt(page as string) : undefined,
                limit: limit ? parseInt(limit as string) : undefined,
            });
            res.json({ success: true, ...result });
        } catch (error) { next(error); }
    }

    async findByKpm(req: Request, res: Response, next: NextFunction) {
        try {
            const { kpmId } = req.params;
            const { page, limit } = req.query;
            const result = await usahaService.findByKpm(kpmId, {
                page: page ? parseInt(page as string) : undefined,
                limit: limit ? parseInt(limit as string) : undefined,
            });
            res.json({ success: true, ...result });
        } catch (error) { next(error); }
    }

    async findById(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;
            const result = await usahaService.findById(id);
            res.json({ success: true, data: result });
        } catch (error) { next(error); }
    }

    async create(req: Request, res: Response, next: NextFunction) {
        try {
            const { kpmId } = req.params;
            const result = await usahaService.create(kpmId, req.body);
            res.status(201).json({ success: true, message: 'Usaha berhasil ditambahkan', data: result });
        } catch (error) { next(error); }
    }

    async update(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;
            const result = await usahaService.update(id, req.body);
            res.json({ success: true, message: 'Usaha berhasil diperbarui', data: result });
        } catch (error) { next(error); }
    }

    async delete(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;
            await usahaService.delete(id);
            res.json({ success: true, message: 'Usaha berhasil dihapus' });
        } catch (error) { next(error); }
    }
}

export const usahaController = new UsahaController();
