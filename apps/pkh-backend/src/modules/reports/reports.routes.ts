import { Router } from 'express';
import { reportsController } from './reports.controller';
import { requireAuth, requireKelompokAccess } from '../../middleware';

const router = Router();
router.use(requireAuth);

// Dashboard statistics
router.get('/dashboard', reportsController.getDashboard.bind(reportsController));

// Kelompok reports
router.get('/kelompok/:id', requireKelompokAccess, reportsController.getKelompokReport.bind(reportsController));

export const reportsRoutes = router;
