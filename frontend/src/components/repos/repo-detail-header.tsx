import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ExternalLink } from "lucide-react";
import { getLanguageColor } from "@/lib/utils";
import type { Repo } from "@/types/repo";

interface RepoDetailHeaderProps {
  repo: Repo;
}

export function RepoDetailHeader({ repo }: RepoDetailHeaderProps) {
  return (
    <div>
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{repo.name}</h1>
          <p className="mt-0.5 text-sm text-muted-foreground">
            {repo.full_name}
          </p>
        </div>
        <Button variant="outline" size="sm" asChild className="gap-2">
          <a
            href={`https://github.com/${repo.full_name}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            <ExternalLink className="h-4 w-4" />
            View on GitHub
          </a>
        </Button>
      </div>

      {repo.description && (
        <p className="mt-3 text-muted-foreground leading-relaxed">
          {repo.description}
        </p>
      )}

      {repo.language && (
        <div className="mt-3">
          <Badge variant="secondary" className="gap-1.5">
            <span
              className="inline-block h-2.5 w-2.5 rounded-full"
              style={{ backgroundColor: getLanguageColor(repo.language) }}
            />
            {repo.language}
          </Badge>
        </div>
      )}
    </div>
  );
}
