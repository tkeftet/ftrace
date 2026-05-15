/**
 * AppError
 *
 * A typed, operational error with an HTTP status code.
 * Using a dedicated class instead of `Object.assign(new Error(), {statusCode})`
 * means:
 *  - `instanceof` checks work correctly in middleware and tests.
 *  - TypeScript knows the shape without casting.
 *  - The stack trace is cleaner (captured at throw site).
 *
 * Operational errors (4xx, known 5xx) are handled gracefully by errorHandler.
 * Programming errors (unexpected throw) surface as 500 and are logged.
 */
export class AppError extends Error {
  readonly statusCode: number;
  /** If false the error is logged; operational errors usually don't need logging. */
  readonly isOperational: boolean;

  constructor(message: string, statusCode: number, isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    // Maintain correct prototype chain in transpiled ES5 output.
    Object.setPrototypeOf(this, new.target.prototype);
    Error.captureStackTrace(this, this.constructor);
  }
}

/** Convenience factory — keeps throw sites concise. */
export const createError = (message: string, statusCode: number): AppError =>
  new AppError(message, statusCode);
