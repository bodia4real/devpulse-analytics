"use client";

import { StatCard } from "@/components/dashboard/stat-card";
import {
  GitCommitHorizontal,
  GitPullRequest,
  CircleDot,
  Eye,
} from "lucide-react";
import type { ContributionDay } from "@/types/contribution";

interface ContributionSummaryProps {
  data: ContributionDay[];
}

export function ContributionSummary({ data }: ContributionSummaryProps) {
  const totals = data.reduce(
    (acc, day) => ({
      commits: acc.commits + day.commit_count,
      prs: acc.prs + day.pr_count,
      issues: acc.issues + day.issue_count,
      reviews: acc.reviews + day.review_count,
    }),
    { commits: 0, prs: 0, issues: 0, reviews: 0 }
  );

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <StatCard title="Commits" value={totals.commits} icon={GitCommitHorizontal} />
      <StatCard title="Pull Requests" value={totals.prs} icon={GitPullRequest} />
      <StatCard title="Issues" value={totals.issues} icon={CircleDot} />
      <StatCard title="Reviews" value={totals.reviews} icon={Eye} />
    </div>
  );
}
