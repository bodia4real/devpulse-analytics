"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { ContributionDay } from "@/types/contribution";

interface ContributionLineChartProps {
  data: ContributionDay[];
  className?: string;
}

function formatLabel(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

export function ContributionLineChart({
  data,
  className,
}: ContributionLineChartProps) {
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
          Commits Over Time
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
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
                  backgroundColor: "hsl(var(--popover))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                  fontSize: "12px",
                }}
                labelStyle={{ color: "hsl(var(--foreground))" }}
              />
              <Legend
                wrapperStyle={{ fontSize: "12px" }}
                iconType="circle"
                iconSize={8}
              />
              <Line
                type="monotone"
                dataKey="Commits"
                stroke="hsl(var(--chart-1))"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4, strokeWidth: 0 }}
              />
              <Line
                type="monotone"
                dataKey="PRs"
                stroke="hsl(var(--chart-2))"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4, strokeWidth: 0 }}
              />
              <Line
                type="monotone"
                dataKey="Issues"
                stroke="hsl(var(--chart-3))"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4, strokeWidth: 0 }}
              />
              <Line
                type="monotone"
                dataKey="Reviews"
                stroke="hsl(var(--chart-4))"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4, strokeWidth: 0 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
