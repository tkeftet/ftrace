import { Router } from 'express';
import {
  login,
  superAdminLogin,
  me,
  updateProfile,
  changePassword,
} from '../controllers/auth.controller';
import { authenticate } from '../middleware/auth';
import { loginRateLimiter } from '../middleware/rateLimiter';
import { validate } from '../middleware/validate';
import {
  tenantLoginSchema,
  superAdminLoginSchema,
  updateProfileSchema,
  changePasswordSchema,
} from '../utils/schemas';

const router = Router();

// Tenant staff login (resolves slug → tenantId)
router.post('/tenant-login', loginRateLimiter, validate(tenantLoginSchema), login);

// Super-admin login (separate endpoint)
router.post('/login', loginRateLimiter, validate(superAdminLoginSchema), superAdminLogin);

// Get current user info (full profile from DB)
router.get('/me', authenticate, me);

// Update profile (name, email)
router.patch('/me', authenticate, validate(updateProfileSchema), updateProfile);

// Change password
router.patch('/me/password', authenticate, validate(changePasswordSchema), changePassword);

export default router;
