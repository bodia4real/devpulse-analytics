import { Request, Response, NextFunction } from 'express';
import { AppError } from '../errors';

/**
 * Global error middleware. Register it LAST (after all routes).
 * Catches errors passed via next(err) or thrown inside async handlers wrapped with ctrlWrapper.
 */
export function errorHandler(
  err: unknown,
  req: Request,
  res: Response,
  _next: NextFunction
): void {
  // Log (in real app you might use a logger)
  console.error('[Error]', err);

  let statusCode = 500;
  let message = 'Internal server error';

  // 1. Our custom errors (from controllers, auth middleware, etc.)
  if (err instanceof AppError) {
    statusCode = err.statusCode;
    message = err.message;
  }
  // 2. PostgreSQL errors (from pool.query)
  else if (isPgError(err)) {
    const mapped = mapPgError(err as PgError);
    statusCode = mapped.statusCode;
    message = mapped.message;
  }
  // 3. JWT errors (from jwt.verify in auth middleware)
  else if (isJwtError(err)) {
    statusCode = 401;
    message = 'Invalid or expired token';
  }
  // 4. Unknown errors – in production don't leak details
  else if (err instanceof Error) {
    if (process.env.NODE_ENV !== 'production') {
      message = err.message;
    }
  }

  res.status(statusCode).json({
    success: false,
    error: message,
  });
}

// --- Helpers ---

interface PgError {
  code?: string;
  message?: string;
}

function isPgError(err: unknown): boolean {
  return typeof (err as PgError)?.code === 'string';
}

function isJwtError(err: unknown): boolean {
  const name = (err as Error)?.name;
  return name === 'JsonWebTokenError' || name === 'TokenExpiredError';
}

function mapPgError(err: PgError): { statusCode: number; message: string } {
  const code = err.code || '';
  switch (code) {
    case '23505':
      return { statusCode: 409, message: 'Resource already exists' };
    case '23503':
      return { statusCode: 400, message: 'Invalid reference' };
    case '23502':
      return { statusCode: 400, message: 'Required field missing' };
    case '23514':
      return { statusCode: 400, message: 'Validation failed' };
    default:
      return { statusCode: 500, message: 'Database error' };
  }
}
