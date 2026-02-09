"use client";

interface StreakDisplayProps {
  currentStreak: number;
  longestStreak: number;
}

export default function StreakDisplay({ currentStreak, longestStreak }: StreakDisplayProps) {
  return (
    <div className="flex items-center gap-3 text-xs text-muted-foreground">
      <span className="flex items-center gap-1" title="Current streak">
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <path d="M7 1c0 3-3 4-3 7a3 3 0 006 0c0-3-3-4-3-7z" fill="currentColor" className={currentStreak > 0 ? "text-orange-400" : ""} />
        </svg>
        {currentStreak}d
      </span>
      <span className="flex items-center gap-1" title="Longest streak">
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M2 10l3-3 2 2 5-5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        {longestStreak}d best
      </span>
    </div>
  );
}
