import { Router } from 'express';
import { graduasiController } from './graduasi.controller';
import { requireAuth, requireAdmin, requireKelompokAccess, requireKpmAccess, validateBody } from '../../middleware';
import { createGraduasiSchema, updateGraduasiSchema } from './graduasi.schema';
import { requireGraduasiAccess } from './graduasi.middleware';

const router = Router();
router.use(requireAuth);

// Kelompok-scoped routes
const kelompokRouter = Router({ mergeParams: true });
kelompokRouter.get('/', requireKelompokAccess, graduasiController.findByKelompok.bind(graduasiController));

// KPM-scoped routes
const kpmRouter = Router({ mergeParams: true });
kpmRouter.post('/', requireKpmAccess, validateBody(createGraduasiSchema), graduasiController.create.bind(graduasiController));

// Individual routes - view requires access, update/delete requires admin
router.get('/:id', requireGraduasiAccess, graduasiController.findById.bind(graduasiController));
router.patch('/:id', requireGraduasiAccess, validateBody(updateGraduasiSchema), graduasiController.update.bind(graduasiController));
router.delete('/:id', requireAdmin, graduasiController.delete.bind(graduasiController));

export const graduasiRoutes = router;
export const graduasiKelompokRoutes = kelompokRouter;
export const graduasiKpmRoutes = kpmRouter;
