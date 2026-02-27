import * as githubService from '../services/github.service';
import * as dateRangeModule from '../utils/dateRange';
import { fetchUserContributions } from '../services/contributions.service';

describe('fetchUserContributions', () => {
  const handleGitHubRateLimitSpy = jest.spyOn(
    githubService,
    'handleGitHubRateLimit',
  );
  const fetchUserReposSpy = jest.spyOn(githubService, 'fetchUserRepos');
  const getDateRangeSpy = jest.spyOn(dateRangeModule, 'default');

  beforeEach(() => {
    jest.clearAllMocks();

    // Use a tiny, fixed date range so output is deterministic
    getDateRangeSpy.mockReturnValue({
      since: '2024-01-01T00:00:00.000Z',
      until: '2024-01-02T00:00:00.000Z',
    });
  });

  it('aggregates PRs, issues and reviews using GitHub search APIs', async () => {
    // 1) PR search
    handleGitHubRateLimitSpy.mockResolvedValueOnce({
      data: {
        items: [
          { created_at: '2024-01-01T10:00:00Z' },
          { created_at: '2024-01-01T12:00:00Z' },
        ],
      },
    } as any);

    // 2) Issue search
    handleGitHubRateLimitSpy.mockResolvedValueOnce({
      data: {
        items: [{ created_at: '2024-01-01T09:00:00Z' }],
      },
    } as any);

    // 3) Events (reviews)
    handleGitHubRateLimitSpy.mockResolvedValueOnce({
      data: [
        { type: 'PullRequestReviewEvent', created_at: '2024-01-01T08:00:00Z' },
        { type: 'PushEvent', created_at: '2024-01-01T07:00:00Z' },
      ],
    } as any);

    // 4) Commit search – return no items so loop exits immediately
    handleGitHubRateLimitSpy.mockResolvedValueOnce({
      data: { items: [] },
    } as any);

    const result = await fetchUserContributions('user', 'token', 1);

    // We expect one or more days, but key is that counts were aggregated correctly
    expect(result.length).toBeGreaterThanOrEqual(1);

    const firstDay = result[0];
    expect(firstDay.date).toBe('2024-01-01');
    expect(firstDay.pr_count).toBe(2); // two PR items above
    expect(firstDay.issue_count).toBe(1); // one issue item above
    expect(firstDay.review_count).toBe(1); // one review event
    expect(firstDay.commit_count).toBe(0); // no commits in this test
  });

  it('falls back to per-repo commits when search API fails', async () => {
    // 1) PR search (empty)
    handleGitHubRateLimitSpy.mockResolvedValueOnce({
      data: { items: [] },
    } as any);

    // 2) Issue search (empty)
    handleGitHubRateLimitSpy.mockResolvedValueOnce({
      data: { items: [] },
    } as any);

    // 3) Events (no reviews)
    handleGitHubRateLimitSpy.mockResolvedValueOnce({
      data: [],
    } as any);

    // 4) Commit search – throw to trigger fallback
    handleGitHubRateLimitSpy.mockRejectedValueOnce(
      new Error('rate limited'),
    );

    // Fallback: user repos
    fetchUserReposSpy.mockResolvedValueOnce([
      {
        owner: { login: 'user' },
        name: 'repo-1',
      },
    ]);

    // Commits for that repo: one commit with a date
    handleGitHubRateLimitSpy.mockResolvedValueOnce({
      data: [
        {
          commit: {
            committer: { date: '2024-01-01T15:00:00Z' },
          },
        },
      ],
    } as any);

    const result = await fetchUserContributions('user', 'token', 1);

    const firstDay = result[0];
    expect(firstDay.date).toBe('2024-01-01');
    expect(firstDay.commit_count).toBe(1); // from fallback repo-commit path
    // Other metrics are zero in this scenario
    expect(firstDay.pr_count).toBe(0);
    expect(firstDay.issue_count).toBe(0);
    expect(firstDay.review_count).toBe(0);
  });
});
