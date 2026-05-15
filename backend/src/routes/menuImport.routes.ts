import { Router } from 'express';
import multer from 'multer';
import { authenticate, authorize } from '../middleware/auth';
import { tenantIsolation } from '../middleware/tenantIsolation';
import { parsePdfMenu, confirmImport } from '../controllers/menuImport.controller';

// Store file only in memory — we pass the buffer to pdf-parse, never write to disk
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 25 * 1024 * 1024 }, // 25 MB max
  fileFilter: (_req, file, cb) => {
    cb(null, file.mimetype === 'application/pdf');
  },
});

const router = Router();
router.use(authenticate, tenantIsolation);

// Parse a PDF and return extracted data for user review
router.post('/parse', authorize('admin', 'manager'), upload.single('menu'), parsePdfMenu);

// Confirm and persist the (optionally edited) extracted data
router.post('/confirm', authorize('admin', 'manager'), confirmImport);

export default router;
