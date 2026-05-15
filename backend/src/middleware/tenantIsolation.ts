import { Response, NextFunction } from 'express';
import { AuthRequest } from '../types';

/**
 * Middleware that ensures every DB query is scoped to the requesting user's tenant.
 * Attaches `req.tenantId` as a convenience and rejects cross-tenant access.
 *
 * Must be placed AFTER `authenticate` middleware.
 */
export const tenantIsolation = (req: AuthRequest, res: Response, next: NextFunction): void => {
  if (!req.user) {
    res.status(401).json({ error: 'Authentication required' });
    return;
  }

  // Super admins can optionally override tenant via header (for management panel)
  if (req.user.role === 'super_admin') {
    const overrideTenant = req.headers['x-tenant-id'] as string | undefined;
    if (overrideTenant) {
      req.user = { ...req.user, tenantId: overrideTenant };
    }
    return next();
  }

  // For path-based tenant routing: ensure JWT tenantId matches the route param
  const paramTenantId = req.params.tenantId;
  if (paramTenantId && paramTenantId !== req.user.tenantId) {
    res.status(403).json({ error: 'Tenant mismatch: access denied' });
    return;
  }

  next();
};
