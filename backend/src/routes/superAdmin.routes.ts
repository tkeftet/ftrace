import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { onboardTenantSchema, updateTenantSchema } from '../utils/schemas';
import {
  onboardTenant,
  listTenants,
  getTenantById,
  toggleTenantActive,
  getTenantUsers,
  updateTenant,
  deleteTenant,
} from '../controllers/superAdmin.controller';

const router = Router();

// All super-admin routes require super_admin role
router.use(authenticate, authorize('super_admin'));

router.post('/tenants', validate(onboardTenantSchema), onboardTenant);
router.get('/tenants', listTenants);
router.get('/tenants/:id', getTenantById);
router.patch('/tenants/:id', validate(updateTenantSchema), updateTenant);
router.delete('/tenants/:id', deleteTenant);
router.patch('/tenants/:id/active', toggleTenantActive);
router.get('/tenants/:id/users', getTenantUsers);

export default router;
