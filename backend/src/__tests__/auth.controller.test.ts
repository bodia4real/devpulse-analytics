import axios from 'axios';
import jwt from 'jsonwebtoken';
import { redirectToGitHub, githubCallback, getMe, logout } from '../controllers/auth.controller';
import { BadRequestError, BadGatewayError, UnauthorizedError } from '../errors';
import type { AuthenticatedRequest } from '../middleware/auth.middleware';

// Provide a stable config for tests (does not hit real env)
jest.mock('../config/env', () => ({
  config: {
    jwtSecret: 'test-secret',
    jwtExpiresIn: '7d',
    github: {
      clientId: 'test-client-id',
      clientSecret: 'test-client-secret',
      callbackUrl: 'http://backend/api/auth/github/callback',
    },
    frontendUrl: 'http://frontend',
  },
}));

// Mock DB pool so we never touch a real database
jest.mock('../config/database', () => ({
  pool: {
    query: jest.fn(),
  },
}));

jest.mock('axios');
jest.mock('jsonwebtoken', () => ({
  sign: jest.fn(() => 'signed-jwt'),
}));

const mockedAxios = axios as jest.Mocked<typeof axios>;
const mockedJwt = jwt as unknown as { sign: jest.Mock };

describe('auth.controller', () => {
  describe('redirectToGitHub', () => {
    it('redirects to GitHub OAuth URL with client id and callback', async () => {
      const req = {} as any;
      const res = { redirect: jest.fn() } as any;

      await redirectToGitHub(req, res);

      expect(res.redirect).toHaveBeenCalledTimes(1);
      const url = (res.redirect as jest.Mock).mock.calls[0][0] as string;
      expect(url).toContain('github.com/login/oauth/authorize');
      expect(url).toContain('client_id=test-client-id');
      expect(url).toContain(
        encodeURIComponent('http://backend/api/auth/github/callback'),
      );
    });
  });

  describe('githubCallback', () => {
    it('throws BadRequestError if code is missing', async () => {
      const req = { query: {} } as any;
      const res = {} as any;

      await expect(githubCallback(req, res)).rejects.toBeInstanceOf(
        BadRequestError,
      );
    });

    it('throws BadGatewayError when token exchange fails', async () => {
      mockedAxios.post.mockResolvedValueOnce({ data: {} } as any);

      const req = { query: { code: 'abc' } } as any;
      const res = {} as any;

      await expect(githubCallback(req, res)).rejects.toBeInstanceOf(
        BadGatewayError,
      );
    });

    it('exchanges code, upserts user, signs JWT and redirects to frontend', async () => {
      const { pool } = require('../config/database') as {
        pool: { query: jest.Mock };
      };

      mockedAxios.post.mockResolvedValueOnce({
        data: { access_token: 'gh-access-token' },
      } as any);

      mockedAxios.get.mockResolvedValueOnce({
        data: {
          id: 123,
          login: 'testuser',
          email: 'user@example.com',
          avatar_url: 'https://avatar',
          created_at: '2023-01-01T00:00:00Z',
        },
      } as any);

      pool.query.mockResolvedValueOnce({
        rows: [
          {
            id: 'user-1',
            github_id: '123',
            username: 'testuser',
            email: 'user@example.com',
            avatar_url: 'https://avatar',
          },
        ],
      });

      const req = { query: { code: 'abc' } } as any;
      const res = { redirect: jest.fn() } as any;

      await githubCallback(req, res);

      expect(mockedJwt.sign).toHaveBeenCalledWith(
        { userId: 'user-1' },
        'test-secret',
        expect.objectContaining({ expiresIn: '7d' }),
      );

      expect(res.redirect).toHaveBeenCalledTimes(1);
      const url = (res.redirect as jest.Mock).mock.calls[0][0] as string;
      expect(url).toBe(
        'http://frontend/callback?token=' +
          encodeURIComponent('signed-jwt'),
      );
    });
  });

  describe('getMe', () => {
    it('throws UnauthorizedError when req.user is missing', async () => {
      const req = { } as any;
      const res = {} as any;

      await expect(getMe(req, res)).rejects.toBeInstanceOf(UnauthorizedError);
    });

    it('returns current user when found in DB', async () => {
      const { pool } = require('../config/database') as {
        pool: { query: jest.Mock };
      };

      const req = {
        user: { userId: 'user-1' },
      } as AuthenticatedRequest as any;

      const dbUser = {
        id: 'user-1',
        github_id: '123',
        username: 'testuser',
        email: 'user@example.com',
        avatar_url: 'https://avatar',
        created_at: new Date('2023-01-01T00:00:00Z'),
        github_created_at: new Date('2022-01-01T00:00:00Z'),
      };

      pool.query.mockResolvedValueOnce({ rows: [dbUser] });

      const res = { json: jest.fn() } as any;

      await getMe(req as any, res);

      expect(res.json).toHaveBeenCalledWith({
        user: expect.objectContaining({
          id: 'user-1',
          github_id: '123',
          username: 'testuser',
        }),
      });
    });
  });

  describe('logout', () => {
    it('returns 200 and a message', async () => {
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      } as any;

      await logout({} as any, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: expect.stringContaining('Remove the token'),
        }),
      );
    });
  });
});

