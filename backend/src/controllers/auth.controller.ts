import { Request, Response } from 'express';
import axios from 'axios';
import jwt from 'jsonwebtoken';
import { config } from '../config/env';
import { pool } from '../config/database';
import { BadRequestError, BadGatewayError, UnauthorizedError } from '../errors';
import type { AuthenticatedRequest } from '../middleware/auth.middleware';

/**
 * GET /api/auth/github – redirect user to GitHub OAuth consent page
 */
export async function redirectToGitHub(req: Request, res: Response): Promise<void> {
  const { clientId, callbackUrl } = config.github;
  const scope = 'read:user user:email repo';
  const state = Math.random().toString(36).slice(2);
  const url = `https://github.com/login/oauth/authorize?client_id=${encodeURIComponent(clientId)}&redirect_uri=${encodeURIComponent(callbackUrl)}&scope=${encodeURIComponent(scope)}&state=${state}`;
  res.redirect(url);
}

/**
 * GET /api/auth/github/callback – exchange code for token, fetch user, upsert DB, redirect to frontend with JWT
 */
export async function githubCallback(req: Request, res: Response): Promise<void> {
  const code = req.query.code;
  if (!code || Array.isArray(code)) {
    throw new BadRequestError('Missing code');
  }

  const { clientId, clientSecret, callbackUrl } = config.github;

  const tokenRes = await axios.post<{ access_token?: string; error?: string; error_description?: string }>(
    'https://github.com/login/oauth/access_token',
    {
      client_id: clientId,
      client_secret: clientSecret,
      code,
      redirect_uri: callbackUrl,
    },
    {
      headers: { Accept: 'application/json' },
    }
  ).catch(() => null);

  if (!tokenRes?.data?.access_token) {
    const msg = tokenRes?.data?.error_description ?? tokenRes?.data?.error ?? 'GitHub token exchange failed';
    throw new BadGatewayError(msg);
  }

  const accessToken = tokenRes.data.access_token;

  const userRes = await axios.get<{ id: number; login: string; email?: string | null; avatar_url?: string | null }>(
    'https://api.github.com/user',
    { headers: { Authorization: `Bearer ${accessToken}` } }
  ).catch(() => null);

  if (!userRes?.data?.id) {
    throw new BadGatewayError('Failed to fetch GitHub user');
  }

  const gh = userRes.data;
  const githubId = gh.id;
  const username = gh.login ?? '';
  const email = gh.email ?? null;
  const avatarUrl = gh.avatar_url ?? null;

  const { rows } = await pool.query<{ id: string; github_id: string; username: string; email: string | null; avatar_url: string | null }>(
    `INSERT INTO users (github_id, username, email, avatar_url, access_token, updated_at)
     VALUES ($1, $2, $3, $4, $5, NOW())
     ON CONFLICT (github_id) DO UPDATE SET
       username = EXCLUDED.username,
       email = EXCLUDED.email,
       avatar_url = EXCLUDED.avatar_url,
       access_token = EXCLUDED.access_token,
       updated_at = NOW()
     RETURNING id, github_id, username, email, avatar_url`,
    [githubId, username, email, avatarUrl, accessToken]
  );

  const user = rows[0];
  if (!user) {
    throw new BadGatewayError('Failed to save user');
  }

  const token = jwt.sign(
    { userId: user.id },
    config.jwtSecret,
    { expiresIn: config.jwtExpiresIn } as jwt.SignOptions
  );

  res.redirect(`${config.frontendUrl}?token=${encodeURIComponent(token)}`);
}

/**
 * GET /api/auth/me – return current user (requires auth middleware to set req.user)
 */
export async function getMe(req: Request, res: Response): Promise<void> {
  const authReq = req as AuthenticatedRequest;
  if (!authReq.user?.userId) {
    throw new UnauthorizedError();
  }

  const { rows } = await pool.query<{ id: string; github_id: string; username: string; email: string | null; avatar_url: string | null; created_at: Date }>(
    'SELECT id, github_id, username, email, avatar_url, created_at FROM users WHERE id = $1',
    [authReq.user.userId]
  );

  if (rows.length === 0) {
    throw new UnauthorizedError();
  }

  res.json({ user: rows[0] });
}

/**
 * POST /api/auth/logout
 * The server does NOT store or invalidate JWTs. This endpoint only returns success.
 * The client must remove the token from its storage (localStorage, memory, etc.) after
 * calling this; until then the token still works until it expires (see JWT_EXPIRES_IN).
 */
export async function logout(_req: Request, res: Response): Promise<void> {
  res.status(200).json({
    message: 'OK. Remove the token on the client (e.g. delete from localStorage).',
  });
}