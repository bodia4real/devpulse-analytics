"use client";

import { useState, useMemo } from "react";
import { useRepos } from "@/hooks/use-repos";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { ErrorState } from "@/components/shared/error-state";
import { RepoMultiSelect } from "@/components/compare/repo-multi-select";
import { ComparisonTable } from "@/components/compare/comparison-table";
import { ComparisonChart } from "@/components/compare/comparison-chart";
import { Skeleton } from "@/components/ui/skeleton";
import { GitCompareArrows } from "lucide-react";

export default function ComparePage() {
  const { data, isLoading, isError, refetch } = useRepos();
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const repos = data || [];
  const selectedRepos = useMemo(
    () => repos.filter((r) => selectedIds.includes(r.id)),
    [repos, selectedIds]
  );

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <Skeleton className="h-8 w-48" />
          <Skeleton className="mt-1 h-4 w-64" />
        </div>
        <Skeleton className="h-10 w-full max-w-md" />
        <Skeleton className="h-64 rounded-xl" />
        <Skeleton className="h-72 rounded-xl" />
      </div>
    );
  }

  if (isError) {
    return (
      <ErrorState message="Failed to load repositories" onRetry={refetch} />
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Compare"
        description="Compare up to 3 repositories side by side"
      />

      <div className="max-w-md">
        <RepoMultiSelect
          repos={repos}
          selectedIds={selectedIds}
          onChange={setSelectedIds}
        />
      </div>

      {selectedRepos.length < 2 ? (
        <EmptyState
          icon={GitCompareArrows}
          title="Select repositories"
          description="Choose at least 2 repositories to compare their stats."
        />
      ) : (
        <>
          <ComparisonTable repos={selectedRepos} />
          <ComparisonChart repos={selectedRepos} />
        </>
      )}
    </div>
  );
}
