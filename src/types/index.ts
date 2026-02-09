export type HabitColor =
  | "red"
  | "orange"
  | "amber"
  | "green"
  | "emerald"
  | "blue"
  | "indigo"
  | "violet"
  | "pink";

export type DateString = string; // "YYYY-MM-DD"
export type HabitId = string;

export interface Habit {
  id: HabitId;
  name: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  isArchived: boolean;
  color: HabitColor;
  sortOrder: number;
}

export type CompletionRecord = Record<DateString, HabitId[]>;

export interface AppData {
  version: 1;
  habits: Habit[];
  completions: CompletionRecord;
  lastModified: string;
}

export interface StreakInfo {
  habitId: HabitId;
  currentStreak: number;
  longestStreak: number;
  longestStreakStart: string | null;
  longestStreakEnd: string | null;
}

export interface DashboardStats {
  totalHabits: number;
  completedToday: number;
  currentBestStreak: number;
  overallCompletionRate: number;
}

export interface TrendDataPoint {
  date: DateString;
  completed: number;
  total: number;
  rate: number;
}

export interface HeatmapDay {
  date: DateString;
  count: number;
  total: number;
  intensity: number; // 0-4
}

export type HabitFormData = {
  name: string;
  description: string;
  color: HabitColor;
};

export type ToastType = "success" | "error" | "info";

export interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

export type AppAction =
  | { type: "ADD_HABIT"; payload: Habit }
  | { type: "UPDATE_HABIT"; payload: { id: HabitId; updates: Partial<Pick<Habit, "name" | "description" | "color">> } }
  | { type: "ARCHIVE_HABIT"; payload: HabitId }
  | { type: "RESTORE_HABIT"; payload: HabitId }
  | { type: "DELETE_HABIT"; payload: HabitId }
  | { type: "REORDER_HABITS"; payload: HabitId[] }
  | { type: "TOGGLE_COMPLETION"; payload: { habitId: HabitId; date: DateString } }
  | { type: "IMPORT_DATA"; payload: AppData }
  | { type: "CLEAR_DATA" };
