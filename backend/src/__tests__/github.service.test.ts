import axios from 'axios';
import { BadGatewayError } from '../errors';
import {
  handleGitHubRateLimit,
  fetchUserRepos,
  fetchRepoDetails,
} from '../services/github.service';

jest.mock('axios');

const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('github.service', () => {
  beforeEach(() => {
    jest.useRealTimers();
    jest.clearAllMocks();
  });

  it('handleGitHubRateLimit returns response on 200', async () => {
    mockedAxios.get.mockResolvedValueOnce({
      status: 200,
      data: { ok: true },
      headers: {},
    } as any);

    const res = await handleGitHubRateLimit(
      'https://api.github.com/user',
      'token',
    );

    expect(res.data).toEqual({ ok: true });
  });

  it('handleGitHubRateLimit throws BadGatewayError for non-rate-limit error', async () => {
    mockedAxios.get.mockResolvedValueOnce({
      status: 500,
      data: { message: 'Server error' },
      headers: {},
    } as any);

    await expect(
      handleGitHubRateLimit('https://api.github.com/user', 'token'),
    ).rejects.toBeInstanceOf(BadGatewayError);
  });

  it('fetchUserRepos delegates to handleGitHubRateLimit', async () => {
    mockedAxios.get.mockResolvedValueOnce({
      status: 200,
      data: [{ id: 1 }],
      headers: {},
    } as any);

    const repos = await fetchUserRepos('token');
    expect(repos).toEqual([{ id: 1 }]);
  });

  it('fetchRepoDetails delegates to handleGitHubRateLimit', async () => {
    mockedAxios.get.mockResolvedValueOnce({
      status: 200,
      data: { id: 1, full_name: 'user/repo' },
      headers: {},
    } as any);

    const details = await fetchRepoDetails('user', 'repo', 'token');
    expect(details).toEqual({ id: 1, full_name: 'user/repo' });
  });
});

