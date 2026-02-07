// Error handling middleware
// Catches all errors and formats consistent error responses

import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/errors';
import { serverConfig } from '../config';

// Check if error is a PostgreSQL error
const isPostgresError = (error: any): boolean => {
  return error?.code && typeof error.code === 'string' && error.code.startsWith('23');
};

// Handle PostgreSQL errors
const handlePostgresError = (error: any): { statusCode: number; message: string } => {
  // Unique constraint violation
  if (error.code === '23505') {
    return {
      statusCode: 409,
      message: 'Resource already exists',
    };
  }

  // Foreign key violation
  if (error.code === '23503') {
    return {
      statusCode: 400,
      message: 'Invalid reference to related resource',
    };
  }

  // Not null violation
  if (error.code === '23502') {
    return {
      statusCode: 400,
      message: 'Required field is missing',
    };
  }

  // Check constraint violation
  if (error.code === '23514') {
    return {
      statusCode: 400,
      message: 'Data validation failed',
    };
  }

  // Default database error
  return {
    statusCode: 500,
    message: 'Database operation failed',
  };
};

// Handle Zod validation errors
const handleZodError = (error: any): { statusCode: number; message: string; details?: any } => {
  if (error.name === 'ZodError' && error.errors) {
    const details = error.errors.map((err: any) => ({
      field: err.path.join('.'),
      message: err.message,
    }));

    return {
      statusCode: 400,
      message: 'Validation failed',
      details,
    };
  }

  return {
    statusCode: 400,
    message: error.message || 'Validation error',
  };
};

// Log error with full details
const logError = (error: Error, req: Request): void => {
  const isDevelopment = serverConfig.nodeEnv === 'development';
  const userId = (req as any).user?.id;

  console.error('❌ Error occurred:', {
    timestamp: new Date().toISOString(),
    method: req.method,
    url: req.originalUrl,
    error: {
      name: error.name,
      message: error.message,
      stack: isDevelopment ? error.stack : undefined,
    },
    ...(userId && { userId }),
  });
};

// Format error response for client
const formatErrorResponse = (error: Error | AppError, statusCode: number, details?: any) => {
  const isDevelopment = serverConfig.nodeEnv === 'development';

  const response: any = {
    error: error.name || 'Error',
    message: error.message || 'An error occurred',
  };

  // Add details in development or for validation errors
  if (details && (isDevelopment || statusCode === 400)) {
    response.details = details;
  }

  // Add stack trace only in development
  if (isDevelopment && error.stack) {
    response.stack = error.stack;
  }

  return response;
};

export const errorHandler = (
  err: Error | AppError,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  // Log the error
  logError(err, req);

  let statusCode = 500;
  let message = 'Internal server error';
  let details: any = undefined;

  // Handle custom AppError
  if (err instanceof AppError) {
    statusCode = err.statusCode;
    message = err.message;

    // Include details for ValidationError
    if (err.name === 'ValidationError' && 'details' in err) {
      details = (err as any).details;
    }
  }
  // Handle PostgreSQL errors
  else if (isPostgresError(err)) {
    const pgError = handlePostgresError(err);
    statusCode = pgError.statusCode;
    message = pgError.message;
  }
  // Handle Zod validation errors
  else if (err.name === 'ZodError') {
    const zodError = handleZodError(err);
    statusCode = zodError.statusCode;
    message = zodError.message;
    details = zodError.details;
  }
  // Handle JWT errors
  else if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Invalid or expired token';
  }
  // Handle unknown errors
  else {
    // In production, don't expose error details
    if (serverConfig.nodeEnv === 'production') {
      message = 'An unexpected error occurred';
    } else {
      message = err.message || 'An error occurred';
    }
  }

  // Send error response
  res.status(statusCode).json(formatErrorResponse(err, statusCode, details));
};
