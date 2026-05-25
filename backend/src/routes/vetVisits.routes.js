import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware.js';
import {
  getVetVisits,
  getVetVisit,
  createVetVisit,
  updateVetVisit,
  deleteVetVisit
} from '../controllers/vetVisits.controller.js';

const router = Router();

router.use(authenticate);

router.get('/:dogId/vet-visits', getVetVisits);
router.get('/:dogId/vet-visits/:id', getVetVisit);
router.post('/:dogId/vet-visits', createVetVisit);
router.put('/:dogId/vet-visits/:id', updateVetVisit);
router.delete('/:dogId/vet-visits/:id', deleteVetVisit);

export default router;