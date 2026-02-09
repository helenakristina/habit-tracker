import { CompletionRecord, DateString, HabitId } from "@/types";

export function isHabitCompleted(
  completions: CompletionRecord,
  habitId: HabitId,
  date: DateString
): boolean {
  return completions[date]?.includes(habitId) ?? false;
}

export function toggleCompletion(
  completions: CompletionRecord,
  habitId: HabitId,
  date: DateString
): CompletionRecord {
  const dayCompletions = completions[date] ?? [];
  const updated = { ...completions };

  if (dayCompletions.includes(habitId)) {
    updated[date] = dayCompletions.filter((id) => id !== habitId);
    if (updated[date].length === 0) {
      delete updated[date];
    }
  } else {
    updated[date] = [...dayCompletions, habitId];
  }

  return updated;
}

export function getCompletedHabitsForDate(
  completions: CompletionRecord,
  date: DateString
): HabitId[] {
  return completions[date] ?? [];
}

export function getCompletionCountForDate(
  completions: CompletionRecord,
  date: DateString,
  activeHabitIds: HabitId[]
): number {
  const dayCompletions = completions[date] ?? [];
  return dayCompletions.filter((id) => activeHabitIds.includes(id)).length;
}

export function removeHabitFromCompletions(
  completions: CompletionRecord,
  habitId: HabitId
): CompletionRecord {
  const updated: CompletionRecord = {};
  for (const [date, ids] of Object.entries(completions)) {
    const filtered = ids.filter((id) => id !== habitId);
    if (filtered.length > 0) {
      updated[date] = filtered;
    }
  }
  return updated;
}
