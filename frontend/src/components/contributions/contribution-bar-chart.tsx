"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { ContributionDay } from "@/types/contribution";

interface ContributionBarChartProps {
  data: ContributionDay[];
  className?: string;
}

function formatLabel(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

export function ContributionBarChart({
  data,
  className,
}: ContributionBarChartProps) {
  const chartData = data.map((day) => ({
    date: day.date,
    label: formatLabel(day.date),
    Commits: day.commit_count,
    PRs: day.pr_count,
    Issues: day.issue_count,
    Reviews: day.review_count,
  }));

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="text-base font-medium">
          Activity Breakdown
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid
                strokeDasharray="3 3"
                className="stroke-border"
                vertical={false}
              />
              <XAxis
                dataKey="label"
                className="text-xs fill-muted-foreground"
                tickLine={false}
                axisLine={false}
                interval="preserveStartEnd"
              />
              <YAxis
                className="text-xs fill-muted-foreground"
                tickLine={false}
                axisLine={false}
                width={30}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "var(--popover)",
                  border: "1px solid var(--border)",
                  borderRadius: "8px",
                  fontSize: "12px",
                }}
                labelStyle={{ color: "var(--foreground)" }}
              />
              <Legend
                wrapperStyle={{ fontSize: "12px" }}
                iconType="circle"
                iconSize={8}
              />
              <Bar
                dataKey="Commits"
                stackId="a"
                fill="#2563eb"
                radius={[0, 0, 0, 0]}
              />
              <Bar
                dataKey="PRs"
                stackId="a"
                fill="#16a34a"
                radius={[0, 0, 0, 0]}
              />
              <Bar
                dataKey="Issues"
                stackId="a"
                fill="#ea580c"
                radius={[0, 0, 0, 0]}
              />
              <Bar
                dataKey="Reviews"
                stackId="a"
                fill="#9333ea"
                radius={[2, 2, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
