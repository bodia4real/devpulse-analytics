"use client";

import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { computeInsights } from "@/lib/contribution-insights";
import type { ContributionDay } from "@/types/contribution";
import { CalendarDays } from "lucide-react";

interface WeeklyDigestProps {
  data: ContributionDay[];
  className?: string;
}

export function WeeklyDigest({ data, className }: WeeklyDigestProps) {
  const insights = useMemo(() => computeInsights(data), [data]);

  const changeLabel =
    insights.thisWeekChange > 0
      ? `+${insights.thisWeekChange}%`
      : insights.thisWeekChange < 0
        ? `${insights.thisWeekChange}%`
        : "0%";

  const changeVariant: "default" | "secondary" | "destructive" =
    insights.thisWeekChange > 0
      ? "default"
      : insights.thisWeekChange < 0
        ? "destructive"
        : "secondary";

  const { commits, prs, issues, reviews } = insights.thisWeekBreakdown;
  const parts: string[] = [];
  if (commits > 0) parts.push(`${commits} commit${commits !== 1 ? "s" : ""}`);
  if (prs > 0) parts.push(`${prs} PR${prs !== 1 ? "s" : ""}`);
  if (issues > 0) parts.push(`${issues} issue${issues !== 1 ? "s" : ""}`);
  if (reviews > 0) parts.push(`${reviews} review${reviews !== 1 ? "s" : ""}`);

  return (
    <Card className={className}>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-base font-medium">This Week</CardTitle>
        <CalendarDays className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-bold">{insights.thisWeekTotal}</span>
          <span className="text-sm text-muted-foreground">contributions</span>
          <Badge variant={changeVariant} className="ml-auto text-xs">
            {changeLabel} vs last week
          </Badge>
        </div>
        {insights.thisWeekMostActiveDay && (
          <p className="text-sm text-muted-foreground">
            Most active:{" "}
            <span className="font-medium text-foreground">
              {insights.thisWeekMostActiveDay.day}
            </span>{" "}
            ({insights.thisWeekMostActiveDay.total} contributions)
          </p>
        )}
        {parts.length > 0 && (
          <p className="text-xs text-muted-foreground">{parts.join(" · ")}</p>
        )}
      </CardContent>
    </Card>
  );
}
