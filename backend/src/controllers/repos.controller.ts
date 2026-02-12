import { Request, Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth.middleware';
import { BadRequestError, NotFoundError, UnauthorizedError } from '../errors';
import { pool } from '../config/database';
import { fetchUserRepos } from '../services/github.service';

/**
 * GET /api/repos – return all repos for the current user from DB
 */
export async function getRepos(req: Request, res: Response): Promise<void> {
  const authReq = req as AuthenticatedRequest;
  if (!authReq.user?.userId) {
    throw new UnauthorizedError();
  }

  const { rows } = await pool.query<{
    id: string;
    github_repo_id: string;
    name: string;
    full_name: string;
    description: string | null;
    language: string | null;
    stars: number;
    forks: number;
    open_issues: number;
    watchers: number;
    created_at: Date;
    updated_at: Date;
  }>(
    'SELECT id, github_repo_id, name, full_name, description, language, stars, forks, open_issues, watchers, created_at, updated_at FROM repos WHERE user_id = $1',
    [authReq.user.userId]
  );

  res.json({ repos: rows });
}

/**
 * GET /api/repos/:id – return one repo by id (only if it belongs to the current user)
 */
export async function getRepoById(req: Request, res: Response): Promise<void> {
  const authReq = req as AuthenticatedRequest;
  if (!authReq.user?.userId) {
    throw new UnauthorizedError();
  }

  const { id } = req.params;
  if (!id) {
    throw new BadRequestError('Missing repo id');
  }

  const { rows } = await pool.query<{
    id: string;
    github_repo_id: string;
    name: string;
    full_name: string;
    description: string | null;
    language: string | null;
    stars: number;
    forks: number;
    open_issues: number;
    watchers: number;
    created_at: Date;
    updated_at: Date;
  }>(
    'SELECT id, github_repo_id, name, full_name, description, language, stars, forks, open_issues, watchers, created_at, updated_at FROM repos WHERE id = $1 AND user_id = $2',
    [id, authReq.user.userId]
  );

  if (rows.length === 0) {
    throw new NotFoundError('Repo not found');
  }

  res.json({ repo: rows[0] });
}

/**
 * POST /api/repos/sync – fetch repos from GitHub and sync to DB
 */
export async function syncRepos(req: Request, res: Response): Promise<void> {
  const authReq = req as AuthenticatedRequest;
  if (!authReq.user?.userId) {
    throw new UnauthorizedError();
  }

  // Get user's GitHub access token
  const userQuery = await pool.query<{ access_token: string }>(
    'SELECT access_token FROM users WHERE id = $1',
    [authReq.user.userId]
  );

  if (userQuery.rows.length === 0 || !userQuery.rows[0].access_token) {
    throw new UnauthorizedError('No GitHub access token found');
  }

  const accessToken = userQuery.rows[0].access_token;

  // Fetch repos from GitHub
  const githubRepos = (await fetchUserRepos(accessToken)) as Array<{
    id: number;
    name: string;
    full_name: string;
    description: string | null;
    language: string | null;
    stargazers_count: number;
    forks_count: number;
    open_issues_count: number;
    watchers_count: number;
  }>;

  let inserted = 0;
  let updated = 0;

  // Insert or update each repo
  for (const repo of githubRepos) {
    const result = await pool.query(
      `INSERT INTO repos (user_id, github_repo_id, name, full_name, description, language, stars, forks, open_issues, watchers, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW())
       ON CONFLICT (user_id, github_repo_id) DO UPDATE SET
         name = EXCLUDED.name,
         full_name = EXCLUDED.full_name,
         description = EXCLUDED.description,
         language = EXCLUDED.language,
         stars = EXCLUDED.stars,
         forks = EXCLUDED.forks,
         open_issues = EXCLUDED.open_issues,
         watchers = EXCLUDED.watchers,
         updated_at = NOW()
       RETURNING (xmax = 0) AS inserted`,
      [
        authReq.user.userId,
        repo.id,
        repo.name,
        repo.full_name,
        repo.description,
        repo.language,
        repo.stargazers_count,
        repo.forks_count,
        repo.open_issues_count,
        repo.watchers_count,
      ]
    );

    if ((result.rows[0] as { inserted: boolean }).inserted) {
      inserted++;
    } else {
      updated++;
    }
  }

  res.json({ synced: githubRepos.length, inserted, updated });
}
