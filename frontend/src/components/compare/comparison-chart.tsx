"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Repo } from "@/types/repo";

interface ComparisonChartProps {
  repos: Repo[];
}

const COLORS = [
  "hsl(var(--chart-1))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
];

const METRICS = ["stars", "forks", "open_issues", "watchers"] as const;
const METRIC_LABELS: Record<string, string> = {
  stars: "Stars",
  forks: "Forks",
  open_issues: "Issues",
  watchers: "Watchers",
};

export function ComparisonChart({ repos }: ComparisonChartProps) {
  const chartData = METRICS.map((metric) => {
    const entry: Record<string, string | number> = {
      metric: METRIC_LABELS[metric],
    };
    repos.forEach((r) => {
      entry[r.name] = r[metric];
    });
    return entry;
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base font-medium">Visual Comparison</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis
                dataKey="metric"
                tick={{ fontSize: 12 }}
                className="fill-muted-foreground"
              />
              <YAxis
                tick={{ fontSize: 12 }}
                className="fill-muted-foreground"
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--popover))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                  fontSize: "12px",
                }}
              />
              <Legend />
              {repos.map((repo, i) => (
                <Bar
                  key={repo.id}
                  dataKey={repo.name}
                  fill={COLORS[i % COLORS.length]}
                  radius={[4, 4, 0, 0]}
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
