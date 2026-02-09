"use client";

import { useState } from "react";
import { useAppData } from "@/hooks/useAppData";
import { useHabits } from "@/hooks/useHabits";
import { HabitFormData } from "@/types";
import HabitList from "./HabitList";
import HabitFormModal from "./HabitFormModal";
import Button from "@/components/ui/Button";

export default function HabitsPage() {
  const { addHabit, isLoading } = useAppData();
  const { activeHabits, archivedHabits } = useHabits();
  const [isCreating, setIsCreating] = useState(false);
  const [showArchived, setShowArchived] = useState(false);

  if (isLoading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-8 w-32 bg-muted rounded" />
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-20 bg-muted rounded-xl" />
        ))}
      </div>
    );
  }

  const handleCreate = (data: HabitFormData) => {
    addHabit(data);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">Habits</h1>
        <Button onClick={() => setIsCreating(true)}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" className="mr-1.5">
            <path d="M8 3v10M3 8h10" strokeLinecap="round" />
          </svg>
          New Habit
        </Button>
      </div>

      <HabitList
        habits={activeHabits}
        onCreateClick={() => setIsCreating(true)}
      />

      {archivedHabits.length > 0 && (
        <div className="space-y-3">
          <button
            onClick={() => setShowArchived(!showArchived)}
            className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              className={`transition-transform ${showArchived ? "rotate-90" : ""}`}
            >
              <path d="M6 4l4 4-4 4" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Archived ({archivedHabits.length})
          </button>
          {showArchived && (
            <HabitList
              habits={archivedHabits}
              emptyTitle="No archived habits"
              emptyDescription="Archived habits will appear here"
            />
          )}
        </div>
      )}

      <HabitFormModal
        isOpen={isCreating}
        onClose={() => setIsCreating(false)}
        onSubmit={handleCreate}
      />
    </div>
  );
}
