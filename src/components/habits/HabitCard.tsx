"use client";

import { useState } from "react";
import { Habit, HabitFormData } from "@/types";
import { HABIT_COLOR_MAP } from "@/lib/constants";
import { useAppData } from "@/hooks/useAppData";
import Button from "@/components/ui/Button";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import HabitFormModal from "./HabitFormModal";

interface HabitCardProps {
  habit: Habit;
}

export default function HabitCard({ habit }: HabitCardProps) {
  const { editHabit, archiveHabit, restoreHabit, deleteHabit } = useAppData();
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const colors = HABIT_COLOR_MAP[habit.color];

  const handleEdit = (data: HabitFormData) => {
    editHabit(habit.id, data);
  };

  return (
    <>
      <div className={`rounded-xl border border-border bg-card p-4 transition-all hover:shadow-md`}>
        <div className="flex items-start gap-3">
          <div className={`w-3 h-3 rounded-full mt-1.5 shrink-0 ${colors.bg}`} />
          <div className="flex-1 min-w-0">
            <h3 className={`font-medium text-foreground ${habit.isArchived ? "line-through opacity-60" : ""}`}>
              {habit.name}
            </h3>
            {habit.description && (
              <p className="text-sm text-muted-foreground mt-0.5 line-clamp-2">{habit.description}</p>
            )}
          </div>
          <div className="flex items-center gap-1 shrink-0">
            {habit.isArchived ? (
              <>
                <Button variant="ghost" size="sm" onClick={() => restoreHabit(habit.id)} aria-label="Restore habit">
                  Restore
                </Button>
                <Button variant="ghost" size="sm" onClick={() => setShowDeleteConfirm(true)} aria-label="Delete habit">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M3 4h10M5.5 4V3a1 1 0 011-1h3a1 1 0 011 1v1M6.5 7v4M9.5 7v4M4.5 4l.5 8a1 1 0 001 1h4a1 1 0 001-1l.5-8" />
                  </svg>
                </Button>
              </>
            ) : (
              <>
                <Button variant="ghost" size="sm" onClick={() => setIsEditing(true)} aria-label="Edit habit">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M9.5 3.5l3 3M2 11l7-7 3 3-7 7H2v-3z" />
                  </svg>
                </Button>
                <Button variant="ghost" size="sm" onClick={() => archiveHabit(habit.id)} aria-label="Archive habit">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <rect x="2" y="3" width="12" height="3" rx="0.5" />
                    <path d="M3 6v6.5a1 1 0 001 1h8a1 1 0 001-1V6M6.5 9h3" />
                  </svg>
                </Button>
              </>
            )}
          </div>
        </div>
      </div>

      <HabitFormModal
        isOpen={isEditing}
        onClose={() => setIsEditing(false)}
        onSubmit={handleEdit}
        initialData={{ name: habit.name, description: habit.description, color: habit.color }}
        title="Edit Habit"
        submitLabel="Save Changes"
      />

      <ConfirmDialog
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={() => deleteHabit(habit.id)}
        title="Delete Habit"
        message="This will permanently delete this habit and all its completion history. This action cannot be undone."
        confirmLabel="Delete"
      />
    </>
  );
}
