"use client";

import { HeatmapDay } from "@/types";
import { formatDisplayDate } from "@/lib/dates";

interface HeatmapCellProps {
  day: HeatmapDay;
}

const intensityClasses = [
  "bg-gray-100",
  "bg-green-200",
  "bg-green-300",
  "bg-green-400",
  "bg-green-500",
];

export default function HeatmapCell({ day }: HeatmapCellProps) {
  const label = `${formatDisplayDate(day.date)}: ${day.count}/${day.total} completed`;

  return (
    <div
      className={`w-3 h-3 rounded-sm ${intensityClasses[day.intensity]} transition-colors`}
      title={label}
      aria-label={label}
    />
  );
}
