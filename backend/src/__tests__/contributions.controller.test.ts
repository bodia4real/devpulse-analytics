import {
  getContributions,
  syncContributions,
} from '../controllers/contributions.controller';
import { UnauthorizedError } from '../errors';

jest.mock('../config/database', () => ({
  pool: {
    query: jest.fn(),
  },
}));

jest.mock('../services/contributions.service', () => ({
  fetchUserContributions: jest.fn(),
}));

describe('contributions.controller', () => {
  const { pool } = require('../config/database') as {
    pool: { query: jest.Mock };
  };
  const { fetchUserContributions } =
    require('../services/contributions.service') as {
      fetchUserContributions: jest.Mock;
    };

  beforeEach(() => {
    pool.query.mockReset();
    fetchUserContributions.mockReset();
  });

  describe('getContributions', () => {
    it('throws UnauthorizedError when user is missing', async () => {
      const req = {} as any;

      await expect(getContributions(req, {} as any)).rejects.toBeInstanceOf(
        UnauthorizedError,
      );
    });

    it('returns normalized contributions from DB', async () => {
      const req = {
        user: { userId: 'user-1' },
        query: { days: '30' },
      } as any;
      const res = { json: jest.fn() } as any;

      pool.query.mockResolvedValueOnce({
        rows: [
          {
            date: new Date('2024-01-01T12:00:00Z'),
            commit_count: 1,
            pr_count: 2,
            issue_count: 3,
            review_count: 4,
          },
        ],
      });

      await getContributions(req as any, res);

      expect(res.json).toHaveBeenCalledWith({
        contributions: [
          {
            date: '2024-01-01',
            commit_count: 1,
            pr_count: 2,
            issue_count: 3,
            review_count: 4,
          },
        ],
      });
    });
  });

  describe('syncContributions', () => {
    it('throws UnauthorizedError when user is missing', async () => {
      const req = {} as any;

      await expect(syncContributions(req, {} as any)).rejects.toBeInstanceOf(
        UnauthorizedError,
      );
    });

    it('throws UnauthorizedError when user row has no token or username', async () => {
      const req = {
        user: { userId: 'user-1' },
      } as any;

      pool.query.mockResolvedValueOnce({
        rows: [{ access_token: null, username: '' }],
      });

      await expect(syncContributions(req, {} as any)).rejects.toBeInstanceOf(
        UnauthorizedError,
      );
    });

    it('syncs contributions and returns counts', async () => {
      const req = {
        user: { userId: 'user-1' },
        query: { days: '7' },
      } as any;
      const res = { json: jest.fn() } as any;

      pool.query.mockResolvedValueOnce({
        rows: [{ access_token: 'gh-token', username: 'testuser' }],
      });

      fetchUserContributions.mockResolvedValueOnce([
        {
          date: '2024-01-01',
          commit_count: 1,
          pr_count: 0,
          issue_count: 0,
          review_count: 0,
        },
      ]);

      pool.query.mockResolvedValueOnce({ rows: [{ inserted: true }] });

      await syncContributions(req, res);

      expect(fetchUserContributions).toHaveBeenCalledWith(
        'testuser',
        'gh-token',
        7,
      );
      expect(res.json).toHaveBeenCalledWith({
        synced: 1,
        inserted: 1,
        updated: 0,
      });
    });
  });
});

