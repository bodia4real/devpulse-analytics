"use client";

import { useMemo } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useRepos } from "@/hooks/use-repos";
import { useContributions } from "@/hooks/use-contributions";
import { ErrorState } from "@/components/shared/error-state";
import { DeveloperProfile } from "@/components/profile/developer-card";
import { computeInsights } from "@/lib/contribution-insights";
import { Skeleton } from "@/components/ui/skeleton";

export default function ProfilePage() {
  const { user } = useAuth();
  const repos = useRepos();
  const contributions = useContributions(365);

  const contribData = contributions.data || [];
  const repoData = repos.data || [];

  const insights = useMemo(
    () => (contribData.length > 0 ? computeInsights(contribData) : null),
    [contribData]
  );

  const totalContributions = useMemo(
    () =>
      contribData.reduce(
        (sum, d) =>
          sum + d.commit_count + d.pr_count + d.issue_count + d.review_count,
        0
      ),
    [contribData]
  );

  const topLanguages = useMemo(() => {
    const counts: Record<string, number> = {};
    repoData.forEach((r) => {
      if (r.language) {
        counts[r.language] = (counts[r.language] || 0) + 1;
      }
    });
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, count]) => ({ name, count }));
  }, [repoData]);

  if (repos.isLoading || contributions.isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-64 rounded-2xl" />
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <Skeleton className="h-48 rounded-xl" />
          <Skeleton className="h-48 rounded-xl" />
        </div>
        <Skeleton className="h-80 rounded-xl" />
      </div>
    );
  }

  if (repos.isError || contributions.isError) {
    return (
      <ErrorState
        message="Failed to load profile data"
        onRetry={() => {
          repos.refetch();
          contributions.refetch();
        }}
      />
    );
  }

  if (!user) return null;

  return (
    <DeveloperProfile
      user={user}
      repos={repoData}
      totalContributions={totalContributions}
      insights={insights}
      topLanguages={topLanguages}
    />
  );
}
