import { Router } from 'express';
import multer from 'multer';
import { authenticate, authorize } from '../middleware/auth';
import { tenantIsolation } from '../middleware/tenantIsolation';
import { parseMenu, confirmImport } from '../controllers/menuImport.controller';

const ACCEPTED_MIME_TYPES = new Set([
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
]);

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 25 * 1024 * 1024 }, // 25 MB
  fileFilter: (_req, file, cb) => {
    cb(null, ACCEPTED_MIME_TYPES.has(file.mimetype));
  },
});

const router = Router();
router.use(authenticate, tenantIsolation);

router.post('/parse', authorize('admin', 'manager'), upload.single('menu'), parseMenu);
router.post('/confirm', authorize('admin', 'manager'), confirmImport);

export default router;
