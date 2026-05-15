import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { tenantIsolation } from '../middleware/tenantIsolation';
import { getTenantInfo, resolveTenantBySlug } from '../controllers/tenant.controller';

const router = Router();

// Public: resolve tenant by slug (used by client QR flow)
router.get('/resolve/:slug', resolveTenantBySlug);

// Authenticated tenant admin routes
router.use(authenticate, tenantIsolation);

router.get('/info', getTenantInfo);

export default router;
