"use client";

import { useMemo } from "react";
import { Habit, CompletionRecord } from "@/types";
import { generateHeatmapData } from "@/lib/stats";
import { parseDateString, getMonthLabel, getDayOfWeek } from "@/lib/dates";
import Card from "@/components/ui/Card";
import HeatmapCell from "./HeatmapCell";
import HeatmapLegend from "./HeatmapLegend";

interface CalendarHeatmapProps {
  habits: Habit[];
  completions: CompletionRecord;
}

export default function CalendarHeatmap({ habits, completions }: CalendarHeatmapProps) {
  const heatmapData = useMemo(() => generateHeatmapData(habits, completions), [habits, completions]);

  // Organize days into weeks (columns)
  const weeks = useMemo(() => {
    const result: typeof heatmapData[] = [];
    let currentWeek: typeof heatmapData = [];

    // Pad the first week with empty cells
    if (heatmapData.length > 0) {
      const firstDayOfWeek = getDayOfWeek(parseDateString(heatmapData[0].date));
      for (let i = 0; i < firstDayOfWeek; i++) {
        currentWeek.push({ date: "", count: 0, total: 0, intensity: 0 });
      }
    }

    for (const day of heatmapData) {
      currentWeek.push(day);
      if (currentWeek.length === 7) {
        result.push(currentWeek);
        currentWeek = [];
      }
    }

    if (currentWeek.length > 0) {
      result.push(currentWeek);
    }

    return result;
  }, [heatmapData]);

  // Extract month labels with their column positions
  const monthLabels = useMemo(() => {
    const labels: { label: string; col: number }[] = [];
    let lastMonth = "";

    weeks.forEach((week, colIndex) => {
      for (const day of week) {
        if (!day.date) continue;
        const date = parseDateString(day.date);
        const month = getMonthLabel(date);
        if (month !== lastMonth) {
          labels.push({ label: month, col: colIndex });
          lastMonth = month;
        }
        break;
      }
    });

    return labels;
  }, [weeks]);

  const dayLabels = ["", "Mon", "", "Wed", "", "Fri", ""];

  return (
    <Card>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-foreground">Activity</h2>
        <HeatmapLegend />
      </div>

      <div className="overflow-x-auto">
        <div className="inline-flex flex-col gap-0" style={{ minWidth: "max-content" }}>
          {/* Month labels */}
          <div className="flex gap-[3px] ml-8 mb-1">
            {weeks.map((_, colIndex) => {
              const monthLabel = monthLabels.find((m) => m.col === colIndex);
              return (
                <div key={colIndex} className="w-3 text-xs text-muted-foreground">
                  {monthLabel?.label ?? ""}
                </div>
              );
            })}
          </div>

          {/* Grid: day labels + cells */}
          <div className="flex gap-0">
            {/* Day of week labels */}
            <div className="flex flex-col gap-[3px] mr-1 justify-start">
              {dayLabels.map((label, i) => (
                <div key={i} className="h-3 text-xs text-muted-foreground leading-3 w-6 text-right pr-1">
                  {label}
                </div>
              ))}
            </div>

            {/* Heatmap grid */}
            <div className="flex gap-[3px]">
              {weeks.map((week, colIndex) => (
                <div key={colIndex} className="flex flex-col gap-[3px]">
                  {week.map((day, rowIndex) =>
                    day.date ? (
                      <HeatmapCell key={day.date} day={day} />
                    ) : (
                      <div key={`empty-${colIndex}-${rowIndex}`} className="w-3 h-3" />
                    )
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
