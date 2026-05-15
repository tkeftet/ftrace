import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth';
import { tenantIsolation } from '../middleware/tenantIsolation';
import { validate } from '../middleware/validate';
import { namedEntitySchema } from '../utils/schemas';
import {
  getSections,
  createSection,
  updateSection,
  deleteSection,
} from '../controllers/section.controller';

const router = Router();

router.use(authenticate, tenantIsolation);

router.get('/', getSections);
router.post('/', authorize('admin', 'manager'), validate(namedEntitySchema), createSection);
router.put('/:id', authorize('admin', 'manager'), validate(namedEntitySchema), updateSection);
router.delete('/:id', authorize('admin', 'manager'), deleteSection);

export default router;
