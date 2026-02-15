"use client";

import { useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { getLanguageColor } from "@/lib/utils";
import { Download, Activity } from "lucide-react";
import type { User } from "@/types/user";
import type { Repo } from "@/types/repo";

interface DeveloperCardProps {
  user: User;
  repos: Repo[];
  totalContributions: number;
  currentStreak: number;
  topLanguages: { name: string; count: number }[];
}

export function DeveloperCard({
  user,
  repos,
  totalContributions,
  currentStreak,
  topLanguages,
}: DeveloperCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);

  const handleExport = useCallback(async () => {
    if (!cardRef.current) return;
    const html2canvas = (await import("html2canvas")).default;
    const canvas = await html2canvas(cardRef.current, {
      scale: 2,
      backgroundColor: "#0f172a",
      useCORS: true,
    });
    const link = document.createElement("a");
    link.download = `${user.username}-devpulse.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  }, [user.username]);

  const totalStars = repos.reduce((sum, r) => sum + r.stars, 0);
  const memberSince = new Date(user.created_at).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  const maxLangCount = topLanguages[0]?.count ?? 1;

  return (
    <div className="space-y-4">
      <div
        ref={cardRef}
        className="mx-auto w-full max-w-[600px] rounded-2xl bg-slate-900 p-8 text-white"
        style={{ minHeight: 340 }}
      >
        {/* Header */}
        <div className="flex items-center gap-4">
          {user.avatar_url ? (
            <img
              src={user.avatar_url}
              alt={user.username}
              className="h-16 w-16 rounded-full border-2 border-slate-700"
              crossOrigin="anonymous"
            />
          ) : (
            <div className="flex h-16 w-16 items-center justify-center rounded-full border-2 border-slate-700 bg-slate-800 text-2xl font-bold">
              {user.username[0].toUpperCase()}
            </div>
          )}
          <div>
            <h2 className="text-xl font-bold">@{user.username}</h2>
            <p className="text-sm text-slate-400">Member since {memberSince}</p>
          </div>
        </div>

        {/* Stats */}
        <div className="mt-6 grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-2xl font-bold">{repos.length}</p>
            <p className="text-xs text-slate-400">Repos</p>
          </div>
          <div>
            <p className="text-2xl font-bold">{totalStars}</p>
            <p className="text-xs text-slate-400">Stars</p>
          </div>
          <div>
            <p className="text-2xl font-bold">{totalContributions.toLocaleString()}</p>
            <p className="text-xs text-slate-400">Contributions</p>
          </div>
        </div>

        {/* Languages */}
        {topLanguages.length > 0 && (
          <div className="mt-6 space-y-2">
            <p className="text-xs font-medium text-slate-400">Top Languages</p>
            {topLanguages.map((lang) => (
              <div key={lang.name} className="flex items-center gap-2">
                <span className="w-20 truncate text-xs">{lang.name}</span>
                <div className="flex-1 overflow-hidden rounded-full bg-slate-800 h-2">
                  <div
                    className="h-2 rounded-full"
                    style={{
                      width: `${(lang.count / maxLangCount) * 100}%`,
                      backgroundColor: getLanguageColor(lang.name),
                    }}
                  />
                </div>
                <span className="w-6 text-right text-xs text-slate-400">
                  {lang.count}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Footer */}
        <div className="mt-6 flex items-center justify-between border-t border-slate-700 pt-4">
          <div className="flex items-center gap-1 text-xs text-slate-400">
            <Activity className="h-3 w-3" />
            <span>DevPulse Analytics</span>
          </div>
          {currentStreak > 0 && (
            <p className="text-xs text-slate-400">
              {currentStreak}d streak
            </p>
          )}
        </div>
      </div>

      <div className="flex justify-center">
        <Button onClick={handleExport} className="gap-2">
          <Download className="h-4 w-4" />
          Export as PNG
        </Button>
      </div>
    </div>
  );
}
