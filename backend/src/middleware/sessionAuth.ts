import { Response, NextFunction } from 'express';
import { TableSessionRequest } from '../types';
import { verifySessionToken } from '../services/tableSession.service';

const SESSION_TOKEN_HEADER = 'x-session-token';

/**
 * Required session middleware.
 *
 * Reads the `x-session-token` header, validates the JWT signature, and
 * verifies the session is still active in the DB.  On success, attaches
 * the verified payload to `req.tableSession`.  On any failure the error
 * is forwarded to the Express error handler.
 */
export const requireSession = async (
  req: TableSessionRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const token = req.headers[SESSION_TOKEN_HEADER] as string | undefined;

  if (!token) {
    res.status(401).json({
      error: `Session token required — include the '${SESSION_TOKEN_HEADER}' header`,
    });
    return;
  }

  try {
    req.tableSession = await verifySessionToken(token);
    next();
  } catch (err) {
    next(err);
  }
};

/**
 * Optional session middleware.
 *
 * Behaves like `requireSession` but silently continues when the header is
 * absent or the token is invalid.  Use this before `requireSessionOrAuth`
 * on routes that accept either a session token or a staff JWT.
 */
export const optionalSession = async (
  req: TableSessionRequest,
  _res: Response,
  next: NextFunction
): Promise<void> => {
  const token = req.headers[SESSION_TOKEN_HEADER] as string | undefined;

  if (token) {
    try {
      req.tableSession = await verifySessionToken(token);
    } catch {
      // Invalid / expired token — treat as unauthenticated; proceed silently.
    }
  }

  next();
};

/**
 * Gate middleware — must run AFTER both `optionalAuthenticate` and
 * `optionalSession`.
 *
 * Rejects the request (401) unless either `req.user` (staff JWT) or
 * `req.tableSession` (customer session token) has been populated.
 */
export const requireSessionOrAuth = (
  req: TableSessionRequest,
  res: Response,
  next: NextFunction
): void => {
  if (req.tableSession || req.user) {
    next();
    return;
  }

  res.status(401).json({
    error: 'Authentication required: provide a staff Bearer token or a customer session token',
  });
};
