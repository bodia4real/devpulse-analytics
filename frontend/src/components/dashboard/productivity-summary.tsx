"use client";

import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { computeInsights } from "@/lib/contribution-insights";
import type { ContributionDay } from "@/types/contribution";
import { Flame, TrendingUp, TrendingDown, Minus, Zap } from "lucide-react";

interface ProductivitySummaryProps {
  data: ContributionDay[];
  className?: string;
}

export function ProductivitySummary({
  data,
  className,
}: ProductivitySummaryProps) {
  const insights = useMemo(() => computeInsights(data), [data]);

  const VelocityIcon =
    insights.velocityTrend.direction === "up"
      ? TrendingUp
      : insights.velocityTrend.direction === "down"
        ? TrendingDown
        : Minus;

  const velocityColor =
    insights.velocityTrend.direction === "up"
      ? "text-emerald-500"
      : insights.velocityTrend.direction === "down"
        ? "text-red-500"
        : "text-muted-foreground";

  const velocityLabel = insights.velocityTrend.insufficientData
    ? "—"
    : insights.velocityTrend.direction === "stable"
      ? "Stable"
      : `${insights.velocityTrend.percentChange > 0 ? "+" : ""}${insights.velocityTrend.percentChange}%`;

  return (
    <Card className={className}>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-base font-medium">Productivity</CardTitle>
        <Zap className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-3">
          <Flame className="h-5 w-5 text-orange-500" />
          <div>
            <p className="text-2xl font-bold">{insights.currentStreak}d</p>
            <p className="text-xs text-muted-foreground">Current streak</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <VelocityIcon className={`h-5 w-5 ${velocityColor}`} />
          <div>
            <p className="text-2xl font-bold">{velocityLabel}</p>
            <p className="text-xs text-muted-foreground">
              Velocity (7d vs prior 7d)
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
