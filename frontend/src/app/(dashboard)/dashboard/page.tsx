"use client";

import { useRepos, useSyncRepos } from "@/hooks/use-repos";
import { useContributions, useSyncContributions } from "@/hooks/use-contributions";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { ErrorState } from "@/components/shared/error-state";
import { StatsGrid } from "@/components/dashboard/stats-grid";
import { SyncButton } from "@/components/dashboard/sync-button";
import { ContributionChart } from "@/components/dashboard/contribution-chart";
import { LanguageChart } from "@/components/dashboard/language-chart";
import { RecentRepos } from "@/components/dashboard/recent-repos";
import { WeeklyDigest } from "@/components/dashboard/weekly-digest";
import { ProductivitySummary } from "@/components/dashboard/productivity-summary";
import { Skeleton } from "@/components/ui/skeleton";
import { FolderGit2 } from "lucide-react";
import { toast } from "sonner";

export default function DashboardPage() {
  const repos = useRepos();
  const contributions = useContributions(30);
  const syncRepos = useSyncRepos();
  const syncContributions = useSyncContributions();

  const isSyncing = syncRepos.isPending || syncContributions.isPending;

  const handleSync = () => {
    syncRepos.mutate(undefined, {
      onSuccess: (data) => {
        toast.success(`Synced ${data.synced} repositories`, {
          description: `${data.inserted} new, ${data.updated} updated`,
        });
        syncContributions.mutate(30, {
          onSuccess: (contribData) => {
            toast.success(`Synced contributions`, {
              description: `${contribData.inserted} new, ${contribData.updated} updated`,
            });
          },
          onError: () => {
            toast.error("Failed to sync contributions");
          },
        });
      },
      onError: () => {
        toast.error("Failed to sync repositories");
      },
    });
  };

  if (repos.isLoading || contributions.isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-40" />
          <Skeleton className="h-9 w-40" />
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-xl" />
          ))}
        </div>
        <Skeleton className="h-80 rounded-xl" />
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <Skeleton className="h-40 rounded-xl" />
          <Skeleton className="h-40 rounded-xl" />
        </div>
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <Skeleton className="h-64 rounded-xl" />
          <Skeleton className="h-64 rounded-xl" />
        </div>
      </div>
    );
  }

  if (repos.isError) {
    return <ErrorState message="Failed to load data" onRetry={() => repos.refetch()} />;
  }

  const repoData = repos.data || [];
  const contribData = contributions.data || [];
  const hasData = repoData.length > 0;

  return (
    <div className="space-y-6">
      <PageHeader title="Dashboard" description="Overview of your GitHub activity">
        <SyncButton onClick={handleSync} isPending={isSyncing} />
      </PageHeader>

      {!hasData ? (
        <EmptyState
          icon={FolderGit2}
          title="No data yet"
          description="Sync your GitHub data to see your dashboard analytics."
        >
          <SyncButton onClick={handleSync} isPending={isSyncing} />
        </EmptyState>
      ) : (
        <>
          <StatsGrid repos={repoData} contributions={contribData} />

          <ContributionChart data={contribData} />

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <WeeklyDigest data={contribData} />
            <ProductivitySummary data={contribData} />
          </div>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <LanguageChart repos={repoData} />
            <RecentRepos repos={repoData} />
          </div>
        </>
      )}
    </div>
  );
}
