import { AppData } from "@/types";
import { STORAGE_KEY, DEFAULT_APP_DATA } from "./constants";

export function loadAppData(): AppData {
  if (typeof window === "undefined") {
    return { ...DEFAULT_APP_DATA, lastModified: new Date().toISOString() };
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return { ...DEFAULT_APP_DATA, lastModified: new Date().toISOString() };
    }

    const parsed = JSON.parse(raw);

    if (parsed.version !== 1) {
      return { ...DEFAULT_APP_DATA, lastModified: new Date().toISOString() };
    }

    return parsed as AppData;
  } catch {
    return { ...DEFAULT_APP_DATA, lastModified: new Date().toISOString() };
  }
}

export function saveAppData(data: AppData): void {
  if (typeof window === "undefined") return;

  try {
    const toSave: AppData = {
      ...data,
      lastModified: new Date().toISOString(),
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
  } catch (e) {
    console.error("Failed to save app data:", e);
  }
}

export function clearAppData(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(STORAGE_KEY);
}
