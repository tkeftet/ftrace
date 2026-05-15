import { Request, Response, NextFunction } from 'express';
import { ZodSchema } from 'zod';

/**
 * validate(schema)
 *
 * Express middleware factory that parses `req.body` against a Zod schema.
 * On success it replaces `req.body` with the parsed (and coerced) output,
 * so downstream handlers receive clean, typed data.
 * On failure it responds 400 with structured field errors.
 *
 * Usage:
 *   router.post('/login', validate(loginSchema), loginController)
 */
export const validate =
  (schema: ZodSchema) =>
  (req: Request, res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      const errors = result.error.issues.map((e) => ({
        field: e.path.join('.'),
        message: e.message,
      }));
      res.status(400).json({ error: 'Validation failed', errors });
      return;
    }
    req.body = result.data;
    next();
  };
