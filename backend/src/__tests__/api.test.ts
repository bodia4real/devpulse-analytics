import request from 'supertest';
import server from '../server';


const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});


// Mock DB  tests 
jest.mock('../config/database', () => ({
  pool: {
    query: jest.fn().mockResolvedValue({
      rows: [{ now: new Date().toISOString() }],
    }),
  },
}));

describe('API integration', () => {
  it('GET /api/health returns OK when DB is healthy', async () => {
    const res = await request(server).get('/api/health');

    expect(res.statusCode).toBe(200);
    expect(res.body).toMatchObject({
      status: 'ok',
      database: 'connected',
    });
  });

  it('GET /api/auth/me without token returns 401', async () => {
    const res = await request(server).get('/api/auth/me');

    expect(res.statusCode).toBe(401);
    expect(res.body).toHaveProperty('error');
  });

  it('GET /api/auth/github redirects to GitHub OAuth', async () => {
    const res = await request(server).get('/api/auth/github');

    expect([301, 302]).toContain(res.statusCode);
    expect(res.headers.location).toContain('github.com/login/oauth/authorize');
  });
  it('GET /api/repos without token returns 401', async () => {
    const res = await request(server).get('/api/repos');
    expect(res.statusCode).toBe(401);
  });

  it('GET /api/contributions without token returns 401', async () => {
    const res = await request(server).get('/api/contributions');
    expect(res.statusCode).toBe(401);
  });
});

// Close HTTP server after tests so Jest can exit cleanly
afterAll((done) => {
  consoleErrorSpy.mockRestore();
  server.close(done);
});