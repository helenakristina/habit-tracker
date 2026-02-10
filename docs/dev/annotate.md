# Habit Tracker - Developer Annotation Guide

> A step-by-step walkthrough of the entire Habit Tracker application, explaining every design decision and how the code works under the hood. Written for an engineer with basic JavaScript, CSS, and HTML knowledge.

---

## Table of Contents

1. [The Big Picture](#1-the-big-picture)
2. [TypeScript Crash Course (What You Need)](#2-typescript-crash-course-what-you-need)
3. [Project Structure & File Organization](#3-project-structure--file-organization)
4. [The Type System - Defining Our Data Shapes](#4-the-type-system---defining-our-data-shapes)
5. [State Management - The Brain of the App](#5-state-management---the-brain-of-the-app)
6. [Pure Utility Functions - The Logic Layer](#6-pure-utility-functions---the-logic-layer)
7. [Custom Hooks - The Bridge Between Logic and UI](#7-custom-hooks---the-bridge-between-logic-and-ui)
8. [Styling Architecture - CSS Custom Properties + Tailwind](#8-styling-architecture---css-custom-properties--tailwind)
9. [Component Deep-Dives](#9-component-deep-dives)
10. [Routing & Layout](#10-routing--layout)
11. [Data Flow End-to-End](#11-data-flow-end-to-end)
12. [Animations with Framer Motion](#12-animations-with-framer-motion)
13. [Accessibility Patterns](#13-accessibility-patterns)
14. [Key Design Decisions & Trade-offs](#14-key-design-decisions--trade-offs)

---

## 1. The Big Picture

This is a **client-side habit tracking app** built with Next.js 14 and React 18. Users can:

- Create daily habits with custom colors
- Check off habits each day
- Track current and longest streaks
- See completion trends over 7 or 30 days
- View a GitHub-style activity heatmap for the past year
- Export/import their data as JSON
- Archive or delete habits

**There is no server or database.** Everything lives in the browser's `localStorage`. This was a deliberate choice to keep the app simple, private (no data leaves the device), and deployable anywhere without backend infrastructure.

### Architecture at a Glance

```
User clicks checkbox
        |
        v
React Component (HabitCheckItem)
        |
        v
Custom Hook (useCompletions)
        |
        v
React Context (AppDataContext)
        |
        v
useReducer dispatch (TOGGLE_COMPLETION)
        |
        v
Pure function (toggleCompletion)
        |
        v
New state object
        |
        v
useEffect saves to localStorage
        |
        v
All subscribed components re-render
```

Every user action follows this exact flow. The architecture separates **what you see** (components), **what you can do** (hooks), **how state changes** (context + reducer), and **the math** (pure lib functions).

---

## 2. TypeScript Crash Course (What You Need)

If you come from Python, TypeScript will feel familiar in spirit (it's about telling the computer what shape your data has) but different in syntax. Here's a quick primer on only the features used in this codebase.

### Type Aliases

A type alias gives a name to a type. Think of it like a Python type hint:

```typescript
// Python equivalent: DateString = str
type DateString = string; // "YYYY-MM-DD"
type HabitId = string;
```

These don't enforce anything at runtime - they're documentation for humans and your editor.

### Union Types

A union type means "one of these specific values":

```typescript
// Python equivalent: Literal["red", "orange", "amber", ...]
type HabitColor =
  | "red"
  | "orange"
  | "amber"
  | "green"
  | "emerald"
  | "blue"
  | "indigo"
  | "violet"
  | "pink";
```

If you try to assign `"purple"` to a variable typed as `HabitColor`, TypeScript will show an error _before_ your code even runs.

### Interfaces

An interface defines the shape of an object. Think of it like a Python `TypedDict` or dataclass:

```typescript
// Python equivalent:
// @dataclass
// class Habit:
//     id: str
//     name: str
//     is_archived: bool
//     sort_order: int

interface Habit {
  id: HabitId;
  name: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  isArchived: boolean;
  color: HabitColor;
  sortOrder: number;
}
```

### Record Type

`Record<K, V>` means "an object where every key is type K and every value is type V":

```typescript
// Python equivalent: Dict[str, List[str]]
type CompletionRecord = Record<DateString, HabitId[]>;

// In practice, it looks like this:
// {
//   "2025-01-15": ["habit-uuid-1", "habit-uuid-3"],
//   "2025-01-16": ["habit-uuid-1", "habit-uuid-2", "habit-uuid-3"],
// }
```

### Generics

Generics are like Python generics - they let you write code that works with _any_ type:

```typescript
// Python: def first(items: List[T]) -> T
function first<T>(items: T[]): T {
  return items[0];
}
```

### Partial and Pick

These are built-in TypeScript utilities:

```typescript
// Pick<Habit, "name" | "color"> means: only the "name" and "color" fields from Habit
// Partial<...> means: all those fields become optional

Partial<Pick<Habit, "name" | "description" | "color">>;
// Result: { name?: string; description?: string; color?: HabitColor; }
// The "?" means the field is optional
```

This is used in `editHabit` because you might only want to update the name, or only the color - you don't have to pass all three.

### Discriminated Unions (Action Types)

This is the most advanced TypeScript pattern in the codebase:

```typescript
type AppAction =
  | { type: "ADD_HABIT"; payload: Habit }
  | { type: "DELETE_HABIT"; payload: HabitId }
  | {
      type: "TOGGLE_COMPLETION";
      payload: { habitId: HabitId; date: DateString };
    };
```

This says: "An AppAction is an object that has a `type` field, and depending on what `type` is, the `payload` has a different shape." When you `switch` on `action.type`, TypeScript automatically narrows the type of `action.payload` inside each `case`. This is how the reducer knows exactly what data to expect.

---

## 3. Project Structure & File Organization

```
src/
├── app/                    # Next.js App Router pages
│   ├── layout.tsx          # Root layout (wraps everything)
│   ├── page.tsx            # / route (Dashboard)
│   ├── globals.css         # CSS variables + Tailwind base
│   ├── habits/
│   │   └── page.tsx        # /habits route
│   └── settings/
│       └── page.tsx        # /settings route
│
├── components/             # UI components (organized by feature)
│   ├── layout/             # App shell, navigation
│   ├── dashboard/          # Dashboard-specific components
│   ├── calendar/           # Heatmap calendar
│   ├── habits/             # Habit management (CRUD, forms)
│   ├── settings/           # Data management buttons
│   └── ui/                 # Reusable primitives (Button, Card, Modal...)
│
├── context/                # React Context (state management)
│   └── AppDataContext.tsx  # Single source of truth
│
├── hooks/                  # Custom React hooks
│   ├── useAppData.ts       # Access the context
│   ├── useHabits.ts        # Memoized habit lists
│   ├── useCompletions.ts   # Check/toggle completions
│   ├── useStreaks.ts        # Streak calculations
│   ├── useToast.ts         # Toast notifications
│   ├── useLocalStorage.ts  # Generic localStorage hook
│   └── useMediaQuery.ts    # Responsive breakpoints
│
├── lib/                    # Pure functions (no React, no side effects)
│   ├── constants.ts        # Magic numbers, color maps, defaults
│   ├── dates.ts            # Date formatting & math
│   ├── id.ts               # UUID generation
│   ├── habits.ts           # Habit CRUD & validation
│   ├── completions.ts      # Completion record operations
│   ├── streaks.ts          # Streak calculations
│   ├── stats.ts            # Dashboard stats & chart data
│   ├── storage.ts          # localStorage read/write
│   └── export.ts           # Data export/import
│
└── types/
    └── index.ts            # All TypeScript type definitions
```

### Why This Organization?

**Feature-based component grouping** (`dashboard/`, `habits/`, `settings/`) instead of type-based (`buttons/`, `forms/`, `modals/`) makes it easy to find everything related to a feature in one place.

**Separating `lib/` from `hooks/`**: Functions in `lib/` are **pure** - they take inputs and return outputs with no side effects. They don't use `useState`, `useEffect`, or any React API. This makes them trivially easy to test and reuse. Hooks in `hooks/` are the React-specific layer that connects pure logic to component state.

**Single `types/index.ts`**: With a small-to-medium app like this, having one types file prevents circular imports and makes it easy to see all data shapes at once. For larger apps, you'd split types by domain.

---

## 4. The Type System - Defining Our Data Shapes

> Source: [`src/types/index.ts`](../../src/types/index.ts)

The types file is the blueprint for the entire application. Every other file imports from here. Let's walk through it.

### Core Data Types

```typescript
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
```

**Why a union type instead of just `string`?** Because we have a fixed set of 9 colors, each mapped to specific Tailwind CSS classes. Using a union type means:

- Your editor autocompletes color names
- You can't accidentally pass `"magenta"` and get a broken UI
- If we add a new color, TypeScript will flag every place that needs updating

```typescript
export type DateString = string; // "YYYY-MM-DD"
export type HabitId = string;
```

These are "branded" type aliases. They don't enforce format at runtime, but they communicate _intent_. When you see a function parameter typed as `DateString`, you know it expects `"2025-01-15"`, not `"January 15th"`.

### The Habit Interface

```typescript
export interface Habit {
  id: HabitId; // UUID - unique identifier
  name: string; // "Morning meditation"
  description: string; // "10 minutes of calm"
  createdAt: string; // ISO timestamp: "2025-01-15T10:30:00.000Z"
  updatedAt: string; // ISO timestamp (changes on edit)
  isArchived: boolean; // Soft delete - don't show but keep data
  color: HabitColor; // For visual identification
  sortOrder: number; // Manual ordering (0, 1, 2, ...)
}
```

**Why `isArchived` instead of deleting?** Archiving preserves historical completion data. If you tracked "Run 5K" for 3 months and stop, your past streaks and heatmap data stay intact. Permanent deletion removes the habit from _all_ completion records.

**Why `sortOrder` as a number?** It allows users to reorder habits by just updating the numbers. If you drag habit C between A and B, you set `sortOrder` values like `A=0, C=1, B=2`.

### The Completion Record

```typescript
export type CompletionRecord = Record<DateString, HabitId[]>;
```

This is the most important data structure decision in the app. It's a dictionary keyed by date, where each value is the list of habit IDs completed on that date:

```json
{
  "2025-01-15": ["abc-123", "def-456"],
  "2025-01-16": ["abc-123"],
  "2025-01-17": ["abc-123", "def-456", "ghi-789"]
}
```

**Why this shape instead of per-habit arrays?** This design makes the most common queries efficient:

- "What did I complete today?" -> One key lookup: `completions["2025-01-15"]`
- "Did I complete habit X on date Y?" -> `completions[Y]?.includes(X)`
- "How many habits did I complete on date Y?" -> `completions[Y]?.length`

The alternative - storing completions inside each habit object - would require iterating all habits to answer "what did I complete today?".

### The Root State Object

```typescript
export interface AppData {
  version: 1; // For data migrations
  habits: Habit[]; // All habits (active + archived)
  completions: CompletionRecord; // All completion data
  lastModified: string; // ISO timestamp
}
```

**Why `version: 1` as a literal type?** This is forward-thinking: if we ever change the data format, we bump the version number. On load, we check `version` and run migration logic if needed. The literal type `1` (not just `number`) means TypeScript enforces that this is always exactly `1` for the current version.

### Action Types (The Reducer Contract)

```typescript
export type AppAction =
  | { type: "ADD_HABIT"; payload: Habit }
  | {
      type: "UPDATE_HABIT";
      payload: {
        id: HabitId;
        updates: Partial<Pick<Habit, "name" | "description" | "color">>;
      };
    }
  | { type: "ARCHIVE_HABIT"; payload: HabitId }
  | { type: "RESTORE_HABIT"; payload: HabitId }
  | { type: "DELETE_HABIT"; payload: HabitId }
  | { type: "REORDER_HABITS"; payload: HabitId[] }
  | {
      type: "TOGGLE_COMPLETION";
      payload: { habitId: HabitId; date: DateString };
    }
  | { type: "IMPORT_DATA"; payload: AppData }
  | { type: "CLEAR_DATA" };
```

This is a **discriminated union**. Each action has a `type` string that uniquely identifies it, and a `payload` whose type depends on the action. When you `switch` on `action.type` in the reducer, TypeScript automatically knows the payload shape.

Notice that `UPDATE_HABIT` uses `Partial<Pick<Habit, "name" | "description" | "color">>`. This means: "Pick only `name`, `description`, and `color` from the Habit type, and make them all optional." This prevents callers from accidentally modifying `id`, `createdAt`, or `sortOrder` through the update action.

---

## 5. State Management - The Brain of the App

> Source: [`src/context/AppDataContext.tsx`](../../src/context/AppDataContext.tsx)

This is the most important file in the application. It orchestrates **all** state changes, persistence, and data access. Let's break it apart.

### Why Context + useReducer?

This app could have used Redux, Zustand, Jotai, or any state library. It uses **React's built-in tools** because:

1. The state shape is simple (one flat object)
2. There's no need for middleware, devtools, or complex selectors
3. It avoids adding another dependency
4. `useReducer` gives us a clear, predictable state machine pattern

### The Reducer Function

```typescript
function appReducer(state: AppData, action: AppAction): AppData {
  switch (action.type) {
    case "ADD_HABIT":
      return { ...state, habits: [...state.habits, action.payload] };
    // ... other cases
  }
}
```

A reducer is a **pure function** that takes the current state and an action, and returns the new state. The critical rules are:

1. **Never mutate the input** - always create new objects with `...spread`
2. **No side effects** - no API calls, no localStorage, no `console.log`
3. **Same inputs = same output** - deterministic

**Why `...state` (spread)?** In JavaScript, objects are passed by reference. If you wrote `state.habits.push(newHabit)`, you'd be mutating the _existing_ state object. React wouldn't detect a change because the reference is the same. By spreading (`{ ...state, habits: [...state.habits, action.payload] }`), you create a brand new object, which triggers React's re-render.

### The DELETE_HABIT Case - A Subtle Detail

```typescript
case "DELETE_HABIT":
  return {
    ...state,
    habits: state.habits.filter((h) => h.id !== action.payload),
    completions: removeHabitFromCompletions(state.completions, action.payload),
  };
```

When you delete a habit, you must also clean up its completion records. Otherwise you'd have orphaned habit IDs lingering in your completion data forever, wasting space and potentially corrupting stats.

### The Provider Component

```typescript
export function AppDataProvider({ children }: { children: ReactNode }) {
  const [isLoading, setIsLoading] = useState(true);
  const [data, dispatch] = useReducer(appReducer, { ...DEFAULT_APP_DATA, lastModified: new Date().toISOString() });
  const [isInitialized, setIsInitialized] = useState(false);
```

Three pieces of state work together:

- `data` - The actual app state, managed by the reducer
- `isLoading` - Shows skeleton UI while localStorage hydrates
- `isInitialized` - Prevents saving the default state back to localStorage before the real data loads

### Hydration: Loading from localStorage

```typescript
useEffect(() => {
  const saved = loadAppData();
  dispatch({ type: "IMPORT_DATA", payload: saved });
  setIsLoading(false);
  setIsInitialized(true);
}, []);
```

This runs once on mount (empty dependency array `[]`). The sequence matters:

1. Load saved data from localStorage
2. Dispatch it as an IMPORT_DATA action (replaces the default state)
3. Mark loading as complete (hides skeleton)
4. Mark as initialized (enables persistence)

**Why the `isInitialized` guard?** Without it, the persistence effect (below) would fire immediately with `DEFAULT_APP_DATA` and overwrite the user's real data in localStorage before the load completes.

### Persistence: Saving to localStorage

```typescript
useEffect(() => {
  if (isInitialized) {
    saveAppData(data);
  }
}, [data, isInitialized]);
```

Every time `data` changes, this effect fires and saves the entire state to localStorage. The `isInitialized` check ensures we don't save until after we've loaded.

### useCallback Wrappers

```typescript
const addHabit = useCallback(
  (formData: HabitFormData) => {
    const maxOrder = data.habits.reduce(
      (max, h) => Math.max(max, h.sortOrder),
      -1,
    );
    const habit = createHabit(formData, maxOrder + 1);
    dispatch({ type: "ADD_HABIT", payload: habit });
  },
  [data.habits],
);
```

Each action is wrapped in `useCallback`. This is a React optimization - it means the function reference stays the same between renders _unless its dependencies change_. Without `useCallback`, components that receive these functions as props would re-render unnecessarily because they'd see a "new" function on every render.

**The `addHabit` implementation is interesting**: it calculates the next `sortOrder` by finding the maximum existing order and adding 1. This means habits maintain their creation order by default.

### The Context Value

```typescript
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
```

This is the public API of the state manager. Components never call `dispatch` directly - they call these named methods. This provides a clean, discoverable API and makes it easy to add logging, validation, or analytics to any action later.

---

## 6. Pure Utility Functions - The Logic Layer

The `lib/` directory contains all business logic as pure functions. "Pure" means:

- No React hooks, no `useState`, no `useEffect`
- No reading or writing `localStorage`, `document`, or `window` (except `storage.ts` and `export.ts` which are explicitly about side effects)
- Same inputs always produce the same outputs

This separation is a core architectural principle. It makes the logic testable, reusable, and easy to reason about.

### Date Utilities

> Source: [`src/lib/dates.ts`](../../src/lib/dates.ts)

```typescript
import {
  format,
  subDays,
  startOfDay,
  differenceInDays,
  parseISO,
  isValid,
} from "date-fns";
```

The app uses `date-fns` instead of native `Date` methods. **Why?**

- Native `Date` is famously error-prone (months are 0-indexed, timezone handling is confusing)
- `date-fns` functions are pure and tree-shakeable (you only import what you use)
- `format`, `subDays`, etc. are clear and readable

```typescript
export function toDateString(date: Date): DateString {
  return format(date, "yyyy-MM-dd");
}
```

This is the **canonical date formatter**. Every date in the system passes through this function before being stored. Using a consistent format means string comparison works correctly for sorting: `"2025-01-15" < "2025-02-01"` is true because the strings are lexicographically ordered.

```typescript
export function getLastNDays(n: number, fromDate?: Date): DateString[] {
  const base = fromDate ?? new Date();
  const days: DateString[] = [];
  for (let i = n - 1; i >= 0; i--) {
    days.push(toDateString(subDays(base, i)));
  }
  return days;
}
```

This generates an array of date strings from `n` days ago to today. The `??` is the **nullish coalescing operator** - it means "use `fromDate` if it's not `null` or `undefined`, otherwise use `new Date()`". The loop counts _down_ from `n-1` so the array is in chronological order (oldest first).

### Completion Functions

> Source: [`src/lib/completions.ts`](../../src/lib/completions.ts)

```typescript
export function isHabitCompleted(
  completions: CompletionRecord,
  habitId: HabitId,
  date: DateString,
): boolean {
  return completions[date]?.includes(habitId) ?? false;
}
```

The `?.` is **optional chaining** - if `completions[date]` is `undefined` (no completions exist for that date), it short-circuits and returns `undefined` instead of throwing an error. Then `?? false` converts that `undefined` to `false`.

This is equivalent to:

```javascript
// Without optional chaining (verbose way):
if (completions[date] !== undefined && completions[date] !== null) {
  return completions[date].includes(habitId);
}
return false;
```

```typescript
export function toggleCompletion(
  completions: CompletionRecord,
  habitId: HabitId,
  date: DateString,
): CompletionRecord {
  const dayCompletions = completions[date] ?? [];
  const updated = { ...completions };

  if (dayCompletions.includes(habitId)) {
    // Was completed -> remove it
    updated[date] = dayCompletions.filter((id) => id !== habitId);
    if (updated[date].length === 0) {
      delete updated[date]; // Clean up empty arrays
    }
  } else {
    // Not completed -> add it
    updated[date] = [...dayCompletions, habitId];
  }

  return updated;
}
```

**Key detail: cleaning up empty arrays.** When you uncheck the last habit for a day, the code `delete`s that date key entirely. This prevents the completions object from accumulating empty arrays (`"2025-01-15": []`) that waste space and could confuse other calculations.

**Why `{ ...completions }` (shallow copy)?** The reducer requires immutability. We can't modify the existing completions object because React needs a new object reference to detect changes. However, this is only a _shallow_ copy - the inner arrays are shared unless we explicitly replace them. That's fine here because we always create new arrays (`filter` and spread both return new arrays).

### Streak Calculations

> Source: [`src/lib/streaks.ts`](../../src/lib/streaks.ts)

This is the most algorithmically interesting part of the codebase.

#### Current Streak

```typescript
export function calculateCurrentStreak(
  completions: CompletionRecord,
  habitId: HabitId,
  fromDate?: Date,
): number {
  const base = fromDate ?? new Date();
  let streak = 0;
  let current = base;

  // Check today first
  const todayStr = toDateString(current);
  if (!isHabitCompleted(completions, habitId, todayStr)) {
    // If today isn't completed, start from yesterday
    current = subDays(current, 1);
  }

  while (true) {
    const dateStr = toDateString(current);
    if (isHabitCompleted(completions, habitId, dateStr)) {
      streak++;
      current = subDays(current, 1);
    } else {
      break;
    }
  }

  return streak;
}
```

**The "today" decision is important.** If it's 9 AM and you haven't completed your habit yet, your streak shouldn't show 0. The algorithm handles this by falling back to yesterday if today isn't done yet. So your streak of 5 days stays at 5 until midnight passes without a completion, at which point it drops.

The algorithm walks backwards in time, day by day, counting consecutive completions. It stops at the first gap.

#### Longest Streak

```typescript
export function calculateLongestStreak(
  completions: CompletionRecord,
  habitId: HabitId,
): { length: number; start: DateString | null; end: DateString | null } {
  // 1. Collect all dates where this habit was completed
  const completedDates: DateString[] = [];
  for (const [date, ids] of Object.entries(completions)) {
    if (ids.includes(habitId)) {
      completedDates.push(date);
    }
  }

  if (completedDates.length === 0) {
    return { length: 0, start: null, end: null };
  }

  // 2. Sort dates chronologically
  completedDates.sort();

  // 3. Walk through sorted dates, tracking consecutive runs
  let longestLength = 1;
  let currentLength = 1;
  // ...tracks start/end dates for both current and longest runs

  for (let i = 1; i < completedDates.length; i++) {
    const prev = new Date(completedDates[i - 1]);
    const curr = new Date(completedDates[i]);
    const diffDays = Math.round(
      (curr.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24),
    );

    if (diffDays === 1) {
      currentLength++;
    } else {
      currentLength = 1;
      // New run starts here
    }

    if (currentLength > longestLength) {
      longestLength = currentLength;
      // Update best run tracking
    }
  }

  return { length: longestLength, start: longestStart, end: longestEnd };
}
```

This algorithm:

1. Collects all dates where the habit was completed (across all time)
2. Sorts them (since `"YYYY-MM-DD"` format sorts correctly as strings)
3. Walks through the sorted dates looking for consecutive days (`diffDays === 1`)
4. Tracks the longest run found

**Why `Math.round` on the day difference?** Daylight saving time can make a "day" be 23 or 25 hours. `Math.round` compensates for this so a DST transition doesn't break a streak.

### Dashboard Statistics

> Source: [`src/lib/stats.ts`](../../src/lib/stats.ts)

```typescript
export function calculateDashboardStats(
  habits: Habit[],
  completions: CompletionRecord,
): DashboardStats {
  // ...
  const last30 = getLastNDays(30);
  let totalPossible = 0;
  let totalCompleted = 0;

  for (const date of last30) {
    // Only count habits that existed on that date
    const habitsOnDate = active.filter(
      (h) => toDateString(new Date(h.createdAt)) <= date,
    );
    totalPossible += habitsOnDate.length;
    totalCompleted += getCompletionCountForDate(
      completions,
      date,
      habitsOnDate.map((h) => h.id),
    );
  }
  // ...
}
```

**The `createdAt` filter is crucial.** If you created a habit 3 days ago, it shouldn't count against your completion rate for the 27 days before it existed. The comparison `toDateString(new Date(h.createdAt)) <= date` ensures habits only factor into dates _on or after_ their creation.

### Heatmap Data Generation

```typescript
export function generateHeatmapData(
  habits: Habit[],
  completions: CompletionRecord,
): HeatmapDay[] {
  // ...
  return days.map((date) => {
    const total = activeIds.length;
    const count = getCompletionCountForDate(completions, date, activeIds);
    let intensity = 0;
    if (total > 0 && count > 0) {
      const ratio = count / total;
      if (ratio <= 0.25)
        intensity = 1; // Light green
      else if (ratio <= 0.5)
        intensity = 2; // Medium green
      else if (ratio <= 0.75)
        intensity = 3; // Dark green
      else intensity = 4; // Darkest green
    }
    return { date, count, total, intensity };
  });
}
```

The intensity scale (0-4) maps to CSS classes later:

- 0 = gray (no completions)
- 1-4 = increasingly dark shades of green

This mirrors GitHub's contribution heatmap, which uses the same 5-level scale.

---

## 7. Custom Hooks - The Bridge Between Logic and UI

Hooks bridge the gap between pure functions and React components. They wrap context access, memoization, and callbacks into clean, reusable APIs.

### useAppData - The Gateway Hook

> Source: [`src/hooks/useAppData.ts`](../../src/hooks/useAppData.ts)

This is the simplest hook - it's just a typed wrapper around `useContext`:

```typescript
import { useContext } from "react";
import { AppDataContext } from "@/context/AppDataContext";

export function useAppData() {
  const context = useContext(AppDataContext);
  if (!context) {
    throw new Error("useAppData must be used within AppDataProvider");
  }
  return context;
}
```

**Why throw an error?** If a developer accidentally uses `useAppData()` in a component that isn't wrapped by `AppDataProvider`, they'd get a cryptic `cannot read property of null` error deep in some unrelated code. The explicit error message saves debugging time.

### useHabits - Memoized Lists

> Source: [`src/hooks/useHabits.ts`](../../src/hooks/useHabits.ts)

```typescript
export function useHabits() {
  const { data } = useAppData();

  const activeHabits = useMemo(
    () => getActiveHabits(data.habits),
    [data.habits],
  );
  const archivedHabits = useMemo(
    () => getArchivedHabits(data.habits),
    [data.habits],
  );

  return { activeHabits, archivedHabits, allHabits: data.habits };
}
```

`useMemo` caches the result of `getActiveHabits(data.habits)` and only recalculates when `data.habits` actually changes. Without memoization, every re-render would re-filter and re-sort the habits array, even if nothing changed.

**When does `data.habits` actually change?** Only when a habit is added, edited, deleted, archived, restored, reordered, or imported. That's the only time this computation re-runs.

### useCompletions - Today-Aware Completions

> Source: [`src/hooks/useCompletions.ts`](../../src/hooks/useCompletions.ts)

```typescript
export function useCompletions() {
  const { data, toggleHabitCompletion } = useAppData();
  const todayStr = today(); // "2025-01-15"

  const isCompleted = useCallback(
    (habitId: HabitId, date?: DateString) => {
      return isHabitCompleted(data.completions, habitId, date ?? todayStr);
    },
    [data.completions, todayStr],
  );

  const todayCompletions = useMemo(
    () => getCompletedHabitsForDate(data.completions, todayStr),
    [data.completions, todayStr],
  );

  const toggle = useCallback(
    (habitId: HabitId, date?: DateString) => {
      toggleHabitCompletion(habitId, date ?? todayStr);
    },
    [toggleHabitCompletion, todayStr],
  );

  return {
    isCompleted,
    todayCompletions,
    toggle,
    completions: data.completions,
  };
}
```

This hook's key design: **it defaults to "today" for all operations**. Components can call `isCompleted(habitId)` without passing a date - it checks today automatically. If you need a specific date (like for the heatmap), you can pass it explicitly: `isCompleted(habitId, "2025-01-10")`.

### useStreaks - Cached Streak Map

> Source: [`src/hooks/useStreaks.ts`](../../src/hooks/useStreaks.ts)

```typescript
export function useStreaks() {
  const { data } = useAppData();

  const streakMap = useMemo(() => {
    const map = new Map<HabitId, StreakInfo>();
    for (const habit of data.habits) {
      map.set(habit.id, calculateStreakInfo(data.completions, habit.id));
    }
    return map;
  }, [data.habits, data.completions]);

  const getStreak = (habitId: HabitId): StreakInfo => {
    return (
      streakMap.get(habitId) ?? {
        habitId,
        currentStreak: 0,
        longestStreak: 0,
        longestStreakStart: null,
        longestStreakEnd: null,
      }
    );
  };

  return { streakMap, getStreak };
}
```

This computes streaks for **all habits at once** using `useMemo`, then provides a `getStreak` lookup function. This approach:

1. Only recalculates when habits or completions change
2. Amortizes the cost - calculate once, look up many times
3. Uses `Map` for O(1) lookups by habit ID

The fallback in `getStreak` (`?? { ... }`) handles the case where a habit ID isn't in the map (e.g., a newly created habit with no completions yet).

---

## 8. Styling Architecture - CSS Custom Properties + Tailwind

### The Theming Strategy

> Source: [`src/app/globals.css`](../../src/app/globals.css)

```css
:root {
  --background: #ffffff;
  --foreground: #111827;
  --border: #e5e7eb;
  --muted: #f3f4f6;
  --muted-foreground: #6b7280;
  --primary: #6366f1;
  --primary-foreground: #ffffff;
  --destructive: #ef4444;
  --destructive-foreground: #ffffff;
  --card: #ffffff;
  --card-foreground: #111827;
  --accent: #f0f0ff;
  --accent-foreground: #4f46e5;
  --success: #22c55e;
}
```

These are **CSS custom properties** (also called CSS variables). They define the app's color palette in one place. The pattern comes from [shadcn/ui](https://ui.shadcn.com/) and it's designed for easy dark mode support - you'd add a `.dark` or `[data-theme="dark"]` selector with different values, and everything reskins automatically.

**Why not just use Tailwind's built-in colors directly?** Because semantic names like `--primary` and `--destructive` communicate _purpose_, not appearance. `bg-primary` means "the main brand color" - when you switch themes, primary might change from indigo to green, and every component updates automatically.

### Tailwind Configuration

> Source: [`tailwind.config.ts`](../../tailwind.config.ts)

```typescript
colors: {
  background: "var(--background)",
  foreground: "var(--foreground)",
  primary: "var(--primary)",
  "primary-foreground": "var(--primary-foreground)",
  // ...
},
```

This connects Tailwind utility classes to CSS variables. Now `bg-primary` generates `background-color: var(--primary)`, which resolves to `#6366f1` (indigo) based on the CSS variable.

### Custom Animations

```typescript
animation: {
  "check-bounce": "checkBounce 0.4s ease-out",
  "fade-in": "fadeIn 0.2s ease-out",
  "slide-up": "slideUp 0.3s ease-out",
  "toast-in": "toastIn 0.3s ease-out",
  "toast-out": "toastOut 0.3s ease-in forwards",
},
keyframes: {
  checkBounce: {
    "0%": { transform: "scale(0.8)" },
    "50%": { transform: "scale(1.15)" },
    "100%": { transform: "scale(1)" },
  },
  // ...
},
```

These are CSS `@keyframes` defined through Tailwind's config so they can be used as utility classes: `className="animate-check-bounce"`. The `checkBounce` keyframe creates a "squish and pop" effect for habit checkboxes.

### The Color Map System

> Source: [`src/lib/constants.ts`](../../src/lib/constants.ts)

```typescript
export const HABIT_COLOR_MAP: Record<
  HabitColor,
  { bg: string; bgLight: string; text: string }
> = {
  red: { bg: "bg-red-500", bgLight: "bg-red-100", text: "text-red-500" },
  orange: {
    bg: "bg-orange-500",
    bgLight: "bg-orange-100",
    text: "text-orange-500",
  },
  // ...
};
```

**Why store Tailwind class names as data?** Because Tailwind uses static analysis to determine which classes to include in the final CSS. You can't dynamically construct class names like `` `bg-${color}-500` `` - Tailwind wouldn't recognize those strings. By pre-defining all class names in a constant, Tailwind's scanner finds them and includes them in the build output.

This is a common Tailwind pattern: when you need dynamic colors, create a lookup table of full class names rather than building them dynamically.

---

## 9. Component Deep-Dives

### The HabitCheckItem - Animation-Rich Interaction

> Source: [`src/components/dashboard/HabitCheckItem.tsx`](../../src/components/dashboard/HabitCheckItem.tsx)

This is the component users interact with most. Let's break down every detail:

```typescript
interface HabitCheckItemProps {
  habit: Habit;
  isCompleted: boolean;
  currentStreak: number;
  longestStreak: number;
  onToggle: () => void;
}
```

**Props over internal state**: This component doesn't fetch its own data. The parent tells it everything: the habit object, whether it's completed, streak numbers, and what to do when clicked. This pattern makes the component **dumb** (it only renders) and the parent **smart** (it manages logic). Dumb components are easier to test and reuse.

```tsx
<button
  onClick={onToggle}
  className="shrink-0 min-w-[44px] min-h-[44px] flex items-center justify-center"
  aria-label={`${isCompleted ? "Uncheck" : "Check"} ${habit.name}`}
  role="checkbox"
  aria-checked={isCompleted}
>
```

The `min-w-[44px] min-h-[44px]` ensures a **44px touch target** - this is Apple's Human Interface Guidelines minimum for tap targets. Even though the visual circle is only 28px, the clickable area is 44px. `shrink-0` prevents it from shrinking in a flex container.

`aria-label` and `role="checkbox"` make this accessible to screen readers. A screen reader would announce: "Check Morning meditation, checkbox, not checked."

```tsx
<motion.div
  className={`w-7 h-7 rounded-full border-2 ...`}
  whileTap={{ scale: 0.85 }}
  animate={isCompleted ? { scale: [1, 1.2, 1] } : {}}
  transition={{ type: "spring", stiffness: 400, damping: 15 }}
>
```

The Framer Motion animation:

- `whileTap={{ scale: 0.85 }}` - Squishes to 85% while the user holds their finger down
- `animate={isCompleted ? { scale: [1, 1.2, 1] } : {}}` - When completed, bounces: normal -> 120% -> normal
- Spring physics (`stiffness: 400, damping: 15`) make the bounce feel organic, not robotic

```tsx
{isCompleted && (
  <motion.svg width="14" height="14" viewBox="0 0 14 14" ...>
    <motion.path
      d="M3 7l3 3 5-5"
      initial={{ pathLength: 0 }}
      animate={{ pathLength: 1 }}
      transition={{ duration: 0.2 }}
    />
  </motion.svg>
)}
```

The checkmark draws itself when it appears. `pathLength` goes from 0 (invisible) to 1 (fully drawn) over 0.2 seconds. This is a Framer Motion feature that animates SVG path length, creating a "hand-drawing" effect.

### The TrendsChart - SVG Data Visualization

> Source: [`src/components/dashboard/TrendsChart.tsx`](../../src/components/dashboard/TrendsChart.tsx)

This component renders a line chart entirely in SVG, with no charting library. Let's understand the math:

```typescript
const chartHeight = 120;
const chartPadding = 20;

const points = trendData.map((d, i) => {
  const x =
    chartPadding + (i / (trendData.length - 1 || 1)) * (300 - chartPadding * 2);
  const y =
    chartHeight -
    chartPadding -
    (d.rate / maxRate) * (chartHeight - chartPadding * 2);
  return { x, y, ...d };
});
```

**How the coordinate math works:**

SVG coordinates start at `(0, 0)` in the **top-left** corner. `y` increases _downward_. This is opposite to a normal chart where `y` increases upward. That's why the y-calculation subtracts from `chartHeight`.

For **x** (horizontal position):

- `i / (trendData.length - 1)` maps the data point index to a 0-1 range
- Multiplying by `(300 - chartPadding * 2)` scales it to the available width (300px minus padding on both sides)
- Adding `chartPadding` offsets from the left edge

For **y** (vertical position):

- `d.rate / maxRate` maps the completion rate to a 0-1 range
- Multiplying by the available height flips it into SVG coordinates
- `chartHeight - chartPadding` starts from the bottom of the chart area

```typescript
const pathData = points
  .map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`)
  .join(" ");
```

This generates an SVG path string like `"M 20 80 L 60 60 L 100 40 L 140 50"`:

- `M` = Move to (starting point, no line drawn)
- `L` = Line to (draws a straight line from current position)

```typescript
const areaPath = `${pathData} L ${points[points.length - 1].x} ${chartHeight - chartPadding} L ${points[0].x} ${chartHeight - chartPadding} Z`;
```

The **area fill** creates a closed shape: it traces the line path, then drops straight down to the baseline, walks back to the start, and closes with `Z`. This shaded area under the line is filled with a semi-transparent primary color (`opacity="0.1"`).

### The CalendarHeatmap - GitHub-Style Grid

> Source: [`src/components/calendar/CalendarHeatmap.tsx`](../../src/components/calendar/CalendarHeatmap.tsx)

This renders 365 days as a grid of tiny colored squares, organized into weeks (columns) and days (rows).

```typescript
const weeks = useMemo(() => {
  const result: (typeof heatmapData)[] = [];
  let currentWeek: typeof heatmapData = [];

  // Pad the first week with empty cells
  if (heatmapData.length > 0) {
    const firstDayOfWeek = getDayOfWeek(parseDateString(heatmapData[0].date));
    for (let i = 0; i < firstDayOfWeek; i++) {
      currentWeek.push({ date: "", count: 0, total: 0, intensity: 0 });
    }
  }

  for (const day of heatmapData) {
    currentWeek.push(day);
    if (currentWeek.length === 7) {
      result.push(currentWeek);
      currentWeek = [];
    }
  }
  // ...
}, [heatmapData]);
```

**Why pad the first week?** If the first day of data is a Wednesday (day index 3), the first week column needs 3 empty cells before it. Without padding, the day-of-week rows wouldn't align correctly - Monday wouldn't always be in the Monday row.

**The layout is a flex container of columns**, where each column is a week. This is different from a typical grid (rows of days) - it's columns of weeks because that's how GitHub's heatmap works, and it handles variable-length months gracefully.

### The Modal - Focus Management & Body Scroll Lock

> Source: [`src/components/ui/Modal.tsx`](../../src/components/ui/Modal.tsx)

```typescript
useEffect(() => {
  const handleEscape = (e: KeyboardEvent) => {
    if (e.key === "Escape") onClose();
  };

  if (isOpen) {
    document.addEventListener("keydown", handleEscape);
    document.body.style.overflow = "hidden"; // Prevents background scrolling
  }

  return () => {
    document.removeEventListener("keydown", handleEscape);
    document.body.style.overflow = ""; // Restores scrolling
  };
}, [isOpen, onClose]);
```

Two important UX patterns:

1. **Escape key closes the modal** - Standard keyboard interaction. The event listener is added when the modal opens and removed when it closes (in the cleanup function).

2. **Body scroll lock** - When a modal is open, setting `overflow: "hidden"` on the `<body>` prevents the background content from scrolling while you scroll inside the modal. The cleanup function restores the original overflow value.

```tsx
<AnimatePresence>
  {isOpen && (
    <div className="fixed inset-0 z-50 ...">
      <motion.div
        className="absolute inset-0 bg-black/50"      // Overlay
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}                              // Click overlay = close
      />
      <motion.div
        role="dialog"
        aria-modal="true"
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
      >
```

`AnimatePresence` is a Framer Motion component that enables **exit animations**. Normally, when a React component unmounts (removed from the DOM), it disappears instantly. `AnimatePresence` delays the removal until the exit animation finishes.

The dialog uses a spring animation that slightly scales up and moves into position, feeling like it "lands" on the screen.

### The Button - A ForwardRef Component

> Source: [`src/components/ui/Button.tsx`](../../src/components/ui/Button.tsx)

```typescript
const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = "primary", size = "md", className = "", disabled, children, ...props }, ref) => {
    return (
      <button ref={ref} className={`... ${variantClasses[variant]} ${sizeClasses[size]} ${className}`} ...>
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
```

`forwardRef` lets parent components get a direct reference to the underlying `<button>` DOM element. This is needed for things like programmatically focusing the button or measuring its dimensions.

**The variant/size pattern**: Instead of building CSS dynamically, the component has lookup tables:

```typescript
const variantClasses: Record<ButtonVariant, string> = {
  primary: "bg-primary text-primary-foreground hover:opacity-90",
  secondary: "bg-muted text-foreground hover:bg-gray-200",
  destructive: "bg-destructive text-destructive-foreground hover:opacity-90",
  ghost: "text-foreground hover:bg-muted",
};
```

This is cleaner than a chain of `if/else` statements and makes it trivial to add new variants.

`Button.displayName = "Button"` is needed because `forwardRef` wraps the component, which loses the original function name in React DevTools. Setting `displayName` restores it.

### The HabitForm - Validation Pattern

> Source: [`src/components/habits/HabitForm.tsx`](../../src/components/habits/HabitForm.tsx)

```typescript
const handleSubmit = (e: FormEvent) => {
  e.preventDefault();
  const formData: HabitFormData = { name, description, color };
  const validationErrors = validateHabitForm(formData);

  if (validationErrors.length > 0) {
    setErrors(validationErrors);
    return; // Stop here - don't submit
  }

  setErrors([]);
  onSubmit(formData);
};
```

`e.preventDefault()` stops the browser's default form submission behavior (which would reload the page). This is essential in single-page apps.

The validation is handled by a pure function (`validateHabitForm`) that returns an array of errors. If there are any, we display them and abort. If not, we clear previous errors and call the parent's submit handler.

```typescript
const getError = (field: string) =>
  errors.find((e) => e.field === field)?.message;
```

This finds the error message for a specific field. It uses optional chaining (`?.message`) so that if no error exists for that field, it returns `undefined` (which renders nothing in JSX).

The color picker demonstrates accessible interactive elements:

```tsx
<button
  type="button"                              // Prevents form submission
  onClick={() => setColor(c.value)}
  className={`w-8 h-8 rounded-full ${c.bg} ... min-w-[44px] min-h-[44px] ...
    ${color === c.value ? "ring-2 ring-offset-2 scale-110" : "hover:scale-105"}`}
  aria-label={c.label}                       // "Red", "Blue", etc.
  aria-pressed={color === c.value}           // Indicates selection state
>
```

`type="button"` is critical here. Without it, clicking a color button inside a `<form>` would trigger form submission (buttons default to `type="submit"` inside forms).

---

## 10. Routing & Layout

### Next.js App Router

> Source: [`src/app/layout.tsx`](../../src/app/layout.tsx)

Next.js 14 uses a file-system-based router. Each `page.tsx` inside `src/app/` becomes a route:

```
src/app/page.tsx         ->  /            (Dashboard)
src/app/habits/page.tsx  ->  /habits      (Habit Management)
src/app/settings/page.tsx -> /settings    (Settings)
```

The root `layout.tsx` wraps **all** pages:

```tsx
export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={`${inter.className} antialiased`}>
        <AppDataProvider>
          {" "}
          {/* State available to ALL pages */}
          <AppShell>{children}</AppShell> {/* Navigation wraps ALL pages */}
        </AppDataProvider>
      </body>
    </html>
  );
}
```

**The nesting matters:**

1. `<html>` and `<body>` - Standard HTML structure
2. `AppDataProvider` - Makes state available everywhere (via Context)
3. `AppShell` - Adds the top/bottom navigation bars
4. `{children}` - The page-specific content (Dashboard, Habits, or Settings)

This means navigation and state persist across page transitions - they don't re-mount. Only the `{children}` swaps out when you navigate.

### The AppShell - Responsive Navigation

> Source: [`src/components/layout/AppShell.tsx`](../../src/components/layout/AppShell.tsx)

```tsx
export default function AppShell({ children }: AppShellProps) {
  return (
    <div className="min-h-screen bg-background">
      <TopNav />
      <main className="mx-auto max-w-4xl px-4 py-6 pb-20 sm:pb-6">
        {children}
      </main>
      <BottomNav />
    </div>
  );
}
```

`pb-20 sm:pb-6` is a key responsive detail: on mobile, the bottom padding is `5rem` (80px) to prevent content from being hidden behind the fixed bottom navigation bar. On screens wider than 640px (`sm:`), the bottom nav is hidden and padding drops to normal.

`max-w-4xl` (56rem/896px) constrains content width on large screens. Combined with `mx-auto` (auto horizontal margins), content is centered with reasonable line lengths for readability.

### NavLink - Active State Detection

> Source: [`src/components/layout/NavLink.tsx`](../../src/components/layout/NavLink.tsx)

```typescript
const pathname = usePathname();
const isActive = pathname === href;
```

`usePathname()` is a Next.js hook that returns the current URL path. The comparison determines if this nav link points to the current page.

```tsx
<Link
  href={href}
  className={`... ${
    isActive
      ? "text-primary bg-accent"
      : "text-muted-foreground hover:text-foreground hover:bg-muted"
  }`}
  aria-current={isActive ? "page" : undefined}
>
  <NavIcon icon={icon} />
  <span className="hidden sm:inline">{label}</span> {/* Desktop: full label */}
  <span className="sm:hidden text-xs">{label}</span>{" "}
  {/* Mobile: smaller label */}
</Link>
```

`aria-current="page"` is an ARIA attribute that tells screen readers "this link points to the current page." It's the semantic equivalent of visual highlighting.

The two `<span>` elements handle responsive text sizes - on mobile (below `sm:` breakpoint), the text is smaller (`text-xs`). On desktop, the mobile span is hidden and the desktop span shows at normal size.

---

## 11. Data Flow End-to-End

Let's trace what happens when a user checks off a habit, from finger tap to localStorage save.

### Step 1: User taps the checkbox

In [`TodayHabits.tsx:60`](../../src/components/dashboard/TodayHabits.tsx), the `onToggle` prop is set:

```tsx
<HabitCheckItem onToggle={() => toggle(habit.id)} />
```

### Step 2: The hook calls the context method

`toggle` comes from `useCompletions()` in [`useCompletions.ts:26`](../../src/hooks/useCompletions.ts):

```typescript
const toggle = useCallback(
  (habitId: HabitId, date?: DateString) => {
    toggleHabitCompletion(habitId, date ?? todayStr);
  },
  [toggleHabitCompletion, todayStr],
);
```

Since no date is passed, it defaults to `todayStr` (today's date).

### Step 3: The context dispatches a reducer action

`toggleHabitCompletion` is defined in [`AppDataContext.tsx:136`](../../src/context/AppDataContext.tsx):

```typescript
const toggleHabitCompletion = useCallback(
  (habitId: HabitId, date: DateString) => {
    dispatch({ type: "TOGGLE_COMPLETION", payload: { habitId, date } });
  },
  [],
);
```

### Step 4: The reducer creates new state

The reducer at [`AppDataContext.tsx:73`](../../src/context/AppDataContext.tsx):

```typescript
case "TOGGLE_COMPLETION":
  return {
    ...state,
    completions: toggleCompletion(state.completions, action.payload.habitId, action.payload.date),
  };
```

### Step 5: The pure function does the actual work

`toggleCompletion` in [`completions.ts:11`](../../src/lib/completions.ts) either adds or removes the habit ID from the date's completion array, returning a new completions object.

### Step 6: React detects the state change

Because the reducer returned a **new object** (not a mutation), React's `useReducer` triggers a re-render of every component subscribed to the context.

### Step 7: The persistence effect fires

The `useEffect` at [`AppDataContext.tsx:104`](../../src/context/AppDataContext.tsx) detects the `data` change:

```typescript
useEffect(() => {
  if (isInitialized) {
    saveAppData(data);
  }
}, [data, isInitialized]);
```

### Step 8: localStorage is updated

`saveAppData` in [`storage.ts:27`](../../src/lib/storage.ts) serializes the entire state to JSON and writes it.

### Step 9: UI updates

All components that read completion data re-render:

- The checkbox animates to its new state (bounces + checkmark draws)
- The "X/Y completed" counter updates
- Streak numbers recalculate
- The stats overview refreshes

All of this happens in a single synchronous render cycle - the user sees it all update at once, with only the animations taking additional time.

---

## 12. Animations with Framer Motion

The app uses [Framer Motion](https://www.framer.com/motion/) for physics-based animations. Here are the key patterns:

### Motion Components

Framer Motion provides drop-in replacements for HTML elements:

```tsx
import { motion } from "framer-motion";

// Instead of <div>, use <motion.div>
<motion.div
  initial={{ opacity: 0 }} // Starting state
  animate={{ opacity: 1 }} // End state
  exit={{ opacity: 0 }} // State when removed
  transition={{ duration: 0.3 }} // How the animation runs
/>;
```

### Spring Physics

```tsx
<motion.div
  transition={{ type: "spring", stiffness: 400, damping: 15 }}
>
```

Instead of specifying duration and easing, spring animations simulate real physics:

- **Stiffness**: How tight the spring is (higher = snappier)
- **Damping**: How much friction (lower = more bouncy, higher = less overshoot)

This creates natural-feeling motion that's hard to achieve with CSS `ease-in-out`.

### SVG Path Animation

```tsx
<motion.path
  d="M3 7l3 3 5-5" // Checkmark shape
  initial={{ pathLength: 0 }} // Nothing drawn
  animate={{ pathLength: 1 }} // Fully drawn
  transition={{ duration: 0.2 }}
/>
```

`pathLength` is a special Framer Motion property for SVG paths. It animates from 0 (no visible path) to 1 (full path), creating a "drawing" animation. This only works with `motion.path`, not regular `<path>`.

### AnimatePresence for Exit Animations

```tsx
<AnimatePresence>
  {isOpen && (
    <motion.div exit={{ opacity: 0, scale: 0.95 }}>
      {/* Modal content */}
    </motion.div>
  )}
</AnimatePresence>
```

Without `AnimatePresence`, when `isOpen` becomes `false`, React immediately removes the modal from the DOM - no exit animation. `AnimatePresence` intercepts the unmount, plays the `exit` animation, and _then_ removes it.

### Layout Animations (Toasts)

```tsx
<motion.div layout>
```

The `layout` prop automatically animates position changes. When a toast is dismissed and the remaining toasts shift up, `layout` smoothly animates the movement instead of jumping.

---

## 13. Accessibility Patterns

The app follows web accessibility best practices throughout.

### Semantic ARIA Attributes

```tsx
// Checkbox semantics for the habit toggle
<button role="checkbox" aria-checked={isCompleted} aria-label={`Check ${habit.name}`}>

// Modal semantics
<div role="dialog" aria-modal="true" aria-label={title}>

// Navigation state
<Link aria-current={isActive ? "page" : undefined}>

// Color picker buttons
<button aria-label={c.label} aria-pressed={color === c.value}>
```

### Touch Target Sizes

Every interactive element has a minimum 44x44px tap target:

```tsx
className = "min-w-[44px] min-h-[44px]";
```

This follows Apple's Human Interface Guidelines and WCAG 2.5.5 (Target Size). Even if the visual button is smaller, the tap area is always 44px.

### Keyboard Navigation

- **Escape key** closes modals ([`Modal.tsx:17`](../../src/components/ui/Modal.tsx))
- **Focus ring** via `focus-visible:ring-2` on all interactive elements
- **Global focus style** defined in [`globals.css:28`](../../src/app/globals.css):
  ```css
  @layer base {
    *:focus-visible {
      @apply outline-2 outline-offset-2 outline-primary;
    }
  }
  ```

`focus-visible` (not `focus`) means the ring only appears on keyboard navigation, not mouse clicks. This is the modern best practice.

### Color + Text

Completed habits show both a color change (strikethrough + gray) and text decoration (line-through). This communicates state through multiple channels, not just color, helping colorblind users.

---

## 14. Key Design Decisions & Trade-offs

### localStorage vs. Backend Database

**Chosen: localStorage**

Pros:

- Zero infrastructure cost
- No user authentication needed
- Instant reads/writes (no network latency)
- Complete privacy (data never leaves the device)
- Works offline

Cons:

- Data lost if browser storage is cleared
- No sync across devices
- ~5MB storage limit
- No collaborative features

**Mitigation**: Export/import functionality lets users backup and transfer data manually.

### Single Context vs. Multiple Contexts

**Chosen: Single context (`AppDataContext`)**

The entire app state lives in one context. This means _any_ state change re-renders _all_ subscribed components, even if they only care about one part of the state.

**Why this is fine here**: The app is small enough that re-renders are cheap. The components use `useMemo` and `useCallback` to minimize actual DOM updates. For a larger app with many independent state slices, you'd split into multiple contexts (e.g., `HabitContext`, `CompletionContext`, `SettingsContext`).

### Pure Functions in lib/ vs. Logic in Hooks

**Chosen: Pure functions**

All business logic (validation, streak calculation, completion toggling) lives in `lib/` as plain functions. Hooks just wire these functions to React state.

**Why**: Pure functions are trivially testable, composable, and framework-agnostic. If we later add a backend API or migrate to a different framework, the logic layer moves unchanged. Only the hooks layer needs rewriting.

### Client Components ("use client") Everywhere

Next.js 14 defaults to Server Components. This app uses `"use client"` on every interactive component. **Why?**

Server Components can't use:

- `useState`, `useEffect`, `useReducer` (state/lifecycle)
- `useContext` (context)
- Event handlers (`onClick`, `onChange`)
- Browser APIs (`localStorage`, `document`)

Since this is an entirely client-side app with no server data fetching, almost every component needs at least one of these features. The `"use client"` directive at the top of a file tells Next.js to render it on the client.

The route page files (`app/page.tsx`, etc.) themselves don't have `"use client"` because they just render a client component, which keeps them as Server Components for metadata handling.

### No External Charting Library

**Chosen: Hand-rolled SVG**

The TrendsChart and CalendarHeatmap use raw SVG instead of Chart.js, D3, or Recharts.

**Why**:

- Zero additional dependencies (smaller bundle)
- Full control over appearance and animation
- The visualizations are simple enough that a library adds complexity without proportional benefit
- SVG integrates naturally with React and Tailwind

**When you'd want a library**: For complex charts (multiple series, interactive zoom, tooltips with positioning logic, responsive axis labels), a charting library saves significant development time.

### Immutable State Updates

Every state change creates new objects:

```typescript
// Instead of this (mutation):
state.habits.push(newHabit);
return state;

// We do this (immutable):
return { ...state, habits: [...state.habits, newHabit] };
```

**Why**: React relies on **referential equality** (`===`) to detect changes. If you mutate the existing object, the reference stays the same, and React won't re-render. Creating new objects guarantees React sees the change.

The spread syntax (`...`) creates shallow copies. For nested objects, you need to spread at each level:

```typescript
// Updating a nested property immutably:
return {
  ...state, // Copy top level
  habits: state.habits.map(
    (h) =>
      h.id === id
        ? { ...h, isArchived: true } // Copy the habit, change one field
        : h, // Keep other habits unchanged
  ),
};
```

---

## Appendix: File Reference

| File                                                                                               | Purpose                              |
| -------------------------------------------------------------------------------------------------- | ------------------------------------ |
| [`src/types/index.ts`](../../src/types/index.ts)                                                   | All TypeScript types                 |
| [`src/context/AppDataContext.tsx`](../../src/context/AppDataContext.tsx)                           | State management (reducer + context) |
| [`src/lib/dates.ts`](../../src/lib/dates.ts)                                                       | Date formatting and math             |
| [`src/lib/completions.ts`](../../src/lib/completions.ts)                                           | Completion record operations         |
| [`src/lib/streaks.ts`](../../src/lib/streaks.ts)                                                   | Streak calculations                  |
| [`src/lib/stats.ts`](../../src/lib/stats.ts)                                                       | Dashboard stats and chart data       |
| [`src/lib/habits.ts`](../../src/lib/habits.ts)                                                     | Habit CRUD and validation            |
| [`src/lib/storage.ts`](../../src/lib/storage.ts)                                                   | localStorage persistence             |
| [`src/lib/export.ts`](../../src/lib/export.ts)                                                     | Data export/import                   |
| [`src/lib/constants.ts`](../../src/lib/constants.ts)                                               | Color maps, defaults, limits         |
| [`src/lib/id.ts`](../../src/lib/id.ts)                                                             | UUID generation                      |
| [`src/hooks/useAppData.ts`](../../src/hooks/useAppData.ts)                                         | Context access hook                  |
| [`src/hooks/useHabits.ts`](../../src/hooks/useHabits.ts)                                           | Memoized habit lists                 |
| [`src/hooks/useCompletions.ts`](../../src/hooks/useCompletions.ts)                                 | Completion queries and toggles       |
| [`src/hooks/useStreaks.ts`](../../src/hooks/useStreaks.ts)                                         | Streak calculation cache             |
| [`src/hooks/useToast.ts`](../../src/hooks/useToast.ts)                                             | Toast notification state             |
| [`src/hooks/useLocalStorage.ts`](../../src/hooks/useLocalStorage.ts)                               | Generic localStorage hook            |
| [`src/hooks/useMediaQuery.ts`](../../src/hooks/useMediaQuery.ts)                                   | Responsive breakpoint detection      |
| [`src/app/layout.tsx`](../../src/app/layout.tsx)                                                   | Root layout with providers           |
| [`src/app/globals.css`](../../src/app/globals.css)                                                 | CSS variables and base styles        |
| [`tailwind.config.ts`](../../tailwind.config.ts)                                                   | Tailwind theme extensions            |
| [`src/components/layout/AppShell.tsx`](../../src/components/layout/AppShell.tsx)                   | App wrapper with navigation          |
| [`src/components/layout/NavLink.tsx`](../../src/components/layout/NavLink.tsx)                     | Navigation link with active state    |
| [`src/components/dashboard/DashboardPage.tsx`](../../src/components/dashboard/DashboardPage.tsx)   | Dashboard container                  |
| [`src/components/dashboard/HabitCheckItem.tsx`](../../src/components/dashboard/HabitCheckItem.tsx) | Animated habit checkbox              |
| [`src/components/dashboard/TrendsChart.tsx`](../../src/components/dashboard/TrendsChart.tsx)       | SVG line chart                       |
| [`src/components/calendar/CalendarHeatmap.tsx`](../../src/components/calendar/CalendarHeatmap.tsx) | GitHub-style heatmap                 |
| [`src/components/habits/HabitForm.tsx`](../../src/components/habits/HabitForm.tsx)                 | Habit create/edit form               |
| [`src/components/ui/Button.tsx`](../../src/components/ui/Button.tsx)                               | Reusable button component            |
| [`src/components/ui/Modal.tsx`](../../src/components/ui/Modal.tsx)                                 | Animated modal dialog                |
