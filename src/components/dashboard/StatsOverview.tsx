"use client";

import { useMemo } from "react";
import { Habit, CompletionRecord } from "@/types";
import { calculateDashboardStats } from "@/lib/stats";
import StatCard from "./StatCard";

interface StatsOverviewProps {
  habits: Habit[];
  completions: CompletionRecord;
}

export default function StatsOverview({ habits, completions }: StatsOverviewProps) {
  const stats = useMemo(() => calculateDashboardStats(habits, completions), [habits, completions]);

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
      <StatCard label="Total Habits" value={stats.totalHabits} />
      <StatCard label="Done Today" value={stats.completedToday} sublabel={`of ${stats.totalHabits}`} />
      <StatCard label="Best Streak" value={stats.currentBestStreak} sublabel="days" />
      <StatCard label="30-Day Rate" value={`${stats.overallCompletionRate}%`} />
    </div>
  );
}
