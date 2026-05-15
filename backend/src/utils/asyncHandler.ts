import { Request, Response, NextFunction } from 'express';

type AsyncHandler = (req: Request, res: Response, next: NextFunction) => Promise<unknown>;

/**
 * asyncHandler
 *
 * Wraps an async Express route/middleware so you never need a try/catch block
 * in controllers. Any thrown error (including AppError, Zod validation errors,
 * and Mongoose errors) is forwarded to `next(err)` automatically.
 *
 * Before:
 *   router.get('/', async (req, res, next) => { try { ... } catch (err) { next(err) } })
 *
 * After:
 *   router.get('/', asyncHandler(async (req, res) => { ... }))
 */
export const asyncHandler =
  (fn: AsyncHandler) =>
  (req: Request, res: Response, next: NextFunction): void => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
