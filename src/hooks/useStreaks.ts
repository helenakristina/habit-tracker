"use client";

import { useMemo } from "react";
import { useAppData } from "./useAppData";
import { HabitId, StreakInfo } from "@/types";
import { calculateStreakInfo } from "@/lib/streaks";

export function useStreaks() {
  const { data } = useAppData();

  const streakMap = useMemo(() => {
    const map = new Map<HabitId, StreakInfo>();
    for (const habit of data.habits) {
      map.set(habit.id, calculateStreakInfo(data.completions, habit.id));
    }
    return map;
  }, [data.habits, data.completions]);

  const getStreak = (habitId: HabitId): StreakInfo => {
    return streakMap.get(habitId) ?? {
      habitId,
      currentStreak: 0,
      longestStreak: 0,
      longestStreakStart: null,
      longestStreakEnd: null,
    };
  };

  return { streakMap, getStreak };
}
