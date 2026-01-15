import { Router } from 'express';
import { permasalahanController } from './permasalahan.controller';
import { requireAuth, requireKelompokAccess, requireKpmAccess, validateBody } from '../../middleware';
import { createPermasalahanSchema, updatePermasalahanSchema } from './permasalahan.schema';
import { requirePermasalahanAccess } from './permasalahan.middleware';

const router = Router();
router.use(requireAuth);

// Kelompok-scoped routes
const kelompokRouter = Router({ mergeParams: true });
kelompokRouter.get('/', requireKelompokAccess, permasalahanController.findByKelompok.bind(permasalahanController));

// KPM-scoped routes
const kpmRouter = Router({ mergeParams: true });
kpmRouter.get('/', requireKpmAccess, permasalahanController.findByKpm.bind(permasalahanController));
kpmRouter.post('/', requireKpmAccess, validateBody(createPermasalahanSchema), permasalahanController.create.bind(permasalahanController));

// Individual routes with access control
router.get('/:id', requirePermasalahanAccess, permasalahanController.findById.bind(permasalahanController));
router.patch('/:id', requirePermasalahanAccess, validateBody(updatePermasalahanSchema), permasalahanController.update.bind(permasalahanController));
router.delete('/:id', requirePermasalahanAccess, permasalahanController.delete.bind(permasalahanController));

export const permasalahanRoutes = router;
export const permasalahanKelompokRoutes = kelompokRouter;
export const permasalahanKpmRoutes = kpmRouter;
