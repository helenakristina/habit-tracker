"use client";

import { Habit } from "@/types";
import HabitCard from "./HabitCard";
import EmptyState from "@/components/ui/EmptyState";
import Button from "@/components/ui/Button";

interface HabitListProps {
  habits: Habit[];
  emptyTitle?: string;
  emptyDescription?: string;
  onCreateClick?: () => void;
}

export default function HabitList({ habits, emptyTitle, emptyDescription, onCreateClick }: HabitListProps) {
  if (habits.length === 0) {
    return (
      <EmptyState
        icon={
          <svg width="48" height="48" viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.5">
            <circle cx="24" cy="24" r="20" />
            <path d="M16 24h16M24 16v16" strokeLinecap="round" />
          </svg>
        }
        title={emptyTitle ?? "No habits yet"}
        description={emptyDescription ?? "Create your first habit to start tracking your progress"}
        action={onCreateClick ? <Button onClick={onCreateClick}>Create Habit</Button> : undefined}
      />
    );
  }

  return (
    <div className="space-y-3">
      {habits.map((habit) => (
        <HabitCard key={habit.id} habit={habit} />
      ))}
    </div>
  );
}
