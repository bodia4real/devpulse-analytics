"use client";

import { StatCard } from "./stat-card";
import {
  FolderGit2,
  Star,
  GitCommitHorizontal,
  GitPullRequest,
} from "lucide-react";
import type { Repo } from "@/types/repo";
import type { ContributionDay } from "@/types/contribution";

interface StatsGridProps {
  repos: Repo[];
  contributions: ContributionDay[];
}

export function StatsGrid({ repos, contributions }: StatsGridProps) {
  const totalStars = repos.reduce((sum, repo) => sum + repo.stars, 0);
  const totalContributions = contributions.reduce(
    (sum, day) =>
      sum +
      day.commit_count +
      day.pr_count +
      day.issue_count +
      day.review_count,
    0
  );
  const totalPRs = contributions.reduce((sum, day) => sum + day.pr_count, 0);

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <StatCard
        title="Total Repos"
        value={repos.length}
        icon={FolderGit2}
        description={`${repos.filter((r) => r.language).length} with language data`}
      />
      <StatCard
        title="Total Stars"
        value={totalStars}
        icon={Star}
        description={`Across ${repos.length} repositories`}
      />
      <StatCard
        title="Contributions"
        value={totalContributions}
        icon={GitCommitHorizontal}
        description="Last 30 days"
      />
      <StatCard
        title="Pull Requests"
        value={totalPRs}
        icon={GitPullRequest}
        description="Last 30 days"
      />
    </div>
  );
}
