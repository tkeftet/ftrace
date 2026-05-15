import { Request, Response, NextFunction } from 'express';
import { Error as MongooseError } from 'mongoose';
import { AppError } from '../utils/AppError';
import { isProduction } from '../config/env';

/**
 * Central error-handling middleware.
 *
 * Handles three kinds of errors:
 *  1. `AppError` — operational, typed; status code + message passed through.
 *  2. Mongoose `ValidationError` — mapped to 422 Unprocessable Entity.
 *  3. Mongoose `CastError` (bad ObjectId) — mapped to 400 Bad Request.
 *  4. Everything else — logged and returned as 500 Internal Server Error.
 *
 * Only log non-operational errors in production; always log in dev.
 */
export const errorHandler = (
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  // 1. Known operational error
  if (err instanceof AppError) {
    if (!isProduction || !err.isOperational) {
      console.error('[AppError]', err.message);
    }
    res.status(err.statusCode).json({ error: err.message });
    return;
  }

  // 2. Mongoose validation error → 422
  if (err instanceof MongooseError.ValidationError) {
    const messages = Object.values(err.errors).map((e) => e.message);
    res.status(422).json({ error: messages.join(', ') });
    return;
  }

  // 3. Mongoose cast error (invalid ObjectId etc.) → 400
  if (err instanceof MongooseError.CastError) {
    res.status(400).json({ error: `Invalid value for field: ${err.path}` });
    return;
  }

  // 4. Legacy errors thrown with a numeric statusCode property
  if (typeof err === 'object' && err !== null && 'statusCode' in err) {
    const legacy = err as { statusCode: number; message: string };
    if (!isProduction) console.error('[LegacyError]', legacy.message);
    res.status(legacy.statusCode).json({ error: legacy.message });
    return;
  }

  // 5. Unknown / programming error
  console.error('[UnhandledError]', err);
  res.status(500).json({ error: isProduction ? 'Internal server error' : String(err) });
};
