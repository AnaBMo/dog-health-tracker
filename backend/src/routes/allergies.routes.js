import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware.js';
import {
  getAllergies,
  getAllergy,
  createAllergy,
  updateAllergy,
  deleteAllergy
} from '../controllers/allergies.controller.js';

const router = Router();

router.use(authenticate);

router.get('/:dogId/allergies', getAllergies);
router.get('/:dogId/allergies/:id', getAllergy);
router.post('/:dogId/allergies', createAllergy);
router.put('/:dogId/allergies/:id', updateAllergy);
router.delete('/:dogId/allergies/:id', deleteAllergy);

export default router;