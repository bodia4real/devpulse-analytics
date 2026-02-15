"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { ContributionDay } from "@/types/contribution";

interface ContributionChartProps {
  data: ContributionDay[];
  className?: string;
}

interface ChartDataPoint {
  date: string;
  label: string;
  total: number;
  commits: number;
  prs: number;
  issues: number;
  reviews: number;
}

function formatDateLabel(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function CustomTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: Array<{ payload: ChartDataPoint }>;
}) {
  if (!active || !payload?.length) return null;
  const data = payload[0].payload;

  return (
    <div className="rounded-lg border bg-popover px-3 py-2 text-sm shadow-md">
      <p className="font-medium">{data.label}</p>
      <div className="mt-1 space-y-0.5 text-muted-foreground">
        <p>Commits: {data.commits}</p>
        <p>PRs: {data.prs}</p>
        <p>Issues: {data.issues}</p>
        <p>Reviews: {data.reviews}</p>
      </div>
      <p className="mt-1 font-medium">Total: {data.total}</p>
    </div>
  );
}

export function ContributionChart({ data, className }: ContributionChartProps) {
  const chartData: ChartDataPoint[] = data.map((day) => ({
    date: day.date,
    label: formatDateLabel(day.date),
    total:
      day.commit_count + day.pr_count + day.issue_count + day.review_count,
    commits: day.commit_count,
    prs: day.pr_count,
    issues: day.issue_count,
    reviews: day.review_count,
  }));

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="text-base font-medium">
          Contribution Activity
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="gradientTotal" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="0%"
                    stopColor="hsl(var(--chart-1))"
                    stopOpacity={0.3}
                  />
                  <stop
                    offset="100%"
                    stopColor="hsl(var(--chart-1))"
                    stopOpacity={0}
                  />
                </linearGradient>
              </defs>
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
                content={<CustomTooltip />}
                cursor={{ stroke: "hsl(var(--muted-foreground))", strokeWidth: 1 }}
              />
              <Area
                type="monotone"
                dataKey="total"
                stroke="hsl(var(--chart-1))"
                strokeWidth={2}
                fill="url(#gradientTotal)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
