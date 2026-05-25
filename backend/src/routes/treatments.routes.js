import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware.js';
import {
  getTreatments,
  getTreatment,
  createTreatment,
  updateTreatment,
  deleteTreatment
} from '../controllers/treatments.controller.js';

const router = Router();

router.use(authenticate);

router.get('/:dogId/treatments', getTreatments);
router.get('/:dogId/treatments/:id', getTreatment);
router.post('/:dogId/treatments', createTreatment);
router.put('/:dogId/treatments/:id', updateTreatment);
router.delete('/:dogId/treatments/:id', deleteTreatment);

export default router;