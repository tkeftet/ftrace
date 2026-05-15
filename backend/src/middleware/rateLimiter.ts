import rateLimit from 'express-rate-limit';
import { env } from '../config/env';
import { AuthRequest } from '../types';

const standardOpts = {
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please try again later.' },
};

/**
 * Global IP-keyed limiter for unauthenticated traffic (public menu, login).
 * Mounted globally in app.ts. Loose enough not to interfere with normal
 * browsing; tight enough to stop trivial flooding.
 *
 * Requires `app.set('trust proxy', n)` for `req.ip` to reflect the real
 * client behind any reverse proxy.
 */
export const ipRateLimiter = rateLimit({
  ...standardOpts,
  windowMs: env.RATE_LIMIT_WINDOW_MS,
  max: env.RATE_LIMIT_MAX,
  keyGenerator: (req) => req.ip ?? 'unknown',
});

/**
 * Strict IP-keyed limiter for authentication endpoints (login). Defeats
 * trivial credential-stuffing and brute-force attempts. Caller must mount
 * this on /api/auth/login and /api/auth/tenant-login.
 */
export const loginRateLimiter = rateLimit({
  ...standardOpts,
  windowMs: 60_000,
  max: 10,
  keyGenerator: (req) => req.ip ?? 'unknown',
});

/**
 * Tenant-keyed limiter for authenticated routes. MUST be mounted AFTER
 * `authenticate` so that req.user.tenantId is populated; otherwise it falls
 * back to req.ip. Per-tenant keying means a noisy tenant doesn't degrade
 * other tenants.
 */
export const tenantRateLimiter = rateLimit({
  ...standardOpts,
  windowMs: env.RATE_LIMIT_WINDOW_MS,
  max: env.RATE_LIMIT_MAX,
  keyGenerator: (req) => {
    const authReq = req as AuthRequest;
    return authReq.user?.tenantId ?? req.ip ?? 'unknown';
  },
});
