import { Router } from 'express';
import { absensiController } from './absensi.controller';
import { requireAuth, requireKelompokAccess, validateBody } from '../../middleware';
import { createAbsensiSchema, updateAbsensiSchema } from './absensi.schema';
import { requireAbsensiAccess } from './absensi.middleware';

const router = Router();
router.use(requireAuth);

// Routes under /api/kelompok/:kelompokId/absensi
const kelompokRouter = Router({ mergeParams: true });
kelompokRouter.get('/', requireKelompokAccess, absensiController.findByKelompok.bind(absensiController));
kelompokRouter.post('/', requireKelompokAccess, validateBody(createAbsensiSchema), absensiController.create.bind(absensiController));
kelompokRouter.get('/stats', requireKelompokAccess, absensiController.getStats.bind(absensiController));

// Routes under /api/absensi/:id - require access check
router.get('/:id', requireAbsensiAccess, absensiController.findById.bind(absensiController));
router.patch('/:id', requireAbsensiAccess, validateBody(updateAbsensiSchema), absensiController.update.bind(absensiController));
router.delete('/:id', requireAbsensiAccess, absensiController.delete.bind(absensiController));

export const absensiRoutes = router;
export const absensiKelompokRoutes = kelompokRouter;
