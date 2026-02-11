import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config/env';
import { UnauthorizedError } from '../errors';

export interface AuthPayload {
  userId: string;
}

export type AuthenticatedRequest = Request & { user: AuthPayload };

/**
 * Verifies JWT from Authorization: Bearer <token> and sets req.user.
 * Use on protected routes (e.g. GET /api/auth/me).
 */
export function requireAuth(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    next(new UnauthorizedError('Missing or invalid Authorization header'));
    return;
  }

  const token = authHeader.slice(7);
  try {
    const payload = jwt.verify(token, config.jwtSecret) as AuthPayload;
    (req as AuthenticatedRequest).user = { userId: payload.userId };
    next();
  } catch {
    next(new UnauthorizedError('Invalid or expired token'));
  }
}
