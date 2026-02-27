import { getRepos, getRepoById, syncRepos } from '../controllers/repos.controller';
import { BadRequestError, NotFoundError, UnauthorizedError } from '../errors';
import type { AuthenticatedRequest } from '../middleware/auth.middleware';

jest.mock('../config/database', () => ({
  pool: {
    query: jest.fn(),
  },
}));

jest.mock('../services/github.service', () => ({
  fetchUserRepos: jest.fn(),
}));

describe('repos.controller', () => {
  const { pool } = require('../config/database') as {
    pool: { query: jest.Mock };
  };
  const { fetchUserRepos } = require('../services/github.service') as {
    fetchUserRepos: jest.Mock;
  };

  beforeEach(() => {
    pool.query.mockReset();
    fetchUserRepos.mockReset();
  });

  describe('getRepos', () => {
    it('throws UnauthorizedError when user is missing', async () => {
      const req = {} as any;
      const res = {} as any;

      await expect(getRepos(req, res)).rejects.toBeInstanceOf(
        UnauthorizedError,
      );
    });

    it('returns repos for current user', async () => {
      const req = {
        user: { userId: 'user-1' },
      } as AuthenticatedRequest as any;
      const res = { json: jest.fn() } as any;

      const rows = [
        { id: '1', name: 'repo1' },
        { id: '2', name: 'repo2' },
      ];
      pool.query.mockResolvedValueOnce({ rows });

      await getRepos(req as any, res);

      expect(pool.query).toHaveBeenCalledTimes(1);
      expect(res.json).toHaveBeenCalledWith({ repos: rows });
    });
  });

  describe('getRepoById', () => {
    it('throws BadRequestError when id param is missing', async () => {
      const req = {
        user: { userId: 'user-1' },
        params: {},
      } as any;

      await expect(getRepoById(req, {} as any)).rejects.toBeInstanceOf(
        BadRequestError,
      );
    });

    it('throws NotFoundError when repo is not found', async () => {
      const req = {
        user: { userId: 'user-1' },
        params: { id: 'repo-1' },
      } as any;

      pool.query.mockResolvedValueOnce({ rows: [] });

      await expect(getRepoById(req, {} as any)).rejects.toBeInstanceOf(
        NotFoundError,
      );
    });

    it('returns repo when found', async () => {
      const req = {
        user: { userId: 'user-1' },
        params: { id: 'repo-1' },
      } as any;
      const res = { json: jest.fn() } as any;

      const row = { id: 'repo-1', name: 'my-repo' };
      pool.query.mockResolvedValueOnce({ rows: [row] });

      await getRepoById(req, res);

      expect(res.json).toHaveBeenCalledWith({ repo: row });
    });
  });

  describe('syncRepos', () => {
    it('throws UnauthorizedError when user is missing', async () => {
      const req = {} as any;

      await expect(syncRepos(req, {} as any)).rejects.toBeInstanceOf(
        UnauthorizedError,
      );
    });

    it('throws UnauthorizedError when access token is missing', async () => {
      const req = {
        user: { userId: 'user-1' },
      } as any;

      pool.query.mockResolvedValueOnce({ rows: [{ access_token: null }] });

      await expect(syncRepos(req, {} as any)).rejects.toBeInstanceOf(
        UnauthorizedError,
      );
    });

    it('syncs GitHub repos and returns counts', async () => {
      const req = {
        user: { userId: 'user-1' },
      } as any;
      const res = { json: jest.fn() } as any;

      pool.query.mockResolvedValueOnce({
        rows: [{ access_token: 'gh-token' }],
      });

      fetchUserRepos.mockResolvedValueOnce([
        {
          id: 1,
          name: 'r1',
          full_name: 'u/r1',
          description: null,
          language: 'TS',
          stargazers_count: 1,
          forks_count: 2,
          open_issues_count: 3,
          watchers_count: 4,
        },
      ]);

      pool.query.mockResolvedValueOnce({ rows: [{ inserted: true }] });

      await syncRepos(req, res);

      expect(fetchUserRepos).toHaveBeenCalledWith('gh-token');
      expect(pool.query).toHaveBeenCalledTimes(2); // 1 for user, 1 for repo upsert
      expect(res.json).toHaveBeenCalledWith({
        synced: 1,
        inserted: 1,
        updated: 0,
      });
    });
  });
});

