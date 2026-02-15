"use client";

import { useCallback, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getLanguageColor } from "@/lib/utils";
import {
  Download,
  Loader2,
  Flame,
  Trophy,
  Calendar,
  TrendingUp,
  TrendingDown,
  Minus,
  BarChart3,
  Star,
  GitFork,
  FolderGit2,
  GitCommitHorizontal,
} from "lucide-react";
import type { User } from "@/types/user";
import type { Repo } from "@/types/repo";
import type { ContributionInsights } from "@/lib/contribution-insights";

interface DeveloperProfileProps {
  user: User;
  repos: Repo[];
  totalContributions: number;
  insights: ContributionInsights | null;
  topLanguages: { name: string; count: number }[];
}

// ── Canvas-based PNG export (layout matches website: no overlap) ─
const W = 900;
const H = 560;
const SCALE = 2;

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

async function loadImage(src: string): Promise<HTMLImageElement | null> {
  try {
    const res = await fetch(src);
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => { URL.revokeObjectURL(url); resolve(img); };
      img.onerror = () => { URL.revokeObjectURL(url); resolve(null); };
      img.src = url;
    });
  } catch { return null; }
}

async function exportCard(props: {
  username: string;
  avatarUrl: string | null;
  memberSince: string;
  repos: number;
  stars: number;
  forks: number;
  contributions: number;
  currentStreak: number;
  longestStreak: number;
  weeklyAvg: number;
  bestDay: string;
  velocity: string;
  topLanguages: { name: string; count: number }[];
}): Promise<string> {
  const canvas = document.createElement("canvas");
  canvas.width = W * SCALE;
  canvas.height = H * SCALE;
  const ctx = canvas.getContext("2d")!;
  ctx.scale(SCALE, SCALE);

  // Gradient background
  const grad = ctx.createLinearGradient(0, 0, W, H);
  grad.addColorStop(0, "#0f172a");
  grad.addColorStop(0.5, "#1e1b4b");
  grad.addColorStop(1, "#0f172a");
  roundRect(ctx, 0, 0, W, H, 20);
  ctx.fillStyle = grad;
  ctx.fill();

  // Subtle grid pattern
  ctx.strokeStyle = "rgba(255,255,255,0.03)";
  ctx.lineWidth = 1;
  for (let i = 0; i < W; i += 40) { ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, H); ctx.stroke(); }
  for (let i = 0; i < H; i += 40) { ctx.beginPath(); ctx.moveTo(0, i); ctx.lineTo(W, i); ctx.stroke(); }

  // Accent glow
  const glow = ctx.createRadialGradient(700, 100, 0, 700, 100, 300);
  glow.addColorStop(0, "rgba(99, 102, 241, 0.15)");
  glow.addColorStop(1, "rgba(99, 102, 241, 0)");
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, W, H);

  const LX = 48;
  const MID = W / 2;
  const COL_GAP = 40;
  const LEFT_COL_END = MID - COL_GAP / 2;
  const RX = MID + COL_GAP / 2;

  // ── Avatar ──
  const avatarSize = 72;
  const avatar = props.avatarUrl ? await loadImage(props.avatarUrl) : null;
  ctx.save();
  ctx.beginPath();
  ctx.arc(LX + avatarSize / 2, 52 + avatarSize / 2, avatarSize / 2 + 2, 0, Math.PI * 2);
  ctx.fillStyle = "rgba(99, 102, 241, 0.4)";
  ctx.fill();
  ctx.beginPath();
  ctx.arc(LX + avatarSize / 2, 52 + avatarSize / 2, avatarSize / 2, 0, Math.PI * 2);
  ctx.clip();
  if (avatar) {
    ctx.drawImage(avatar, LX, 52, avatarSize, avatarSize);
  } else {
    ctx.fillStyle = "#334155";
    ctx.fillRect(LX, 52, avatarSize, avatarSize);
    ctx.fillStyle = "#e2e8f0";
    ctx.font = "bold 32px system-ui, -apple-system, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(props.username[0].toUpperCase(), LX + avatarSize / 2, 52 + avatarSize / 2);
  }
  ctx.restore();

  // ── Name ──
  ctx.fillStyle = "#f8fafc";
  ctx.font = "bold 28px system-ui, -apple-system, sans-serif";
  ctx.textAlign = "left";
  ctx.textBaseline = "top";
  ctx.fillText(`@${props.username}`, LX + avatarSize + 18, 56);

  ctx.fillStyle = "#94a3b8";
  ctx.font = "14px system-ui, -apple-system, sans-serif";
  ctx.fillText(`Member since ${props.memberSince}`, LX + avatarSize + 18, 90);

  // ── Divider ──
  ctx.strokeStyle = "rgba(255,255,255,0.08)";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(LX, 148);
  ctx.lineTo(W - LX, 148);
  ctx.stroke();

  // ── Stats Row (even spacing, no overlap) ──
  const statsY = 170;
  const stats = [
    { icon: "📦", value: String(props.repos), label: "Repos" },
    { icon: "⭐", value: String(props.stars), label: "Stars" },
    { icon: "🍴", value: String(props.forks), label: "Forks" },
    { icon: "📊", value: props.contributions.toLocaleString(), label: "Contributions" },
    { icon: "🔥", value: `${props.currentStreak}d`, label: "Streak" },
    { icon: "🏆", value: `${props.longestStreak}d`, label: "Best Streak" },
  ];

  const statsTotalW = W - LX * 2;
  const statGap = 12;
  const statW = (statsTotalW - statGap * (stats.length - 1)) / stats.length;
  stats.forEach((s, i) => {
    const cx = LX + i * (statW + statGap) + statW / 2;
    ctx.font = "14px system-ui";
    ctx.textAlign = "center";
    ctx.fillText(s.icon, cx, statsY);
    ctx.fillStyle = "#f8fafc";
    ctx.font = "bold 20px system-ui, -apple-system, sans-serif";
    ctx.fillText(s.value, cx, statsY + 22);
    ctx.fillStyle = "#64748b";
    ctx.font = "11px system-ui, -apple-system, sans-serif";
    ctx.fillText(s.label, cx, statsY + 46);
    ctx.fillStyle = "#f8fafc";
  });

  // ── Left column: Languages (stays within LEFT_COL_END, no overlap) ──
  const colY = 250;
  const langNameW = 88;
  const barX = LX + langNameW;
  const countW = 28;
  const barMaxW = Math.max(60, LEFT_COL_END - barX - countW - 8);

  ctx.fillStyle = "#94a3b8";
  ctx.font = "bold 12px system-ui, -apple-system, sans-serif";
  ctx.textAlign = "left";
  ctx.fillText("TOP LANGUAGES", LX, colY);

  if (props.topLanguages.length > 0) {
    const maxCount = props.topLanguages[0].count;
    const langRowH = 34;
    props.topLanguages.forEach((lang, i) => {
      const y = colY + 24 + i * langRowH;
      ctx.fillStyle = "#e2e8f0";
      ctx.font = "13px system-ui, -apple-system, sans-serif";
      ctx.textAlign = "left";
      ctx.fillText(lang.name, LX, y + 2);

      roundRect(ctx, barX, y - 2, barMaxW, 12, 6);
      ctx.fillStyle = "#1e293b";
      ctx.fill();

      const fillW = Math.max(12, (lang.count / maxCount) * barMaxW);
      roundRect(ctx, barX, y - 2, fillW, 12, 6);
      ctx.fillStyle = getLanguageColor(lang.name);
      ctx.fill();

      ctx.fillStyle = "#94a3b8";
      ctx.font = "11px system-ui, -apple-system, sans-serif";
      ctx.textAlign = "right";
      ctx.fillText(String(lang.count), barX + barMaxW + 4, y + 2);
    });
  }

  // ── Right column: Activity Highlights (clear vertical spacing) ──
  ctx.fillStyle = "#94a3b8";
  ctx.font = "bold 12px system-ui, -apple-system, sans-serif";
  ctx.textAlign = "left";
  ctx.fillText("ACTIVITY HIGHLIGHTS", RX, colY);

  const highlights = [
    { label: "Best Day", value: props.bestDay },
    { label: "Weekly Average", value: String(props.weeklyAvg) },
    { label: "Velocity (7d)", value: props.velocity },
  ];

  const highlightRowH = 40;
  highlights.forEach((h, i) => {
    const y = colY + 24 + i * highlightRowH;
    ctx.fillStyle = "#94a3b8";
    ctx.font = "12px system-ui, -apple-system, sans-serif";
    ctx.textAlign = "left";
    ctx.fillText(h.label, RX, y);
    ctx.fillStyle = "#f8fafc";
    ctx.font = "bold 16px system-ui, -apple-system, sans-serif";
    ctx.fillText(h.value, RX, y + 20);
  });

  // ── Footer (clear gap above) ──
  const footerY = H - 52;
  ctx.strokeStyle = "rgba(255,255,255,0.08)";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(LX, footerY);
  ctx.lineTo(W - LX, footerY);
  ctx.stroke();

  ctx.fillStyle = "#64748b";
  ctx.font = "12px system-ui, -apple-system, sans-serif";
  ctx.textAlign = "left";
  ctx.fillText("⚡ DevPulse Analytics", LX, H - 24);
  ctx.textAlign = "right";
  ctx.fillText("All-time stats", W - LX, H - 24);

  return canvas.toDataURL("image/png");
}

// ── React Component ────────────────────────────────────────────
export function DeveloperProfile({
  user,
  repos,
  totalContributions,
  insights,
  topLanguages,
}: DeveloperProfileProps) {
  const [exporting, setExporting] = useState(false);

  const totalStars = repos.reduce((sum, r) => sum + r.stars, 0);
  const totalForks = repos.reduce((sum, r) => sum + r.forks, 0);
  const memberSince = new Date(user.created_at).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });
  const maxLangCount = topLanguages[0]?.count ?? 1;

  const currentStreak = insights?.currentStreak ?? 0;
  const longestStreak = insights?.longestStreak ?? 0;
  const bestDay = insights?.bestDayOfWeek ?? "—";
  const weeklyAvg = insights?.weeklyAverage ?? 0;
  const velocityDir = insights?.velocityTrend.direction ?? "stable";
  const velocityPct = insights?.velocityTrend.percentChange ?? 0;
  const velocityInsufficient = insights?.velocityTrend.insufficientData ?? false;
  const velocityLabel = velocityInsufficient
    ? "—"
    : velocityDir === "stable"
      ? "Stable"
      : `${velocityPct > 0 ? "+" : ""}${velocityPct}%`;

  const VelocityIcon = velocityInsufficient ? Minus : velocityDir === "up" ? TrendingUp : velocityDir === "down" ? TrendingDown : Minus;
  const velocityColor = velocityDir === "up" ? "text-emerald-500" : velocityDir === "down" ? "text-red-500" : "text-muted-foreground";

  const handleExport = useCallback(async () => {
    setExporting(true);
    try {
      const dataUrl = await exportCard({
        username: user.username,
        avatarUrl: user.avatar_url,
        memberSince,
        repos: repos.length,
        stars: totalStars,
        forks: totalForks,
        contributions: totalContributions,
        currentStreak,
        longestStreak,
        weeklyAvg,
        bestDay,
        velocity: velocityLabel,
        topLanguages,
      });
      const link = document.createElement("a");
      link.download = `${user.username}-devpulse.png`;
      link.href = dataUrl;
      link.click();
    } finally {
      setExporting(false);
    }
  }, [user, repos, totalContributions, totalStars, totalForks, currentStreak, longestStreak, weeklyAvg, bestDay, velocityLabel, topLanguages, memberSince]);

  return (
    <div className="space-y-6">
      {/* ── Hero ── */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 p-8 text-white">
        {/* Grid overlay */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: "linear-gradient(rgba(255,255,255,.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.5) 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />
        {/* Glow */}
        <div className="pointer-events-none absolute right-0 top-0 h-64 w-64 rounded-full bg-indigo-500/20 blur-[100px]" />

        <div className="relative flex flex-col items-center gap-4 sm:flex-row sm:items-start sm:gap-6">
          {user.avatar_url ? (
            <img
              src={user.avatar_url}
              alt={user.username}
              className="h-20 w-20 rounded-full ring-2 ring-indigo-400/40 sm:h-24 sm:w-24"
            />
          ) : (
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-slate-800 ring-2 ring-indigo-400/40 text-3xl font-bold sm:h-24 sm:w-24">
              {user.username[0].toUpperCase()}
            </div>
          )}
          <div className="text-center sm:text-left">
            <h1 className="text-2xl font-bold sm:text-3xl">@{user.username}</h1>
            <p className="mt-1 text-sm text-slate-400">Member since {memberSince}</p>
          </div>
        </div>

        {/* Stats inside hero */}
        <div className="relative mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          {[
            { icon: FolderGit2, value: repos.length, label: "Repos" },
            { icon: Star, value: totalStars, label: "Stars" },
            { icon: GitFork, value: totalForks, label: "Forks" },
            { icon: GitCommitHorizontal, value: totalContributions.toLocaleString(), label: "Contributions" },
            { icon: Flame, value: `${currentStreak}d`, label: "Streak" },
            { icon: Trophy, value: `${longestStreak}d`, label: "Best Streak" },
          ].map((s) => (
            <div
              key={s.label}
              className="rounded-xl bg-white/5 px-4 py-3 text-center backdrop-blur-sm"
            >
              <s.icon className="mx-auto mb-1 h-4 w-4 text-indigo-300" />
              <p className="text-lg font-bold">{s.value}</p>
              <p className="text-[11px] text-slate-400">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Two-column details ── */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* Languages */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-medium">Top Languages</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {topLanguages.length === 0 ? (
              <p className="text-sm text-muted-foreground">No language data</p>
            ) : (
              topLanguages.map((lang) => (
                <div key={lang.name} className="flex items-center gap-3">
                  <span
                    className="h-2.5 w-2.5 shrink-0 rounded-full"
                    style={{ backgroundColor: getLanguageColor(lang.name) }}
                  />
                  <span className="w-24 truncate text-sm">{lang.name}</span>
                  <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-2 rounded-full transition-all"
                      style={{
                        width: `${(lang.count / maxLangCount) * 100}%`,
                        backgroundColor: getLanguageColor(lang.name),
                      }}
                    />
                  </div>
                  <span className="w-8 text-right text-xs text-muted-foreground">
                    {lang.count}
                  </span>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Activity highlights */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-medium">Activity Highlights</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" />
                Best Day
              </div>
              <span className="font-semibold">{bestDay}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <BarChart3 className="h-4 w-4" />
                Weekly Average
              </div>
              <span className="font-semibold">{weeklyAvg} contributions</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <VelocityIcon className={`h-4 w-4 ${velocityColor}`} />
                Velocity (7d)
              </div>
              <span className={`font-semibold ${velocityColor}`}>{velocityLabel}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Star className="h-4 w-4" />
                Most Active Week
              </div>
              <span className="font-semibold">
                {insights?.mostActiveWeek ? `${insights.mostActiveWeek} (${insights.mostActiveWeekTotal})` : "—"}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ── Export Card Preview ── */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base font-medium">Shareable Card</CardTitle>
          <Button onClick={handleExport} disabled={exporting} size="sm" className="gap-2">
            {exporting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Download className="h-4 w-4" />
            )}
            Export as PNG
          </Button>
        </CardHeader>
        <CardContent>
          {/* Live preview of the export card (CSS recreation) */}
          <div className="relative mx-auto max-w-[900px] overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 p-8 text-white">
            <div
              className="pointer-events-none absolute inset-0 opacity-[0.03]"
              style={{
                backgroundImage: "linear-gradient(rgba(255,255,255,.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.5) 1px, transparent 1px)",
                backgroundSize: "40px 40px",
              }}
            />
            <div className="pointer-events-none absolute right-0 top-0 h-64 w-64 rounded-full bg-indigo-500/20 blur-[100px]" />

            <div className="relative">
              {/* Header */}
              <div className="flex items-center gap-4">
                {user.avatar_url ? (
                  <img src={user.avatar_url} alt="" className="h-16 w-16 rounded-full ring-2 ring-indigo-400/40" />
                ) : (
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-800 ring-2 ring-indigo-400/40 text-2xl font-bold">
                    {user.username[0].toUpperCase()}
                  </div>
                )}
                <div>
                  <h3 className="text-xl font-bold">@{user.username}</h3>
                  <p className="text-xs text-slate-400">Member since {memberSince}</p>
                </div>
              </div>

              <div className="my-5 border-t border-white/10" />

              {/* Stats */}
              <div className="grid grid-cols-3 gap-3 sm:grid-cols-6">
                {[
                  { v: String(repos.length), l: "Repos" },
                  { v: String(totalStars), l: "Stars" },
                  { v: String(totalForks), l: "Forks" },
                  { v: totalContributions.toLocaleString(), l: "Contributions" },
                  { v: `${currentStreak}d`, l: "Streak" },
                  { v: `${longestStreak}d`, l: "Best Streak" },
                ].map((s) => (
                  <div key={s.l} className="text-center">
                    <p className="text-lg font-bold">{s.v}</p>
                    <p className="text-[10px] text-slate-400">{s.l}</p>
                  </div>
                ))}
              </div>

              <div className="mt-5 grid grid-cols-2 gap-6">
                {/* Languages */}
                <div>
                  <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                    Top Languages
                  </p>
                  {topLanguages.map((lang) => (
                    <div key={lang.name} className="mb-2 flex items-center gap-2">
                      <span className="w-16 truncate text-xs">{lang.name}</span>
                      <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-800">
                        <div
                          className="h-2 rounded-full"
                          style={{
                            width: `${(lang.count / maxLangCount) * 100}%`,
                            backgroundColor: getLanguageColor(lang.name),
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
                {/* Highlights */}
                <div>
                  <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                    Highlights
                  </p>
                  <div className="space-y-1.5 text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Best Day</span>
                      <span className="font-medium">{bestDay}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Weekly Avg</span>
                      <span className="font-medium">{weeklyAvg}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Velocity</span>
                      <span className="font-medium">{velocityLabel}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-5 flex items-center justify-between border-t border-white/10 pt-3 text-[10px] text-slate-500">
                <span>⚡ DevPulse Analytics</span>
                <span>All-time stats</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
