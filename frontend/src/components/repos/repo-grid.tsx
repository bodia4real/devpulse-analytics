import { RepoCard } from "./repo-card";
import type { Repo } from "@/types/repo";

interface RepoGridProps {
  repos: Repo[];
}

export function RepoGrid({ repos }: RepoGridProps) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {repos.map((repo) => (
        <RepoCard key={repo.id} repo={repo} />
      ))}
    </div>
  );
}
