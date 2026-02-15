import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, GitFork, CircleDot } from "lucide-react";
import {
  formatCompactNumber,
  formatRelativeDate,
  getLanguageColor,
} from "@/lib/utils";
import type { Repo } from "@/types/repo";

interface RepoCardProps {
  repo: Repo;
}

export function RepoCard({ repo }: RepoCardProps) {
  return (
    <Card className="h-full">
      <CardContent className="flex h-full flex-col p-5">
        <div className="flex items-start justify-between gap-2">
          <h3 className="truncate text-sm font-semibold">{repo.name}</h3>
          {repo.language && (
            <Badge
              variant="secondary"
              className="shrink-0 gap-1.5 text-xs font-normal"
            >
              <span
                className="inline-block h-2 w-2 rounded-full"
                style={{ backgroundColor: getLanguageColor(repo.language) }}
              />
              {repo.language}
            </Badge>
          )}
        </div>

        {repo.description && (
          <p className="mt-2 line-clamp-2 text-sm text-muted-foreground leading-relaxed">
            {repo.description}
          </p>
        )}

        <div className="mt-auto flex items-center gap-4 pt-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Star className="h-3.5 w-3.5" />
            {formatCompactNumber(repo.stars)}
          </span>
          <span className="flex items-center gap-1">
            <GitFork className="h-3.5 w-3.5" />
            {formatCompactNumber(repo.forks)}
          </span>
          <span className="flex items-center gap-1">
            <CircleDot className="h-3.5 w-3.5" />
            {repo.open_issues}
          </span>
          <span className="ml-auto">{formatRelativeDate(repo.updated_at)}</span>
        </div>
      </CardContent>
    </Card>
  );
}
