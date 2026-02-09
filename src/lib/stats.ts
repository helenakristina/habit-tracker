import { Habit, CompletionRecord, DashboardStats, TrendDataPoint, HeatmapDay } from "@/types";
import { today, getLastNDays, toDateString } from "./dates";
import { getCompletionCountForDate } from "./completions";
import { calculateCurrentStreak } from "./streaks";
import { getActiveHabits } from "./habits";
import { HEATMAP_DAYS } from "./constants";

export function calculateDashboardStats(
  habits: Habit[],
  completions: CompletionRecord
): DashboardStats {
  const active = getActiveHabits(habits);
  const activeIds = active.map((h) => h.id);
  const todayStr = today();

  const completedToday = getCompletionCountForDate(completions, todayStr, activeIds);

  let currentBestStreak = 0;
  for (const habit of active) {
    const streak = calculateCurrentStreak(completions, habit.id);
    if (streak > currentBestStreak) {
      currentBestStreak = streak;
    }
  }

  // Overall completion rate for last 30 days
  const last30 = getLastNDays(30);
  let totalPossible = 0;
  let totalCompleted = 0;

  for (const date of last30) {
    // Only count habits that existed on that date
    const habitsOnDate = active.filter((h) => toDateString(new Date(h.createdAt)) <= date);
    totalPossible += habitsOnDate.length;
    totalCompleted += getCompletionCountForDate(completions, date, habitsOnDate.map((h) => h.id));
  }

  const overallCompletionRate = totalPossible > 0 ? Math.round((totalCompleted / totalPossible) * 100) : 0;

  return {
    totalHabits: active.length,
    completedToday,
    currentBestStreak,
    overallCompletionRate,
  };
}

export function calculateTrendData(
  habits: Habit[],
  completions: CompletionRecord,
  days: number
): TrendDataPoint[] {
  const active = getActiveHabits(habits);
  const dateRange = getLastNDays(days);

  return dateRange.map((date) => {
    const habitsOnDate = active.filter((h) => toDateString(new Date(h.createdAt)) <= date);
    const total = habitsOnDate.length;
    const completed = getCompletionCountForDate(completions, date, habitsOnDate.map((h) => h.id));
    const rate = total > 0 ? Math.round((completed / total) * 100) : 0;

    return { date, completed, total, rate };
  });
}

export function generateHeatmapData(
  habits: Habit[],
  completions: CompletionRecord
): HeatmapDay[] {
  const active = getActiveHabits(habits);
  const activeIds = active.map((h) => h.id);
  const days = getLastNDays(HEATMAP_DAYS);

  return days.map((date) => {
    const total = activeIds.length;
    const count = getCompletionCountForDate(completions, date, activeIds);
    let intensity = 0;
    if (total > 0 && count > 0) {
      const ratio = count / total;
      if (ratio <= 0.25) intensity = 1;
      else if (ratio <= 0.5) intensity = 2;
      else if (ratio <= 0.75) intensity = 3;
      else intensity = 4;
    }

    return { date, count, total, intensity };
  });
}
