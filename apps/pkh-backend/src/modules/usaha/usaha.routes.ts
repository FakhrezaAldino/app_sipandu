import { Router } from 'express';
import { usahaController } from './usaha.controller';
import { requireAuth, requireKelompokAccess, requireKpmAccess, validateBody } from '../../middleware';
import { createUsahaSchema, updateUsahaSchema } from './usaha.schema';
import { requireUsahaAccess } from './usaha.middleware';

const router = Router();
router.use(requireAuth);

// Kelompok-scoped routes
const kelompokRouter = Router({ mergeParams: true });
kelompokRouter.get('/', requireKelompokAccess, usahaController.findByKelompok.bind(usahaController));

// KPM-scoped routes
const kpmRouter = Router({ mergeParams: true });
kpmRouter.get('/', requireKpmAccess, usahaController.findByKpm.bind(usahaController));
kpmRouter.post('/', requireKpmAccess, validateBody(createUsahaSchema), usahaController.create.bind(usahaController));

// Individual routes with access control
router.get('/:id', requireUsahaAccess, usahaController.findById.bind(usahaController));
router.patch('/:id', requireUsahaAccess, validateBody(updateUsahaSchema), usahaController.update.bind(usahaController));
router.delete('/:id', requireUsahaAccess, usahaController.delete.bind(usahaController));

export const usahaRoutes = router;
export const usahaKelompokRoutes = kelompokRouter;
export const usahaKpmRoutes = kpmRouter;
