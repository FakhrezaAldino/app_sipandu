import { Router } from 'express';
import { adminController } from './admin.controller';
import { adminAuthMiddleware } from '../../middleware';

const router = Router();

// Public debug route
router.get('/check-user-public', adminController.checkUserPublic.bind(adminController));

// Apply admin protection to all routes in this module
router.use(adminAuthMiddleware);

// Dashboard summary
router.get('/dashboard/summary', adminController.getDashboardSummary.bind(adminController));

// Pendamping management
router.get('/pendamping', adminController.listPendamping.bind(adminController));
router.post('/pendamping', adminController.createPendamping.bind(adminController));
router.put('/pendamping/:id', adminController.updatePendamping.bind(adminController));
router.patch('/pendamping/:id/deactivate', adminController.togglePendampingStatus.bind(adminController));

// Kelompok management
router.get('/kelompok', adminController.listKelompok.bind(adminController));

// KPM management
router.get('/kpm', adminController.listKpm.bind(adminController));

// Reports
router.post('/reports/pdf', adminController.generatePdfReport.bind(adminController));

// Manual Sync
router.post('/sync-jadwal', adminController.syncJadwal.bind(adminController));

export const adminRoutes = router;
