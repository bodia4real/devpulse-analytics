"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDate } from "@/lib/utils";
import { cn } from "@/lib/utils";
import type { Repo } from "@/types/repo";

interface ComparisonTableProps {
  repos: Repo[];
}

type NumericKey = "stars" | "forks" | "open_issues" | "watchers";

const numericRows: { label: string; key: NumericKey }[] = [
  { label: "Stars", key: "stars" },
  { label: "Forks", key: "forks" },
  { label: "Open Issues", key: "open_issues" },
  { label: "Watchers", key: "watchers" },
];

export function ComparisonTable({ repos }: ComparisonTableProps) {
  const maxValues: Record<NumericKey, number> = {
    stars: 0,
    forks: 0,
    open_issues: 0,
    watchers: 0,
  };

  numericRows.forEach(({ key }) => {
    maxValues[key] = Math.max(...repos.map((r) => r[key]));
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base font-medium">Comparison</CardTitle>
      </CardHeader>
      <CardContent className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b">
              <th className="py-2 pr-4 text-left font-medium text-muted-foreground">
                Metric
              </th>
              {repos.map((r) => (
                <th
                  key={r.id}
                  className="py-2 px-4 text-left font-medium"
                >
                  {r.name}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {numericRows.map(({ label, key }) => (
              <tr key={key} className="border-b last:border-0">
                <td className="py-2 pr-4 text-muted-foreground">{label}</td>
                {repos.map((r) => (
                  <td
                    key={r.id}
                    className={cn(
                      "py-2 px-4",
                      r[key] === maxValues[key] && maxValues[key] > 0
                        ? "font-bold"
                        : ""
                    )}
                  >
                    {r[key].toLocaleString()}
                  </td>
                ))}
              </tr>
            ))}
            <tr className="border-b">
              <td className="py-2 pr-4 text-muted-foreground">Language</td>
              {repos.map((r) => (
                <td key={r.id} className="py-2 px-4">
                  {r.language || "—"}
                </td>
              ))}
            </tr>
            <tr className="border-b">
              <td className="py-2 pr-4 text-muted-foreground">Created</td>
              {repos.map((r) => (
                <td key={r.id} className="py-2 px-4">
                  {formatDate(r.created_at)}
                </td>
              ))}
            </tr>
            <tr>
              <td className="py-2 pr-4 text-muted-foreground">Updated</td>
              {repos.map((r) => (
                <td key={r.id} className="py-2 px-4">
                  {formatDate(r.updated_at)}
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </CardContent>
    </Card>
  );
}
