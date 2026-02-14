import { Request, Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth.middleware';
import { UnauthorizedError } from '../errors';
import { pool } from '../config/database';
import { fetchUserContributions } from '../services/contributions.service';

/**
 * GET /api/contributions?days=30 – sync from GitHub, then return contribution stats (always up to date).
 */
export async function getContributions(req: Request, res: Response): Promise<void> {
  const authReq = req as AuthenticatedRequest;
  if (!authReq.user?.userId) {
    throw new UnauthorizedError();
  }

  const userQuery = await pool.query<{ access_token: string; username: string }>(
    'SELECT access_token, username FROM users WHERE id = $1',
    [authReq.user.userId]
  );

  if (userQuery.rows.length === 0 || !userQuery.rows[0].access_token || !userQuery.rows[0].username?.trim()) {
    throw new UnauthorizedError('No GitHub access token or username found');
  }

  const days = Math.min(90, Math.max(1, Number(req.query.days) || 30));
  const contributions = await fetchUserContributions(
    userQuery.rows[0].username,
    userQuery.rows[0].access_token,
    days
  );

  for (const day of contributions) {
    await pool.query(
      `INSERT INTO contributions (user_id, date, commit_count, pr_count, issue_count, review_count)
       VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT (user_id, date) DO UPDATE SET
         commit_count = EXCLUDED.commit_count,
         pr_count = EXCLUDED.pr_count,
         issue_count = EXCLUDED.issue_count,
         review_count = EXCLUDED.review_count`,
      [
        authReq.user.userId,
        day.date,
        day.commit_count,
        day.pr_count,
        day.issue_count,
        day.review_count,
      ]
    );
  }

  res.json({ contributions });
}

/**
 * POST /api/contributions/sync – fetch contributions from GitHub and sync to DB
 */
export async function syncContributions(req: Request, res: Response): Promise<void> {
  const authReq = req as AuthenticatedRequest;
  if (!authReq.user?.userId) {
    throw new UnauthorizedError();
  }

  const userQuery = await pool.query<{ access_token: string; username: string }>(
    'SELECT access_token, username FROM users WHERE id = $1',
    [authReq.user.userId]
  );

  if (userQuery.rows.length === 0 || !userQuery.rows[0].access_token || !userQuery.rows[0].username?.trim()) {
    throw new UnauthorizedError('No GitHub access token or username found');
  }

  const accessToken = userQuery.rows[0].access_token;
  const username = userQuery.rows[0].username;
  const days = Math.min(90, Math.max(1, Number(req.query.days) || 30));

  const contributions = await fetchUserContributions(username, accessToken, days);

  let inserted = 0;
  let updated = 0;

  for (const day of contributions) {
    const result = await pool.query(
      `INSERT INTO contributions (user_id, date, commit_count, pr_count, issue_count, review_count)
       VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT (user_id, date) DO UPDATE SET
         commit_count = EXCLUDED.commit_count,
         pr_count = EXCLUDED.pr_count,
         issue_count = EXCLUDED.issue_count,
         review_count = EXCLUDED.review_count
       RETURNING (xmax = 0) AS inserted`,
      [
        authReq.user.userId,
        day.date,
        day.commit_count,
        day.pr_count,
        day.issue_count,
        day.review_count,
      ]
    );

    if ((result.rows[0] as { inserted: boolean }).inserted) {
      inserted++;
    } else {
      updated++;
    }
  }

  res.json({ synced: contributions.length, inserted, updated });
}
