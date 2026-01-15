import { Router } from 'express';
import { requireAuth, validateBody } from '../../middleware';
import { jadwalController } from './jadwal.controller';
import { createJadwalSchema } from './jadwal.schema';

const router = Router();

// Apply admin protection to all routes in this module
router.use(requireAuth);

router.post('/', validateBody(createJadwalSchema.shape.body), jadwalController.create.bind(jadwalController));
router.get('/kelompok/:kelompokId', jadwalController.getByKelompok.bind(jadwalController));

export const jadwalRoutes = router;
