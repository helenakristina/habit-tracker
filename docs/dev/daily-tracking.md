# Daily Tracking - Developer Documentation

> Technical specification for the habit completion system: checking off habits, toggling completions, and the underlying data structure.

**User guide**: [How to Track Habits Daily](../user/how-to-track-daily.md)
**Related**: [Habit Management](./habit-management.md) | [Streaks](./streaks.md) | [Dashboard & Analytics](./dashboard-analytics.md) | [Annotated Walkthrough](./annotate.md)

---

## Overview

Daily tracking is the core interaction loop: users check off habits each day. The system records which habits were completed on which dates using a `CompletionRecord` data structure. Toggle behavior means tapping a completed habit unchecks it.

## Data Model

### CompletionRecord

> Source: [`src/types/index.ts:26`](../../src/types/index.ts)

```typescript
type CompletionRecord = Record<DateString, HabitId[]>;
```

A dictionary keyed by `"YYYY-MM-DD"` date strings, where each value is an array of habit UUIDs completed on that date:

```json
{
  "2025-01-15": ["abc-123", "def-456"],
  "2025-01-16": ["abc-123"],
  "2025-01-17": ["abc-123", "def-456", "ghi-789"]
}
```

**Design rationale**: Keying by date (rather than storing completions per-habit) makes the most common queries fast:
- "What did I complete today?" = single key lookup
- "How many habits completed on date X?" = `completions[X].length`
- Empty dates have no entry at all (saves space)

### DateString

```typescript
type DateString = string; // Format: "YYYY-MM-DD"
```

All dates are formatted through `toDateString()` which uses `date-fns/format` with pattern `"yyyy-MM-dd"`. This format sorts correctly as plain strings.

## File Map

| File | Responsibility |
|------|---------------|
| [`src/lib/completions.ts`](../../src/lib/completions.ts) | Pure functions for completion operations |
| [`src/lib/dates.ts`](../../src/lib/dates.ts) | Date formatting and helpers |
| [`src/hooks/useCompletions.ts`](../../src/hooks/useCompletions.ts) | React hook wrapping completion logic |
| [`src/context/AppDataContext.tsx`](../../src/context/AppDataContext.tsx) | State management, TOGGLE_COMPLETION action |
| [`src/components/dashboard/TodayHabits.tsx`](../../src/components/dashboard/TodayHabits.tsx) | Today's habit checklist |
| [`src/components/dashboard/HabitCheckItem.tsx`](../../src/components/dashboard/HabitCheckItem.tsx) | Individual checkbox row |

## Core Functions

### isHabitCompleted

> Source: [`src/lib/completions.ts:3-9`](../../src/lib/completions.ts)

```typescript
function isHabitCompleted(
  completions: CompletionRecord,
  habitId: HabitId,
  date: DateString
): boolean {
  return completions[date]?.includes(habitId) ?? false;
}
```

Returns `true` if the habit ID exists in the array for the given date. Uses optional chaining (`?.`) to handle dates with no entries, and nullish coalescing (`??`) to default to `false`.

### toggleCompletion

> Source: [`src/lib/completions.ts:11-29`](../../src/lib/completions.ts)

```typescript
function toggleCompletion(
  completions: CompletionRecord,
  habitId: HabitId,
  date: DateString
): CompletionRecord {
  const dayCompletions = completions[date] ?? [];
  const updated = { ...completions };

  if (dayCompletions.includes(habitId)) {
    updated[date] = dayCompletions.filter((id) => id !== habitId);
    if (updated[date].length === 0) {
      delete updated[date];
    }
  } else {
    updated[date] = [...dayCompletions, habitId];
  }

  return updated;
}
```

**Immutable toggle**: Creates a shallow copy of completions, then either:
- **Removes** the habit ID (if already present) using `filter`
- **Adds** the habit ID (if absent) using spread

**Cleanup**: If removing the last habit from a date, the date key is deleted entirely. This keeps the completions object lean - no `"2025-01-15": []` entries.

### getCompletedHabitsForDate

> Source: [`src/lib/completions.ts:31-36`](../../src/lib/completions.ts)

```typescript
function getCompletedHabitsForDate(
  completions: CompletionRecord,
  date: DateString
): HabitId[] {
  return completions[date] ?? [];
}
```

Returns the array of completed habit IDs for a date, or an empty array if no completions exist.

### getCompletionCountForDate

> Source: [`src/lib/completions.ts:38-45`](../../src/lib/completions.ts)

```typescript
function getCompletionCountForDate(
  completions: CompletionRecord,
  date: DateString,
  activeHabitIds: HabitId[]
): number {
  const dayCompletions = completions[date] ?? [];
  return dayCompletions.filter((id) => activeHabitIds.includes(id)).length;
}
```

Counts completions for a date, but **only for active habits**. This is important for stats: if a habit was deleted, its old completion records shouldn't inflate the count.

### removeHabitFromCompletions

> Source: [`src/lib/completions.ts:47-59`](../../src/lib/completions.ts)

```typescript
function removeHabitFromCompletions(
  completions: CompletionRecord,
  habitId: HabitId
): CompletionRecord {
  const updated: CompletionRecord = {};
  for (const [date, ids] of Object.entries(completions)) {
    const filtered = ids.filter((id) => id !== habitId);
    if (filtered.length > 0) {
      updated[date] = filtered;
    }
  }
  return updated;
}
```

Called when a habit is permanently deleted. Iterates every date and removes the habit ID. Dates that become empty are omitted from the new record.

## Hook: useCompletions

> Source: [`src/hooks/useCompletions.ts`](../../src/hooks/useCompletions.ts)

```typescript
function useCompletions() {
  const { data, toggleHabitCompletion } = useAppData();
  const todayStr = today();

  const isCompleted = useCallback(
    (habitId: HabitId, date?: DateString) => {
      return isHabitCompleted(data.completions, habitId, date ?? todayStr);
    },
    [data.completions, todayStr]
  );

  const todayCompletions = useMemo(
    () => getCompletedHabitsForDate(data.completions, todayStr),
    [data.completions, todayStr]
  );

  const toggle = useCallback(
    (habitId: HabitId, date?: DateString) => {
      toggleHabitCompletion(habitId, date ?? todayStr);
    },
    [toggleHabitCompletion, todayStr]
  );

  return { isCompleted, todayCompletions, toggle, completions: data.completions };
}
```

**Today-aware API**: Both `isCompleted` and `toggle` default to today's date when no date is passed. This keeps the calling code clean:

```typescript
// In a component:
const { isCompleted, toggle } = useCompletions();
isCompleted(habitId);       // checks today
toggle(habitId);            // toggles today
toggle(habitId, "2025-01-10"); // toggles a specific date
```

**Memoization**: `todayCompletions` is memoized to avoid recalculating on every render. `isCompleted` and `toggle` use `useCallback` to maintain stable references.

## Data Flow: Checking Off a Habit

```
1. User taps checkbox (HabitCheckItem)
       |
2. onToggle() callback fires
       |
3. TodayHabits passes: () => toggle(habit.id)
       |
4. useCompletions.toggle(habitId) calls
   toggleHabitCompletion(habitId, todayStr)
       |
5. Context dispatches:
   { type: "TOGGLE_COMPLETION", payload: { habitId, date } }
       |
6. Reducer calls toggleCompletion() pure function
       |
7. New completions object returned
       |
8. React detects state change, re-renders
       |
9. useEffect saves to localStorage
       |
10. UI updates:
    - Checkbox animates (bounce + checkmark draw)
    - "X/Y completed" counter updates
    - Streak numbers recalculate
    - Stats refresh
```

## UI Component: HabitCheckItem

> Source: [`src/components/dashboard/HabitCheckItem.tsx`](../../src/components/dashboard/HabitCheckItem.tsx)

```typescript
interface HabitCheckItemProps {
  habit: Habit;
  isCompleted: boolean;
  currentStreak: number;
  longestStreak: number;
  onToggle: () => void;
}
```

**Props-driven design**: The component receives all data and callbacks from its parent. It doesn't fetch any data itself. This makes it a "dumb" presentational component.

**Touch target**: `min-w-[44px] min-h-[44px]` ensures the button meets Apple's 44px minimum touch target even though the visible circle is 28px.

**Accessibility attributes**:
- `role="checkbox"` - Screen readers announce it as a checkbox
- `aria-checked={isCompleted}` - Announces checked/unchecked state
- `aria-label` - Announces "Check Morning meditation" or "Uncheck Morning meditation"

**Animation** (via Framer Motion):
- `whileTap={{ scale: 0.85 }}` - Squishes on press
- `animate={isCompleted ? { scale: [1, 1.2, 1] } : {}}` - Bounces when checked
- Checkmark SVG animates with `pathLength: 0 -> 1` (drawing effect)
- Spring physics: `stiffness: 400, damping: 15`

**Visual states**:
- Unchecked: Gray circle border (`border-gray-300`)
- Checked: Colored circle (habit's color) with white checkmark
- Text: Completed habits show `line-through` and muted color

## UI Component: TodayHabits

> Source: [`src/components/dashboard/TodayHabits.tsx`](../../src/components/dashboard/TodayHabits.tsx)

Container that renders the "Today" card on the dashboard:

1. Uses `useHabits()` for active habit list
2. Uses `useCompletions()` for completion checks and toggles
3. Uses `useStreaks()` for streak data per habit
4. Shows `completedCount / activeHabits.length` progress
5. Renders `HabitCheckItem` for each active habit
6. Empty state with link to `/habits` when no habits exist

## Edge Cases

| Scenario | Behavior |
|----------|----------|
| Toggle habit that doesn't exist in completions | Creates new date entry with single habit ID |
| Toggle last habit for a date | Removes the date key entirely |
| Habit deleted after being completed | `removeHabitFromCompletions` cleans all records |
| Check archived habit | Not possible - archived habits don't appear in Today |
| Multiple rapid toggles | Each creates a new state object; React batches re-renders |
