import { CompletionRecord, DateString, HabitId, StreakInfo } from "@/types";
import { toDateString } from "./dates";
import { isHabitCompleted } from "./completions";
import { subDays } from "date-fns";

export function calculateCurrentStreak(
  completions: CompletionRecord,
  habitId: HabitId,
  fromDate?: Date
): number {
  const base = fromDate ?? new Date();
  let streak = 0;
  let current = base;

  // Check today first
  const todayStr = toDateString(current);
  if (!isHabitCompleted(completions, habitId, todayStr)) {
    // If today isn't completed, start from yesterday
    current = subDays(current, 1);
  }

  while (true) {
    const dateStr = toDateString(current);
    if (isHabitCompleted(completions, habitId, dateStr)) {
      streak++;
      current = subDays(current, 1);
    } else {
      break;
    }
  }

  return streak;
}

export function calculateLongestStreak(
  completions: CompletionRecord,
  habitId: HabitId
): { length: number; start: DateString | null; end: DateString | null } {
  // Collect all dates where this habit was completed, sorted
  const completedDates: DateString[] = [];
  for (const [date, ids] of Object.entries(completions)) {
    if (ids.includes(habitId)) {
      completedDates.push(date);
    }
  }

  if (completedDates.length === 0) {
    return { length: 0, start: null, end: null };
  }

  completedDates.sort();

  let longestLength = 1;
  let longestStart = completedDates[0];
  let longestEnd = completedDates[0];

  let currentLength = 1;
  let currentStart = completedDates[0];

  for (let i = 1; i < completedDates.length; i++) {
    const prev = new Date(completedDates[i - 1]);
    const curr = new Date(completedDates[i]);
    const diffMs = curr.getTime() - prev.getTime();
    const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 1) {
      currentLength++;
    } else {
      currentLength = 1;
      currentStart = completedDates[i];
    }

    if (currentLength > longestLength) {
      longestLength = currentLength;
      longestStart = currentStart;
      longestEnd = completedDates[i];
    }
  }

  return { length: longestLength, start: longestStart, end: longestEnd };
}

export function calculateStreakInfo(
  completions: CompletionRecord,
  habitId: HabitId
): StreakInfo {
  const currentStreak = calculateCurrentStreak(completions, habitId);
  const longest = calculateLongestStreak(completions, habitId);

  return {
    habitId,
    currentStreak,
    longestStreak: longest.length,
    longestStreakStart: longest.start,
    longestStreakEnd: longest.end,
  };
}
