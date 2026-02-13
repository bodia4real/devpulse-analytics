import { ContributionStats, ContributionsResult } from '../types/contributions.types';
import getDateRange from '../utils/dateRange';
import { fetchUserRepos, handleGitHubRateLimit } from './github.service';

export const fetchUserContributions = async (username: string, accessToken: string, days: number): Promise<ContributionsResult> => {
    const { since, until } = getDateRange(days);
    const sinceDate = since.slice(0, 10);
    const prQuery = `author:${username} type:pr created:>=${sinceDate}`;
    const prUrl = `https://api.github.com/search/issues?q=${encodeURIComponent(prQuery)}`;


    let allPRs: any[] = [];
    let page = 1;
    const perPage = 100; 

    while (true) {
        const url = `${prUrl}&per_page=${perPage}&page=${page}`;
        const response = await handleGitHubRateLimit(url, accessToken);
        const items = response.data?.items ?? [];
        if (items.length === 0) break;
        allPRs = [...allPRs, ...items];
        if (items.length < perPage) break;
        page++;
    }

    const prCountByDate: Record<string, number> = {};
    for (const item of allPRs) {
        const dateOnly = item.created_at.slice(0, 10);
        prCountByDate[dateOnly] = (prCountByDate[dateOnly] ?? 0) + 1;
    }
 //Issues
    const issueQuery = `author:${username} type:issue created:>=${sinceDate}`;
    const issueUrl = `https://api.github.com/search/issues?q=${encodeURIComponent(issueQuery)}`;

    let allIssues: any[] = [];
    page = 1;

    while (true) {
        const url = `${issueUrl}&per_page=${perPage}&page=${page}`;
        const response = await handleGitHubRateLimit(url, accessToken);
        const items = response.data?.items ?? [];
        if (items.length === 0) break;
        allIssues = [...allIssues, ...items];
        if (items.length < perPage) break;
        page++;
    }

    const issueCountByDate: Record<string, number> = {};
    for (const item of allIssues) {
        const dateOnly = item.created_at.slice(0, 10);
        issueCountByDate[dateOnly] = (issueCountByDate[dateOnly] ?? 0) + 1;
    }

    // Reviews (Events API — one request, no pagination)
    const eventsUrl = `https://api.github.com/users/${username}/events`;
    const eventsResponse = await handleGitHubRateLimit(eventsUrl, accessToken);
    const events: any[] = Array.isArray(eventsResponse.data) ? eventsResponse.data : [];
    const reviewEvents = events.filter((e: any) => e.type === 'PullRequestReviewEvent');

    const reviewCountByDate: Record<string, number> = {};
    for (const event of reviewEvents) {
        const dateOnly = event.created_at.slice(0, 10);
        reviewCountByDate[dateOnly] = (reviewCountByDate[dateOnly] ?? 0) + 1;
    }

   // Commits (per repo, then paginate each)
   const repos = await fetchUserRepos(accessToken);
   let allCommits: any[] = [];

   for (const repo of repos) {
       const owner = repo.owner?.login;
       const repoName = repo.name;
       if (!owner || !repoName) continue;

       let page = 1;
       while (true) {
           const commitsUrl = `https://api.github.com/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repoName)}/commits?author=${encodeURIComponent(username)}&since=${encodeURIComponent(since)}&until=${encodeURIComponent(until)}&per_page=${perPage}&page=${page}`;
           const commitsResponse = await handleGitHubRateLimit(commitsUrl, accessToken);
           const commits: any[] = Array.isArray(commitsResponse.data) ? commitsResponse.data : [];
           if (commits.length === 0) break;

           allCommits = [...allCommits, ...commits];
           if (commits.length < perPage) break;
           page++;
       }
       await new Promise((r) => setTimeout(r, 200)); // small delay between repos to avoid rate limits
   }

   const commitCountByDate: Record<string, number> = {};
   for (const commit of allCommits) {
       const dateStr = commit.commit?.committer?.date ?? commit.commit?.author?.date;
       if (!dateStr) continue;
       const dateOnly = dateStr.slice(0, 10);
       commitCountByDate[dateOnly] = (commitCountByDate[dateOnly] ?? 0) + 1;
   }

   // Merge: one object per day in range (Step 8)
   const result: ContributionStats[] = [];
   const start = new Date(sinceDate);
   const end = new Date(until.slice(0, 10));
   for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
       const dateStr = d.toISOString().slice(0, 10);
       result.push({
           date: dateStr,
           commit_count: commitCountByDate[dateStr] ?? 0,
           pr_count: prCountByDate[dateStr] ?? 0,
           issue_count: issueCountByDate[dateStr] ?? 0,
           review_count: reviewCountByDate[dateStr] ?? 0,
       });
   }
   return result;
};