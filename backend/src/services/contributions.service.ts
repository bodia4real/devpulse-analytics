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

   // Commits: use Search API first (matches GitHub contribution graph across ALL repos)
   // Fallback to per-repo if search fails (rate limit, etc.)
   let allCommits: any[] = [];
   const commitSearchQuery = `author:${username} committer-date:>=${sinceDate}`;
   const commitSearchUrl = `https://api.github.com/search/commits?q=${encodeURIComponent(commitSearchQuery)}`;

   try {
       let page = 1;
       const searchPerPage = 100;
       const searchHeaders = { Accept: 'application/vnd.github.cloak-preview+json' };
       while (true) {
           const url = `${commitSearchUrl}&per_page=${searchPerPage}&page=${page}`;
           const searchRes = await handleGitHubRateLimit(url, accessToken, 3, searchHeaders);
           const items: any[] = searchRes.data?.items ?? [];
           if (items.length === 0) break;
           allCommits = [...allCommits, ...items];
           if (items.length < searchPerPage) break;
           page++;
           if (page > 10) break; // cap at 1000 commits
           await new Promise((r) => setTimeout(r, 500)); // search API: 30 req/min
       }
   } catch {
       // Fallback: per-repo commits (only repos user owns)
       const repos = await fetchUserRepos(accessToken);
       const validRepos = repos.filter((r: any) => r.owner?.login && r.name);
       const BATCH_SIZE = 5;
       const DELAY_MS = 80;
       for (let i = 0; i < validRepos.length; i += BATCH_SIZE) {
           const batch = validRepos.slice(i, i + BATCH_SIZE);
           const batchResults = await Promise.all(
               batch.map(async (repo: any) => {
                   const owner = repo.owner.login;
                   const repoName = repo.name;
                   let commits: any[] = [];
                   let p = 1;
                   while (true) {
                       const commitsUrl = `https://api.github.com/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repoName)}/commits?author=${encodeURIComponent(username)}&since=${encodeURIComponent(since)}&until=${encodeURIComponent(until)}&per_page=${perPage}&page=${p}`;
                       const commitsResponse = await handleGitHubRateLimit(commitsUrl, accessToken);
                       const items: any[] = Array.isArray(commitsResponse.data) ? commitsResponse.data : [];
                       if (items.length === 0) break;
                       commits = [...commits, ...items];
                       if (items.length < perPage) break;
                       p++;
                   }
                   return commits;
               })
           );
           for (const c of batchResults) allCommits = [...allCommits, ...c];
           if (i + BATCH_SIZE < validRepos.length) {
               await new Promise((r) => setTimeout(r, DELAY_MS));
           }
       }
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