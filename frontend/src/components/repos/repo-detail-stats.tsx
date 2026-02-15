import { StatCard } from "@/components/dashboard/stat-card";
import { Star, GitFork, CircleDot, Eye } from "lucide-react";
import { formatDate } from "@/lib/utils";
import type { Repo } from "@/types/repo";

interface RepoDetailStatsProps {
  repo: Repo;
}

export function RepoDetailStats({ repo }: RepoDetailStatsProps) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Stars" value={repo.stars} icon={Star} />
        <StatCard title="Forks" value={repo.forks} icon={GitFork} />
        <StatCard title="Open Issues" value={repo.open_issues} icon={CircleDot} />
        <StatCard title="Watchers" value={repo.watchers} icon={Eye} />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="rounded-lg border p-4">
          <p className="text-sm text-muted-foreground">Created</p>
          <p className="mt-1 font-medium">{formatDate(repo.created_at)}</p>
        </div>
        <div className="rounded-lg border p-4">
          <p className="text-sm text-muted-foreground">Last Updated</p>
          <p className="mt-1 font-medium">{formatDate(repo.updated_at)}</p>
        </div>
      </div>
    </div>
  );
}
