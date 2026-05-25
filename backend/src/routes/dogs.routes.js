import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware.js';
import {
  getDogs,
  getDog,
  createDog,
  updateDog,
  deleteDog
} from '../controllers/dogs.controller.js';

const router = Router();

router.use(authenticate);

router.get('/', getDogs);
router.get('/:id', getDog);
router.post('/', createDog);
router.put('/:id', updateDog);
router.delete('/:id', deleteDog);

export default router;