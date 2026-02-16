"use client";

import { useState } from "react";
import { useContributions, useSyncContributions } from "@/hooks/use-contributions";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { ErrorState } from "@/components/shared/error-state";
import { SyncButton } from "@/components/dashboard/sync-button";
import { DateRangeSelector } from "@/components/contributions/date-range-selector";
import { ContributionSummary } from "@/components/contributions/contribution-summary";
import { ContributionAreaChart } from "@/components/contributions/contribution-area-chart";
import { ProductivityInsights } from "@/components/contributions/productivity-insights";
import { Skeleton } from "@/components/ui/skeleton";
import { GitCommitHorizontal } from "lucide-react";
import { toast } from "sonner";

export default function ContributionsPage() {
  const [days, setDays] = useState(30);
  const { data, isLoading, isError, refetch } = useContributions(days);
  const syncContributions = useSyncContributions();

  const handleSync = () => {
    syncContributions.mutate(days, {
      onSuccess: (result) => {
        toast.success("Contributions synced", {
          description: `${result.inserted} new, ${result.updated} updated`,
        });
      },
      onError: () => {
        toast.error("Failed to sync contributions");
      },
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-9 w-40" />
        </div>
        <Skeleton className="h-10 w-64" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-xl" />
          ))}
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={`insight-${i}`} className="h-28 rounded-xl" />
          ))}
        </div>
        <Skeleton className="h-72 rounded-xl" />
      </div>
    );
  }

  if (isError) {
    return (
      <ErrorState message="Failed to load contributions" onRetry={refetch} />
    );
  }

  const contribData = data || [];
  const hasData = contribData.some(
    (d) =>
      d.commit_count > 0 ||
      d.pr_count > 0 ||
      d.issue_count > 0 ||
      d.review_count > 0
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Contributions"
        description="Your activity over time"
      >
        <SyncButton
          onClick={handleSync}
          isPending={syncContributions.isPending}
        />
      </PageHeader>

      <DateRangeSelector value={days} onChange={setDays} />

      {!hasData ? (
        <EmptyState
          icon={GitCommitHorizontal}
          title="No contribution data"
          description="Sync your contributions from GitHub to see analytics."
        >
          <SyncButton
            onClick={handleSync}
            isPending={syncContributions.isPending}
          />
        </EmptyState>
      ) : (
        <>
          <ContributionSummary data={contribData} />

          <ProductivityInsights data={contribData} />

          <ContributionAreaChart data={contribData} />
        </>
      )}
    </div>
  );
}
