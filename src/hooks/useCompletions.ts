"use client";

import { useMemo, useCallback } from "react";
import { useAppData } from "./useAppData";
import { DateString, HabitId } from "@/types";
import { isHabitCompleted, getCompletedHabitsForDate } from "@/lib/completions";
import { today } from "@/lib/dates";

export function useCompletions() {
  const { data, toggleHabitCompletion } = useAppData();

  const todayStr = today();

  const isCompleted = useCallback(
    (habitId: HabitId, date?: DateString) => {
      return isHabitCompleted(data.completions, habitId, date ?? todayStr);
    },
    [data.completions, todayStr]
  );

  const todayCompletions = useMemo(
    () => getCompletedHabitsForDate(data.completions, todayStr),
    [data.completions, todayStr]
  );

  const toggle = useCallback(
    (habitId: HabitId, date?: DateString) => {
      toggleHabitCompletion(habitId, date ?? todayStr);
    },
    [toggleHabitCompletion, todayStr]
  );

  return { isCompleted, todayCompletions, toggle, completions: data.completions };
}
