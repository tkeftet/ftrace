import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth';
import { tenantIsolation } from '../middleware/tenantIsolation';
import { validate } from '../middleware/validate';
import { createStaffSchema, updateStaffSchema } from '../utils/schemas';
import {
  listStaff,
  createStaff,
  updateStaff,
  deactivateStaff,
  reactivateStaff,
} from '../controllers/staff.controller';

const router = Router();

// All staff routes require auth + tenant isolation + admin role
router.use(authenticate, tenantIsolation, authorize('admin'));

router.get('/', listStaff);
router.post('/', validate(createStaffSchema), createStaff);
router.put('/:id', validate(updateStaffSchema), updateStaff);
router.delete('/:id', deactivateStaff);
router.patch('/:id/reactivate', reactivateStaff);

export default router;
