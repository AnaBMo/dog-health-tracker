import express from 'express';
import { getSettings, saveSettings } from '../controllers/settingsController.js';
import { authenticate } from '../middleware/auth.middleware.js';

const router = express.Router();

router.get('/', authenticate, getSettings);
router.post('/', authenticate, saveSettings);

export default router;