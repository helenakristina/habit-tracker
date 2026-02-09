import { Habit, HabitFormData, HabitColor } from "@/types";
import { generateId } from "./id";
import { MAX_HABIT_NAME_LENGTH, MAX_HABIT_DESCRIPTION_LENGTH } from "./constants";

export function createHabit(formData: HabitFormData, sortOrder: number): Habit {
  const now = new Date().toISOString();
  return {
    id: generateId(),
    name: formData.name.trim(),
    description: formData.description.trim(),
    color: formData.color,
    createdAt: now,
    updatedAt: now,
    isArchived: false,
    sortOrder,
  };
}

export function updateHabit(
  habit: Habit,
  updates: Partial<Pick<Habit, "name" | "description" | "color">>
): Habit {
  return {
    ...habit,
    ...updates,
    name: updates.name !== undefined ? updates.name.trim() : habit.name,
    description: updates.description !== undefined ? updates.description.trim() : habit.description,
    updatedAt: new Date().toISOString(),
  };
}

export interface ValidationError {
  field: string;
  message: string;
}

export function validateHabitForm(data: HabitFormData): ValidationError[] {
  const errors: ValidationError[] = [];

  const name = data.name.trim();
  if (!name) {
    errors.push({ field: "name", message: "Name is required" });
  } else if (name.length > MAX_HABIT_NAME_LENGTH) {
    errors.push({ field: "name", message: `Name must be ${MAX_HABIT_NAME_LENGTH} characters or less` });
  }

  if (data.description.trim().length > MAX_HABIT_DESCRIPTION_LENGTH) {
    errors.push({ field: "description", message: `Description must be ${MAX_HABIT_DESCRIPTION_LENGTH} characters or less` });
  }

  return errors;
}

export function sortHabits(habits: Habit[]): Habit[] {
  return [...habits].sort((a, b) => a.sortOrder - b.sortOrder);
}

export function getActiveHabits(habits: Habit[]): Habit[] {
  return sortHabits(habits.filter((h) => !h.isArchived));
}

export function getArchivedHabits(habits: Habit[]): Habit[] {
  return sortHabits(habits.filter((h) => h.isArchived));
}

export function getDefaultColor(existingHabits: Habit[]): HabitColor {
  const colors: HabitColor[] = ["indigo", "green", "blue", "orange", "pink", "red", "emerald", "violet", "amber"];
  const usedColors = new Set(existingHabits.map((h) => h.color));
  return colors.find((c) => !usedColors.has(c)) ?? colors[0];
}
