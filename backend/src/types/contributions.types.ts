export type ContributionStats = { 
    date: string,
    commit_count: number, 
    pr_count: number, 
    issue_count: number, 
    review_count: number 
};

export type ContributionsResult = ContributionStats[];