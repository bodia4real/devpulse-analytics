"use client";

import { useMemo } from "react";
import { StatCard } from "@/components/dashboard/stat-card";
import { computeInsights } from "@/lib/contribution-insights";
import type { ContributionDay } from "@/types/contribution";
import {
  Calendar,
  Flame,
  Trophy,
  BarChart3,
  Star,
  TrendingUp,
  TrendingDown,
  Minus,
} from "lucide-react";

interface ProductivityInsightsProps {
  data: ContributionDay[];
}

export function ProductivityInsights({ data }: ProductivityInsightsProps) {
  const insights = useMemo(() => computeInsights(data), [data]);

  const velocityIcon =
    insights.velocityTrend.direction === "up"
      ? TrendingUp
      : insights.velocityTrend.direction === "down"
        ? TrendingDown
        : Minus;

  const velocityValue = insights.velocityTrend.insufficientData
    ? "—"
    : insights.velocityTrend.direction === "stable"
      ? "Stable"
      : `${insights.velocityTrend.percentChange > 0 ? "+" : ""}${insights.velocityTrend.percentChange}%`;

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <StatCard
        title="Best Day"
        value={insights.bestDayOfWeek}
        icon={Calendar}
        description="Highest average activity"
      />
      <StatCard
        title="Current Streak"
        value={`${insights.currentStreak}d`}
        icon={Flame}
        description="Consecutive active days"
      />
      <StatCard
        title="Longest Streak"
        value={`${insights.longestStreak}d`}
        icon={Trophy}
        description="Best streak in period"
      />
      <StatCard
        title="Weekly Average"
        value={insights.weeklyAverage}
        icon={BarChart3}
        description="Contributions per week"
      />
      <StatCard
        title="Most Active Week"
        value={insights.mostActiveWeekTotal}
        icon={Star}
        description={insights.mostActiveWeek ? `Week of ${insights.mostActiveWeek}` : "No data"}
      />
      <StatCard
        title="Velocity Trend"
        value={velocityValue}
        icon={velocityIcon}
        description="Last 7d vs previous 7d"
      />
    </div>
  );
}
