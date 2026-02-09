"use client";

import { useState, FormEvent } from "react";
import { HabitFormData, HabitColor } from "@/types";
import { validateHabitForm, ValidationError } from "@/lib/habits";
import { HABIT_COLORS, MAX_HABIT_NAME_LENGTH, MAX_HABIT_DESCRIPTION_LENGTH } from "@/lib/constants";
import Input from "@/components/ui/Input";
import Textarea from "@/components/ui/Textarea";
import Button from "@/components/ui/Button";

interface HabitFormProps {
  initialData?: HabitFormData;
  onSubmit: (data: HabitFormData) => void;
  onCancel: () => void;
  submitLabel?: string;
}

export default function HabitForm({ initialData, onSubmit, onCancel, submitLabel = "Create Habit" }: HabitFormProps) {
  const [name, setName] = useState(initialData?.name ?? "");
  const [description, setDescription] = useState(initialData?.description ?? "");
  const [color, setColor] = useState<HabitColor>(initialData?.color ?? "indigo");
  const [errors, setErrors] = useState<ValidationError[]>([]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const formData: HabitFormData = { name, description, color };
    const validationErrors = validateHabitForm(formData);

    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      return;
    }

    setErrors([]);
    onSubmit(formData);
  };

  const getError = (field: string) => errors.find((e) => e.field === field)?.message;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label="Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="e.g., Morning meditation"
        maxLength={MAX_HABIT_NAME_LENGTH}
        error={getError("name")}
        autoFocus
      />

      <Textarea
        label="Description (optional)"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Why is this habit important to you?"
        maxLength={MAX_HABIT_DESCRIPTION_LENGTH}
        error={getError("description")}
      />

      <div className="space-y-1">
        <label className="block text-sm font-medium text-foreground">Color</label>
        <div className="flex flex-wrap gap-2">
          {HABIT_COLORS.map((c) => (
            <button
              key={c.value}
              type="button"
              onClick={() => setColor(c.value)}
              className={`w-8 h-8 rounded-full ${c.bg} transition-all min-w-[44px] min-h-[44px] flex items-center justify-center
                ${color === c.value ? "ring-2 ring-offset-2 ring-gray-400 scale-110" : "hover:scale-105"}`}
              aria-label={c.label}
              aria-pressed={color === c.value}
            >
              {color === c.value && (
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="white" strokeWidth="2">
                  <path d="M4 8l3 3 5-5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-2">
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">{submitLabel}</Button>
      </div>
    </form>
  );
}
