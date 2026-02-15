"use client";

import { useMemo, useState } from "react";
import { useRepos, useSyncRepos } from "@/hooks/use-repos";
import { PageHeader } from "@/components/shared/page-header";
import { ErrorState } from "@/components/shared/error-state";
import { SyncButton } from "@/components/dashboard/sync-button";
import { RepoFilters } from "@/components/repos/repo-filters";
import { RepoGrid } from "@/components/repos/repo-grid";
import { RepoEmptyState } from "@/components/repos/repo-empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import type { Repo } from "@/types/repo";

function sortRepos(repos: Repo[], sortBy: string): Repo[] {
  const sorted = [...repos];
  switch (sortBy) {
    case "stars":
      return sorted.sort((a, b) => b.stars - a.stars);
    case "forks":
      return sorted.sort((a, b) => b.forks - a.forks);
    case "name":
      return sorted.sort((a, b) => a.name.localeCompare(b.name));
    case "updated":
    default:
      return sorted.sort(
        (a, b) =>
          new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
      );
  }
}

export default function ReposPage() {
  const { data: repos, isLoading, isError, refetch } = useRepos();
  const syncRepos = useSyncRepos();

  const [search, setSearch] = useState("");
  const [language, setLanguage] = useState("all");
  const [sortBy, setSortBy] = useState("updated");

  const languages = useMemo(() => {
    if (!repos) return [];
    const langs = new Set(repos.map((r) => r.language).filter(Boolean));
    return [...langs].sort() as string[];
  }, [repos]);

  const filteredRepos = useMemo(() => {
    if (!repos) return [];
    let result = repos;

    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (r) =>
          r.name.toLowerCase().includes(q) ||
          r.description?.toLowerCase().includes(q)
      );
    }

    if (language !== "all") {
      result = result.filter((r) => r.language === language);
    }

    return sortRepos(result, sortBy);
  }, [repos, search, language, sortBy]);

  const handleSync = () => {
    syncRepos.mutate(undefined, {
      onSuccess: (data) => {
        toast.success(`Synced ${data.synced} repositories`, {
          description: `${data.inserted} new, ${data.updated} updated`,
        });
      },
      onError: () => {
        toast.error("Failed to sync repositories");
      },
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-40" />
          <Skeleton className="h-9 w-40" />
        </div>
        <div className="flex gap-3">
          <Skeleton className="h-10 flex-1" />
          <Skeleton className="h-10 w-40" />
          <Skeleton className="h-10 w-40" />
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-40 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <ErrorState message="Failed to load repositories" onRetry={refetch} />
    );
  }

  const repoData = repos || [];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Repositories"
        description={`${repoData.length} repositories`}
      >
        <SyncButton
          onClick={handleSync}
          isPending={syncRepos.isPending}
        />
      </PageHeader>

      {repoData.length === 0 ? (
        <RepoEmptyState onSync={handleSync} isSyncing={syncRepos.isPending} />
      ) : (
        <>
          <RepoFilters
            search={search}
            onSearchChange={setSearch}
            language={language}
            onLanguageChange={setLanguage}
            sortBy={sortBy}
            onSortChange={setSortBy}
            languages={languages}
          />

          {filteredRepos.length === 0 ? (
            <p className="py-12 text-center text-sm text-muted-foreground">
              No repositories match your filters.
            </p>
          ) : (
            <RepoGrid repos={filteredRepos} />
          )}
        </>
      )}
    </div>
  );
}
