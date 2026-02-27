import { healthCheck } from '../utils/health';

// Mock the database pool so tests don't hit the real DB
jest.mock('../config/database', () => ({
  pool: {
    query: jest.fn(),
  },
}));

describe('healthCheck', () => {
  it('returns ok when database query succeeds', async () => {
    const { pool } = require('../config/database');
    (pool.query as jest.Mock).mockResolvedValue({
      rows: [{ now: new Date().toISOString() }],
    });

    const json = jest.fn();
    const setHeader = jest.fn();
    const status = jest.fn(() => ({ json }));

    const res: any = { json, setHeader, status };

    await healthCheck({} as any, res);

    expect(setHeader).toHaveBeenCalledWith('Content-Type', 'application/json');
    expect(json).toHaveBeenCalledWith(
      expect.objectContaining({
        status: 'ok',
        database: 'connected',
      }),
    );
  });
});

