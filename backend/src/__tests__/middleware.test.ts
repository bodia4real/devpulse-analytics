import { requireAuth } from '../middleware/auth.middleware';
import { UnauthorizedError } from '../errors';

describe('requireAuth middleware', () => {
  it('calls next with UnauthorizedError when Authorization header is missing', () => {
    const req: any = { headers: {} };
    const res: any = {};
    const next = jest.fn();

    requireAuth(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    const err = next.mock.calls[0][0];
    expect(err).toBeInstanceOf(UnauthorizedError);
    expect(err.message).toBe('Missing or invalid Authorization header');
  });

  it('calls next with UnauthorizedError when token is invalid', () => {
    const req: any = {
      headers: { authorization: 'Bearer invalid_token' },
    };
    const res: any = {};
    const next = jest.fn();

    requireAuth(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    const err = next.mock.calls[0][0];
    expect(err).toBeInstanceOf(UnauthorizedError);
    expect(err.message).toBe('Invalid or expired token');
  });
});