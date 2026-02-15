"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Star } from "lucide-react";
import { formatRelativeDate, getLanguageColor, formatCompactNumber } from "@/lib/utils";
import { ROUTES } from "@/lib/constants";
import type { Repo } from "@/types/repo";

interface RecentReposProps {
  repos: Repo[];
  className?: string;
}

export function RecentRepos({ repos, className }: RecentReposProps) {
  const recent = [...repos]
    .sort(
      (a, b) =>
        new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
    )
    .slice(0, 5);

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="text-base font-medium">Recent Repos</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {recent.map((repo) => (
            <Link
              key={repo.id}
              href={ROUTES.repoDetail(repo.id)}
              className="flex items-center justify-between rounded-lg px-3 py-2 transition-colors hover:bg-accent/50"
            >
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{repo.name}</p>
                <div className="mt-0.5 flex items-center gap-2 text-xs text-muted-foreground">
                  {repo.language && (
                    <span className="flex items-center gap-1">
                      <span
                        className="inline-block h-2 w-2 rounded-full"
                        style={{
                          backgroundColor: getLanguageColor(repo.language),
                        }}
                      />
                      {repo.language}
                    </span>
                  )}
                  <span>{formatRelativeDate(repo.updated_at)}</span>
                </div>
              </div>
              <div className="ml-3 flex items-center gap-1 text-sm text-muted-foreground">
                <Star className="h-3.5 w-3.5" />
                {formatCompactNumber(repo.stars)}
              </div>
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
