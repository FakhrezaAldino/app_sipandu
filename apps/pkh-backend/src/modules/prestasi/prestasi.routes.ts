import { Router } from 'express';
import { prestasiController } from './prestasi.controller';
import { requireAuth, requireKelompokAccess, requireKpmAccess, validateBody } from '../../middleware';
import { createPrestasiSchema, updatePrestasiSchema } from './prestasi.schema';
import { requirePrestasiAccess } from './prestasi.middleware';

const router = Router();
router.use(requireAuth);

// Kelompok-scoped routes
const kelompokRouter = Router({ mergeParams: true });
kelompokRouter.get('/', requireKelompokAccess, prestasiController.findByKelompok.bind(prestasiController));

// KPM-scoped routes
const kpmRouter = Router({ mergeParams: true });
kpmRouter.get('/', requireKpmAccess, prestasiController.findByKpm.bind(prestasiController));
kpmRouter.post('/', requireKpmAccess, validateBody(createPrestasiSchema), prestasiController.create.bind(prestasiController));

// Individual routes with access control
router.get('/:id', requirePrestasiAccess, prestasiController.findById.bind(prestasiController));
router.patch('/:id', requirePrestasiAccess, validateBody(updatePrestasiSchema), prestasiController.update.bind(prestasiController));
router.delete('/:id', requirePrestasiAccess, prestasiController.delete.bind(prestasiController));

export const prestasiRoutes = router;
export const prestasiKelompokRoutes = kelompokRouter;
export const prestasiKpmRoutes = kpmRouter;
