"use client";

import { use } from "react";
import { useRepo } from "@/hooks/use-repos";
import { ErrorState } from "@/components/shared/error-state";
import { RepoDetailHeader } from "@/components/repos/repo-detail-header";
import { RepoDetailStats } from "@/components/repos/repo-detail-stats";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { ROUTES } from "@/lib/constants";

export default function RepoDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { data: repo, isLoading, isError, refetch } = useRepo(id);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-5 w-32" />
        <div>
          <Skeleton className="h-8 w-64" />
          <Skeleton className="mt-1 h-4 w-48" />
          <Skeleton className="mt-3 h-16 w-full" />
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  if (isError || !repo) {
    return (
      <ErrorState message="Failed to load repository" onRetry={refetch} />
    );
  }

  return (
    <div className="space-y-6">
      <Button
        variant="ghost"
        size="sm"
        asChild
        className="gap-2 text-muted-foreground"
      >
        <Link href={ROUTES.repos}>
          <ArrowLeft className="h-4 w-4" />
          Back to Repositories
        </Link>
      </Button>

      <RepoDetailHeader repo={repo} />
      <RepoDetailStats repo={repo} />
    </div>
  );
}
