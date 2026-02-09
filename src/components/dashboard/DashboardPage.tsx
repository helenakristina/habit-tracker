"use client";

import { useAppData } from "@/hooks/useAppData";
import TodayHabits from "./TodayHabits";
import StatsOverview from "./StatsOverview";
import TrendsChart from "./TrendsChart";
import CalendarHeatmap from "@/components/calendar/CalendarHeatmap";

export default function DashboardPage() {
  const { data, isLoading } = useAppData();

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 w-48 bg-muted rounded" />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-24 bg-muted rounded-xl" />
          ))}
        </div>
        <div className="h-64 bg-muted rounded-xl" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
      <StatsOverview habits={data.habits} completions={data.completions} />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TodayHabits />
        <TrendsChart habits={data.habits} completions={data.completions} />
      </div>
      <CalendarHeatmap habits={data.habits} completions={data.completions} />
    </div>
  );
}
