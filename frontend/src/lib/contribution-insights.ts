import type { ContributionDay } from "@/types/contribution";

export interface ContributionInsights {
  bestDayOfWeek: string;
  currentStreak: number;
  longestStreak: number;
  weeklyAverage: number;
  mostActiveWeek: string;
  mostActiveWeekTotal: number;
  velocityTrend: {
    percentChange: number;
    direction: "up" | "down" | "stable";
    insufficientData?: boolean;
  };
  thisWeekTotal: number;
  lastWeekTotal: number;
  thisWeekChange: number;
  thisWeekMostActiveDay: { day: string; total: number } | null;
  thisWeekBreakdown: {
    commits: number;
    prs: number;
    issues: number;
    reviews: number;
  };
}

const DAY_NAMES = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

function totalForDay(d: ContributionDay): number {
  return (
    Number(d.commit_count) +
    Number(d.pr_count) +
    Number(d.issue_count) +
    Number(d.review_count)
  );
}

/** Normalize date to YYYY-MM-DD (handles "2025-02-15" and "2025-02-15T00:00:00.000Z") */
function toDateStr(val: string | Date): string {
  if (typeof val === "string") return val.slice(0, 10);
  return val.toISOString().slice(0, 10);
}

/** Today's date in local timezone as YYYY-MM-DD */
function getTodayLocal(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function getWeekKey(dateStr: string): string {
  const d = new Date(dateStr);
  const jan1 = new Date(d.getFullYear(), 0, 1);
  const daysSinceJan1 = Math.floor(
    (d.getTime() - jan1.getTime()) / 86_400_000
  );
  const weekNum = Math.ceil((daysSinceJan1 + jan1.getDay() + 1) / 7);
  return `${d.getFullYear()}-W${String(weekNum).padStart(2, "0")}`;
}

function getMondayOfWeek(dateStr: string): string {
  const d = new Date(dateStr);
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  const monday = new Date(d);
  monday.setDate(monday.getDate() + diff);
  return monday.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export function computeInsights(data: ContributionDay[]): ContributionInsights {
  const sorted = [...data].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  // Best day of week
  const dayTotals = Array(7).fill(0);
  const dayCounts = Array(7).fill(0);
  sorted.forEach((d) => {
    const dow = new Date(d.date).getDay();
    dayTotals[dow] += totalForDay(d);
    dayCounts[dow]++;
  });
  const dayAverages = dayTotals.map((total, i) =>
    dayCounts[i] > 0 ? total / dayCounts[i] : 0
  );
  const bestDayIndex = dayAverages.indexOf(Math.max(...dayAverages));
  const bestDayOfWeek = DAY_NAMES[bestDayIndex];

  // Streaks
  let currentStreak = 0;
  let longestStreak = 0;
  let tempStreak = 0;

  for (let i = 0; i < sorted.length; i++) {
    if (totalForDay(sorted[i]) > 0) {
      tempStreak++;
      longestStreak = Math.max(longestStreak, tempStreak);
    } else {
      tempStreak = 0;
    }
  }

  // Current streak: count backwards from the last day with activity.
  // If the most recent day is today and has 0 contributions, skip it
  // (the day isn't over yet — don't break the streak).
  const todayStr = getTodayLocal();
  let streakStart = sorted.length - 1;
  if (streakStart >= 0) {
    const lastDate = toDateStr(sorted[streakStart].date);
    if (lastDate === todayStr && totalForDay(sorted[streakStart]) === 0) {
      streakStart--;
    }
  }
  for (let i = streakStart; i >= 0; i--) {
    if (totalForDay(sorted[i]) > 0) {
      currentStreak++;
    } else {
      break;
    }
  }

  // Weekly aggregates
  const weeklyMap = new Map<string, { total: number; firstDate: string }>();
  sorted.forEach((d) => {
    const wk = getWeekKey(d.date);
    const existing = weeklyMap.get(wk);
    if (existing) {
      existing.total += totalForDay(d);
    } else {
      weeklyMap.set(wk, { total: totalForDay(d), firstDate: d.date });
    }
  });

  const weekEntries = [...weeklyMap.entries()];
  const weeklyAverage =
    weekEntries.length > 0
      ? Math.round(
          weekEntries.reduce((sum, [, w]) => sum + w.total, 0) /
            weekEntries.length
        )
      : 0;

  let mostActiveWeek = "";
  let mostActiveWeekTotal = 0;
  weekEntries.forEach(([, w]) => {
    if (w.total > mostActiveWeekTotal) {
      mostActiveWeekTotal = w.total;
      mostActiveWeek = getMondayOfWeek(w.firstDate);
    }
  });

  // Velocity trend: last 7 days vs previous 7 days (need at least 14 days of data)
  const last7 = sorted.slice(-7);
  const prev7 = sorted.slice(-14, -7);
  const last7Total = last7.reduce((s, d) => s + totalForDay(d), 0);
  const prev7Total = prev7.reduce((s, d) => s + totalForDay(d), 0);
  let percentChange = 0;
  let direction: "up" | "down" | "stable" = "stable";
  const velocityInsufficientData = sorted.length < 14;
  if (!velocityInsufficientData) {
    if (prev7Total > 0) {
      percentChange = Math.round(
        ((last7Total - prev7Total) / prev7Total) * 100
      );
      direction = percentChange > 0 ? "up" : percentChange < 0 ? "down" : "stable";
    } else if (last7Total > 0) {
      percentChange = 100;
      direction = "up";
    }
  }

  // This week / last week (calendar weeks, Mon–Sun)
  const today = new Date();
  const currentDow = today.getDay();
  const mondayOffset = currentDow === 0 ? -6 : 1 - currentDow;
  const thisMonday = new Date(today);
  thisMonday.setHours(0, 0, 0, 0);
  thisMonday.setDate(today.getDate() + mondayOffset);

  const lastMonday = new Date(thisMonday);
  lastMonday.setDate(thisMonday.getDate() - 7);
  const lastSunday = new Date(thisMonday);
  lastSunday.setDate(thisMonday.getDate() - 1);

  let thisWeekTotal = 0;
  let lastWeekTotal = 0;
  const thisWeekBreakdown = { commits: 0, prs: 0, issues: 0, reviews: 0 };
  let thisWeekMostActiveDay: { day: string; total: number } | null = null;

  sorted.forEach((d) => {
    const date = new Date(d.date);
    date.setHours(0, 0, 0, 0);
    const t = totalForDay(d);

    if (date >= thisMonday && date <= today) {
      thisWeekTotal += t;
      thisWeekBreakdown.commits += d.commit_count;
      thisWeekBreakdown.prs += d.pr_count;
      thisWeekBreakdown.issues += d.issue_count;
      thisWeekBreakdown.reviews += d.review_count;
      if (!thisWeekMostActiveDay || t > thisWeekMostActiveDay.total) {
        thisWeekMostActiveDay = {
          day: DAY_NAMES[date.getDay()],
          total: t,
        };
      }
    } else if (date >= lastMonday && date <= lastSunday) {
      lastWeekTotal += t;
    }
  });

  const thisWeekChange =
    lastWeekTotal > 0
      ? Math.round(((thisWeekTotal - lastWeekTotal) / lastWeekTotal) * 100)
      : thisWeekTotal > 0
        ? 100
        : 0;

  return {
    bestDayOfWeek,
    currentStreak,
    longestStreak,
    weeklyAverage,
    mostActiveWeek,
    mostActiveWeekTotal,
    velocityTrend: {
      percentChange,
      direction,
      insufficientData: velocityInsufficientData,
    },
    thisWeekTotal,
    lastWeekTotal,
    thisWeekChange,
    thisWeekMostActiveDay,
    thisWeekBreakdown,
  };
}
