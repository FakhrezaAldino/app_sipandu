import { Request, Response, NextFunction } from 'express';
import { db } from '../../db';
import { jadwalService } from './jadwal.service';

export class JadwalController {
    /**
     * POST /api/jadwal
     * Create a new schedule
     */
    async create(req: Request, res: Response, next: NextFunction) {
        try {
            const jadwal = await jadwalService.create(req.body);
            res.status(201).json({
                success: true,
                message: 'Jadwal berhasil dibuat',
                data: jadwal,
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * GET /api/jadwal/kelompok/:kelompokId
     * Get schedules by kelompok
     */
    async getByKelompok(req: Request, res: Response, next: NextFunction) {
        try {
            const { kelompokId } = req.params;
            const schedules = await jadwalService.getByKelompok(kelompokId);
            res.json({
                success: true,
                data: schedules,
            });
        } catch (error) {
            next(error);
        }
    }
}

export const jadwalController = new JadwalController();
