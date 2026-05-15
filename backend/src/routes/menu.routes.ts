import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { authorize } from '../middleware/auth';
import { tenantIsolation } from '../middleware/tenantIsolation';
import {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  getMenuItems,
  createMenuItem,
  updateMenuItem,
  deleteMenuItem,
} from '../controllers/menu.controller';

const router = Router();

// All menu routes require auth + tenant isolation
router.use(authenticate, tenantIsolation);

/* ── Categories ── */
router.get('/categories', getCategories);
router.post('/categories', authorize('admin'), createCategory);
router.put('/categories/:id', authorize('admin'), updateCategory);
router.delete('/categories/:id', authorize('admin'), deleteCategory);

/* ── Items ── */
router.get('/items', getMenuItems);
router.post('/items', authorize('admin'), createMenuItem);
router.put('/items/:id', authorize('admin'), updateMenuItem);
router.delete('/items/:id', authorize('admin'), deleteMenuItem);

export default router;
