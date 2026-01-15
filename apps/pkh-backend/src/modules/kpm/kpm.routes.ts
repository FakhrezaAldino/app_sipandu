import { Router } from 'express';
import { kpmController } from './kpm.controller';
import { requireAuth, requireKelompokAccess, requireKpmAccess, validateBody } from '../../middleware';
import { createKpmSchema, updateKpmSchema } from './kpm.schema';

const router = Router();

// All routes require authentication
router.use(requireAuth);

// Routes for KPM within a kelompok
const kelompokRouter = Router({ mergeParams: true });

// List KPM in kelompok
kelompokRouter.get('/', requireKelompokAccess, kpmController.findByKelompok.bind(kpmController));

// Add KPM to kelompok
kelompokRouter.post(
    '/',
    requireKelompokAccess,
    validateBody(createKpmSchema),
    kpmController.create.bind(kpmController)
);

// Routes for individual KPM
// Get KPM by ID
router.get('/:id', requireKpmAccess, kpmController.findById.bind(kpmController));

// Get KPM summary
router.get('/:id/summary', requireKpmAccess, kpmController.getSummary.bind(kpmController));

// Update KPM
router.patch(
    '/:id',
    requireKpmAccess,
    validateBody(updateKpmSchema),
    kpmController.update.bind(kpmController)
);

// Delete KPM
router.delete('/:id', requireKpmAccess, kpmController.delete.bind(kpmController));

export const kpmRoutes = router;
export const kpmKelompokRoutes = kelompokRouter;
