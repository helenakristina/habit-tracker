import { HabitColor } from "@/types";

export const STORAGE_KEY = "habit-tracker-data";

export const HABIT_COLORS: { value: HabitColor; label: string; bg: string; text: string; ring: string }[] = [
  { value: "red", label: "Red", bg: "bg-red-500", text: "text-red-500", ring: "ring-red-500" },
  { value: "orange", label: "Orange", bg: "bg-orange-500", text: "text-orange-500", ring: "ring-orange-500" },
  { value: "amber", label: "Amber", bg: "bg-amber-500", text: "text-amber-500", ring: "ring-amber-500" },
  { value: "green", label: "Green", bg: "bg-green-500", text: "text-green-500", ring: "ring-green-500" },
  { value: "emerald", label: "Emerald", bg: "bg-emerald-500", text: "text-emerald-500", ring: "ring-emerald-500" },
  { value: "blue", label: "Blue", bg: "bg-blue-500", text: "text-blue-500", ring: "ring-blue-500" },
  { value: "indigo", label: "Indigo", bg: "bg-indigo-500", text: "text-indigo-500", ring: "ring-indigo-500" },
  { value: "violet", label: "Violet", bg: "bg-violet-500", text: "text-violet-500", ring: "ring-violet-500" },
  { value: "pink", label: "Pink", bg: "bg-pink-500", text: "text-pink-500", ring: "ring-pink-500" },
];

export const HABIT_COLOR_MAP: Record<HabitColor, { bg: string; bgLight: string; text: string }> = {
  red: { bg: "bg-red-500", bgLight: "bg-red-100", text: "text-red-500" },
  orange: { bg: "bg-orange-500", bgLight: "bg-orange-100", text: "text-orange-500" },
  amber: { bg: "bg-amber-500", bgLight: "bg-amber-100", text: "text-amber-500" },
  green: { bg: "bg-green-500", bgLight: "bg-green-100", text: "text-green-500" },
  emerald: { bg: "bg-emerald-500", bgLight: "bg-emerald-100", text: "text-emerald-500" },
  blue: { bg: "bg-blue-500", bgLight: "bg-blue-100", text: "text-blue-500" },
  indigo: { bg: "bg-indigo-500", bgLight: "bg-indigo-100", text: "text-indigo-500" },
  violet: { bg: "bg-violet-500", bgLight: "bg-violet-100", text: "text-violet-500" },
  pink: { bg: "bg-pink-500", bgLight: "bg-pink-100", text: "text-pink-500" },
};

export const MAX_HABIT_NAME_LENGTH = 50;
export const MAX_HABIT_DESCRIPTION_LENGTH = 200;

export const DEFAULT_APP_DATA = {
  version: 1 as const,
  habits: [],
  completions: {},
  lastModified: new Date().toISOString(),
};

export const HEATMAP_DAYS = 365;

export const NAV_ITEMS = [
  { href: "/", label: "Dashboard", icon: "dashboard" as const },
  { href: "/habits", label: "Habits", icon: "habits" as const },
  { href: "/settings", label: "Settings", icon: "settings" as const },
];
