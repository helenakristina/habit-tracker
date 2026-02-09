"use client";

import { useHabits } from "@/hooks/useHabits";
import { useCompletions } from "@/hooks/useCompletions";
import { useStreaks } from "@/hooks/useStreaks";
import { format } from "date-fns";
import Card from "@/components/ui/Card";
import HabitCheckItem from "./HabitCheckItem";
import EmptyState from "@/components/ui/EmptyState";
import Button from "@/components/ui/Button";
import Link from "next/link";

export default function TodayHabits() {
  const { activeHabits } = useHabits();
  const { isCompleted, toggle } = useCompletions();
  const { getStreak } = useStreaks();

  const completedCount = activeHabits.filter((h) => isCompleted(h.id)).length;
  const todayDate = new Date();

  return (
    <Card noPadding>
      <div className="p-4 sm:p-6 pb-2 sm:pb-2">
        <div className="flex items-center justify-between mb-1">
          <h2 className="text-lg font-semibold text-foreground">Today</h2>
          <span className="text-sm text-muted-foreground">
            {format(todayDate, "EEEE, MMM d")}
          </span>
        </div>
        {activeHabits.length > 0 && (
          <p className="text-sm text-muted-foreground">
            {completedCount}/{activeHabits.length} completed
          </p>
        )}
      </div>

      {activeHabits.length === 0 ? (
        <div className="px-4 sm:px-6 pb-4 sm:pb-6">
          <EmptyState
            title="No habits yet"
            description="Create your first habit to start tracking"
            action={
              <Link href="/habits">
                <Button>Create Habit</Button>
              </Link>
            }
          />
        </div>
      ) : (
        <div className="px-1 sm:px-2 pb-2 sm:pb-4">
          {activeHabits.map((habit) => {
            const streak = getStreak(habit.id);
            return (
              <HabitCheckItem
                key={habit.id}
                habit={habit}
                isCompleted={isCompleted(habit.id)}
                currentStreak={streak.currentStreak}
                longestStreak={streak.longestStreak}
                onToggle={() => toggle(habit.id)}
              />
            );
          })}
        </div>
      )}
    </Card>
  );
}
