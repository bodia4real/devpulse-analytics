"use client";

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getLanguageColor } from "@/lib/utils";
import type { Repo } from "@/types/repo";

interface LanguageChartProps {
  repos: Repo[];
  className?: string;
}

interface LanguageData {
  name: string;
  value: number;
  color: string;
}

function CustomTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: Array<{ payload: LanguageData }>;
}) {
  if (!active || !payload?.length) return null;
  const data = payload[0].payload;

  return (
    <div className="rounded-lg border bg-popover px-3 py-2 text-sm shadow-md">
      <div className="flex items-center gap-2">
        <div
          className="h-2.5 w-2.5 rounded-full"
          style={{ backgroundColor: data.color }}
        />
        <span className="font-medium">{data.name}</span>
      </div>
      <p className="mt-0.5 text-muted-foreground">
        {data.value} {data.value === 1 ? "repo" : "repos"}
      </p>
    </div>
  );
}

export function LanguageChart({ repos, className }: LanguageChartProps) {
  const languageCounts = repos.reduce<Record<string, number>>((acc, repo) => {
    if (repo.language) {
      acc[repo.language] = (acc[repo.language] || 0) + 1;
    }
    return acc;
  }, {});

  const chartData: LanguageData[] = Object.entries(languageCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([name, value]) => ({
      name,
      value,
      color: getLanguageColor(name),
    }));

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="text-base font-medium">Languages</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-6">
          <div className="h-48 w-48 flex-shrink-0">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={2}
                  dataKey="value"
                  strokeWidth={0}
                >
                  {chartData.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-2">
            {chartData.map((lang) => (
              <div key={lang.name} className="flex items-center gap-2 text-sm">
                <div
                  className="h-2.5 w-2.5 rounded-full flex-shrink-0"
                  style={{ backgroundColor: lang.color }}
                />
                <span className="text-muted-foreground">{lang.name}</span>
                <span className="ml-auto font-medium">{lang.value}</span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
