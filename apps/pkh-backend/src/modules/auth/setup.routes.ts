import { Router } from 'express';
import { setupController } from './setup.controller';

const router = Router();

// Public routes - no auth required
router.get('/debug-session', setupController.getDebugSession.bind(setupController));

export const setupRoutes = router;
