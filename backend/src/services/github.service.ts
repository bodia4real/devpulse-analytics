import axios, { AxiosResponse } from 'axios';
import { BadGatewayError } from '../errors';

/**
 * Makes a GET request to GitHub API. Returns the full response.
 * On 403/429: waits per x-ratelimit-reset or retry-after, then retries.
 * @see https://docs.github.com/en/rest/using-the-rest-api/rate-limits-for-the-rest-api
 */
const handleGitHubRateLimit = async (
    url: string,
    accessToken: string,
    retriesLeft = 3
): Promise<AxiosResponse> => {
    const response = await axios.get(url, {
        headers: { Authorization: `Bearer ${accessToken}` },
        validateStatus: () => true,
    });

    if (response.status === 200) return response;

    if ((response.status === 403 || response.status === 429) && retriesLeft > 0) {
        const retryAfter = response.headers['retry-after'];
        const reset = response.headers['x-ratelimit-reset'];
        const remaining = response.headers['x-ratelimit-remaining'];

        let waitMs = 60_000;  // 1 min default
        if (retryAfter) {
            waitMs = parseInt(retryAfter, 10) * 1000;
        } else if (remaining === '0' && reset) {
            const resetTime = parseInt(reset, 10) * 1000;
            waitMs = Math.max(0, resetTime - Date.now());
        }
        waitMs = Math.min(waitMs, 300_000);  // cap at 5 min
        await new Promise((r) => setTimeout(r, waitMs));
        return handleGitHubRateLimit(url, accessToken, retriesLeft - 1);
    }

    if (response.status === 403 || response.status === 429) {
        throw new BadGatewayError('GitHub API rate limit exceeded. Try again later.');
    }

    const data = response.data as { message?: string; errors?: Array<{ message?: string; field?: string }> };
    let msg = data?.message ?? 'GitHub API error';
    if (Array.isArray(data?.errors) && data.errors.length > 0) {
        msg += ' ' + data.errors.map((e: any) => e.message || e.field).join('; ');
    }
    throw new BadGatewayError(msg);
};

const fetchUserRepos = async (accessToken: string) => {
    const response = await handleGitHubRateLimit('https://api.github.com/user/repos', accessToken);
    return response.data;
};

const fetchRepoDetails = async (owner: string, repo: string, accessToken: string) => {
    const url = `https://api.github.com/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}`;
    const response = await handleGitHubRateLimit(url, accessToken);
    return response.data;
};

export { fetchUserRepos, fetchRepoDetails, handleGitHubRateLimit };
