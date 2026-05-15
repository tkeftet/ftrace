import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { AuthRequest, JwtPayload } from '../types';

/**
 * Verify JWT and attach `req.user` with { userId, tenantId, role }.
 */
export const authenticate = (req: AuthRequest, res: Response, next: NextFunction): void => {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Missing or malformed token' });
    return;
  }

  const token = header.slice('Bearer '.length).trim();
  try {
    const decoded = jwt.verify(token, env.JWT_SECRET) as JwtPayload;
    req.user = decoded;
    next();
  } catch {
    res.status(401).json({ error: 'Invalid or expired token' });
  }
};

/**
 * Optionally verify JWT if present.
 * Sets req.user when a valid token is found; silently continues otherwise.
 */
export const optionalAuthenticate = (req: AuthRequest, _res: Response, next: NextFunction): void => {
  const header = req.headers.authorization;
  if (header?.startsWith('Bearer ')) {
    const token = header.slice('Bearer '.length).trim();
    try {
      req.user = jwt.verify(token, env.JWT_SECRET) as JwtPayload;
    } catch {
      // Invalid token — proceed as unauthenticated.
    }
  }
  next();
};

/**
 * Restrict access to specific roles.
 */
export const authorize = (...roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user || !roles.includes(req.user.role)) {
      res.status(403).json({ error: 'Forbidden: insufficient role' });
      return;
    }
    next();
  };
};
