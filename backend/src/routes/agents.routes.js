import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware.js';
import { analyzeReport, proactiveTracking, chat, smartAlerts } from '../controllers/agents.controller.js';

const router = Router();

router.post('/:dogId/analyze', authenticate, analyzeReport);
router.post('/:dogId/tracking', authenticate, proactiveTracking);
router.post('/:dogId/chat', authenticate, chat);
router.post('/:dogId/alerts', authenticate, smartAlerts);

export default router;