"use client";

import { createContext, useReducer, useEffect, useCallback, useState, ReactNode } from "react";
import { AppData, AppAction, Habit, HabitId, DateString, HabitFormData } from "@/types";
import { DEFAULT_APP_DATA } from "@/lib/constants";
import { loadAppData, saveAppData, clearAppData } from "@/lib/storage";
import { createHabit, updateHabit } from "@/lib/habits";
import { toggleCompletion, removeHabitFromCompletions } from "@/lib/completions";

interface AppDataContextValue {
  data: AppData;
  isLoading: boolean;
  addHabit: (formData: HabitFormData) => void;
  editHabit: (id: HabitId, updates: Partial<Pick<Habit, "name" | "description" | "color">>) => void;
  archiveHabit: (id: HabitId) => void;
  restoreHabit: (id: HabitId) => void;
  deleteHabit: (id: HabitId) => void;
  reorderHabits: (orderedIds: HabitId[]) => void;
  toggleHabitCompletion: (habitId: HabitId, date: DateString) => void;
  importData: (data: AppData) => void;
  clearAllData: () => void;
}

export const AppDataContext = createContext<AppDataContextValue | null>(null);

function appReducer(state: AppData, action: AppAction): AppData {
  switch (action.type) {
    case "ADD_HABIT":
      return { ...state, habits: [...state.habits, action.payload] };

    case "UPDATE_HABIT":
      return {
        ...state,
        habits: state.habits.map((h) =>
          h.id === action.payload.id ? updateHabit(h, action.payload.updates) : h
        ),
      };

    case "ARCHIVE_HABIT":
      return {
        ...state,
        habits: state.habits.map((h) =>
          h.id === action.payload ? { ...h, isArchived: true, updatedAt: new Date().toISOString() } : h
        ),
      };

    case "RESTORE_HABIT":
      return {
        ...state,
        habits: state.habits.map((h) =>
          h.id === action.payload ? { ...h, isArchived: false, updatedAt: new Date().toISOString() } : h
        ),
      };

    case "DELETE_HABIT":
      return {
        ...state,
        habits: state.habits.filter((h) => h.id !== action.payload),
        completions: removeHabitFromCompletions(state.completions, action.payload),
      };

    case "REORDER_HABITS": {
      const orderMap = new Map(action.payload.map((id, index) => [id, index]));
      return {
        ...state,
        habits: state.habits.map((h) => ({
          ...h,
          sortOrder: orderMap.get(h.id) ?? h.sortOrder,
        })),
      };
    }

    case "TOGGLE_COMPLETION":
      return {
        ...state,
        completions: toggleCompletion(state.completions, action.payload.habitId, action.payload.date),
      };

    case "IMPORT_DATA":
      return action.payload;

    case "CLEAR_DATA":
      return { ...DEFAULT_APP_DATA, lastModified: new Date().toISOString() };

    default:
      return state;
  }
}

export function AppDataProvider({ children }: { children: ReactNode }) {
  const [isLoading, setIsLoading] = useState(true);
  const [data, dispatch] = useReducer(appReducer, { ...DEFAULT_APP_DATA, lastModified: new Date().toISOString() });
  const [isInitialized, setIsInitialized] = useState(false);

  // Load data from localStorage on mount
  useEffect(() => {
    const saved = loadAppData();
    dispatch({ type: "IMPORT_DATA", payload: saved });
    setIsLoading(false);
    setIsInitialized(true);
  }, []);

  // Persist to localStorage on every change (after initial load)
  useEffect(() => {
    if (isInitialized) {
      saveAppData(data);
    }
  }, [data, isInitialized]);

  const addHabit = useCallback((formData: HabitFormData) => {
    const maxOrder = data.habits.reduce((max, h) => Math.max(max, h.sortOrder), -1);
    const habit = createHabit(formData, maxOrder + 1);
    dispatch({ type: "ADD_HABIT", payload: habit });
  }, [data.habits]);

  const editHabit = useCallback((id: HabitId, updates: Partial<Pick<Habit, "name" | "description" | "color">>) => {
    dispatch({ type: "UPDATE_HABIT", payload: { id, updates } });
  }, []);

  const archiveHabit = useCallback((id: HabitId) => {
    dispatch({ type: "ARCHIVE_HABIT", payload: id });
  }, []);

  const restoreHabit = useCallback((id: HabitId) => {
    dispatch({ type: "RESTORE_HABIT", payload: id });
  }, []);

  const deleteHabit = useCallback((id: HabitId) => {
    dispatch({ type: "DELETE_HABIT", payload: id });
  }, []);

  const reorderHabits = useCallback((orderedIds: HabitId[]) => {
    dispatch({ type: "REORDER_HABITS", payload: orderedIds });
  }, []);

  const toggleHabitCompletion = useCallback((habitId: HabitId, date: DateString) => {
    dispatch({ type: "TOGGLE_COMPLETION", payload: { habitId, date } });
  }, []);

  const importData = useCallback((importedData: AppData) => {
    dispatch({ type: "IMPORT_DATA", payload: importedData });
  }, []);

  const clearAllData = useCallback(() => {
    clearAppData();
    dispatch({ type: "CLEAR_DATA" });
  }, []);

  return (
    <AppDataContext.Provider
      value={{
        data,
        isLoading,
        addHabit,
        editHabit,
        archiveHabit,
        restoreHabit,
        deleteHabit,
        reorderHabits,
        toggleHabitCompletion,
        importData,
        clearAllData,
      }}
    >
      {children}
    </AppDataContext.Provider>
  );
}
