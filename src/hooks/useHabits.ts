"use client";

import { useMemo } from "react";
import { useAppData } from "./useAppData";
import { getActiveHabits, getArchivedHabits } from "@/lib/habits";

export function useHabits() {
  const { data } = useAppData();

  const activeHabits = useMemo(() => getActiveHabits(data.habits), [data.habits]);
  const archivedHabits = useMemo(() => getArchivedHabits(data.habits), [data.habits]);

  return { activeHabits, archivedHabits, allHabits: data.habits };
}
