import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware.js';
import { uploadDocument } from '../controllers/documents.controller.js';
import multer from 'multer';

const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('File type not allowed'));
    }
  }
});

const router = Router();

router.use(authenticate);

router.post('/:dogId/documents', upload.single('file'), uploadDocument);

export default router;