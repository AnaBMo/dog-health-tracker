import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware.js';
import {
  getVaccines,
  getVaccine,
  createVaccine,
  updateVaccine,
  deleteVaccine
} from '../controllers/vaccines.controller.js';

const router = Router();

router.use(authenticate);

router.get('/:dogId/vaccines', getVaccines);
router.get('/:dogId/vaccines/:id', getVaccine);
router.post('/:dogId/vaccines', createVaccine);
router.put('/:dogId/vaccines/:id', updateVaccine);
router.delete('/:dogId/vaccines/:id', deleteVaccine);

export default router;