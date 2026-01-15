import { Request, Response, NextFunction } from 'express';
import { absensiService } from './absensi.service';

export class AbsensiController {
    async findByKelompok(req: Request, res: Response, next: NextFunction) {
        try {
            const { kelompokId } = req.params;
            const { page, limit, date } = req.query;

            if (date) {
                const result = await absensiService.findByDate(kelompokId, date as string);
                return res.json({ success: true, data: result });
            }

            const result = await absensiService.findByKelompok(kelompokId, {
                page: page ? parseInt(page as string) : undefined,
                limit: limit ? parseInt(limit as string) : undefined,
            });

            res.json({ success: true, ...result });
        } catch (error) {
            next(error);
        }
    }

    async findById(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;
            const result = await absensiService.findById(id);
            res.json({ success: true, data: result });
        } catch (error) {
            next(error);
        }
    }

    async create(req: Request, res: Response, next: NextFunction) {
        try {
            const { kelompokId } = req.params;
            const result = await absensiService.create(kelompokId, req.user!.id, req.body);
            res.status(201).json({
                success: true,
                message: 'Absensi berhasil disimpan',
                data: result,
            });
        } catch (error) {
            next(error);
        }
    }

    async update(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;
            const result = await absensiService.update(id, req.body);
            res.json({
                success: true,
                message: 'Absensi berhasil diperbarui',
                data: result,
            });
        } catch (error) {
            next(error);
        }
    }

    async delete(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;
            await absensiService.delete(id);
            res.json({ success: true, message: 'Absensi berhasil dihapus' });
        } catch (error) {
            next(error);
        }
    }

    async getStats(req: Request, res: Response, next: NextFunction) {
        try {
            const { kelompokId } = req.params;
            const result = await absensiService.getStats(kelompokId);
            res.json({ success: true, data: result });
        } catch (error) {
            next(error);
        }
    }
}

export const absensiController = new AbsensiController();
