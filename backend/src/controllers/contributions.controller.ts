import { Request, Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth.middleware';
import { UnauthorizedError } from '../errors';
import { pool } from '../config/database';
import { fetchUserContributions } from '../services/contributions.service';

/**
 * GET /api/contributions?days=30 – fetch contribution stats from GitHub for the current user (for Postman/testing).
 */
export async function getContributions(req: Request, res: Response): Promise<void> {
  const authReq = req as AuthenticatedRequest;
  if (!authReq.user?.userId) {
    throw new UnauthorizedError();
  }

  const days = Math.min(90, Math.max(1, Number(req.query.days) || 30));

  const { rows } = await pool.query<{ username: string; access_token: string }>(
    'SELECT username, access_token FROM users WHERE id = $1',
    [authReq.user.userId]
  );
  if (rows.length === 0 || !rows[0].access_token || !rows[0].username?.trim()) {
    throw new UnauthorizedError();
  }

  const result = await fetchUserContributions(rows[0].username, rows[0].access_token, days);
  res.json({ contributions: result });
}
