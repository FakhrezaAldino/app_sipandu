import { Router } from 'express';
import { kelompokController } from './kelompok.controller';
import { requireAuth, requireKelompokAccess, validateBody } from '../../middleware';
import { createKelompokSchema, updateKelompokSchema } from './kelompok.schema';

const router = Router();

// All routes require authentication
router.use(requireAuth);

// List all kelompok (filtered by role)
router.get('/', kelompokController.findAll.bind(kelompokController));

// Create new kelompok
router.post(
    '/',
    validateBody(createKelompokSchema),
    kelompokController.create.bind(kelompokController)
);

// Get kelompok by ID
router.get(
    '/:id',
    requireKelompokAccess,
    kelompokController.findById.bind(kelompokController)
);

// Update kelompok
router.patch(
    '/:id',
    requireKelompokAccess,
    validateBody(updateKelompokSchema),
    kelompokController.update.bind(kelompokController)
);

// Delete kelompok
router.delete(
    '/:id',
    requireKelompokAccess,
    kelompokController.delete.bind(kelompokController)
);

// Get kelompok statistics
router.get(
    '/:id/stats',
    requireKelompokAccess,
    kelompokController.getStats.bind(kelompokController)
);

export const kelompokRoutes = router;
