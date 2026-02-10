# Streaks - Developer Documentation

> Technical specification for current streak and longest streak calculations.

**User guide**: [How to Build Streaks](../user/how-to-build-streaks.md)
**Related**: [Daily Tracking](./daily-tracking.md) | [Dashboard & Analytics](./dashboard-analytics.md) | [Annotated Walkthrough](./annotate.md)

---

## Overview

Streaks measure consecutive days of habit completion. The system tracks two metrics per habit:
- **Current Streak**: How many consecutive days ending at today (or yesterday)
- **Longest Streak**: The best consecutive run ever achieved, with start/end dates

Streaks are calculated on-the-fly from the `CompletionRecord` - they are not stored separately.

## Data Model

### StreakInfo

> Source: [`src/types/index.ts:35-41`](../../src/types/index.ts)

```typescript
interface StreakInfo {
  habitId: HabitId;
  currentStreak: number;
  longestStreak: number;
  longestStreakStart: string | null;   // DateString or null if no completions
  longestStreakEnd: string | null;     // DateString or null if no completions
}
```

## File Map

| File | Responsibility |
|------|---------------|
| [`src/lib/streaks.ts`](../../src/lib/streaks.ts) | Pure streak calculation functions |
| [`src/hooks/useStreaks.ts`](../../src/hooks/useStreaks.ts) | Memoized streak hook |
| [`src/components/dashboard/StreakDisplay.tsx`](../../src/components/dashboard/StreakDisplay.tsx) | Streak badge UI |

## Algorithms

### calculateCurrentStreak

> Source: [`src/lib/streaks.ts:6-33`](../../src/lib/streaks.ts)

```typescript
function calculateCurrentStreak(
  completions: CompletionRecord,
  habitId: HabitId,
  fromDate?: Date
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

**Algorithm**:
1. Start at today (or the provided `fromDate`)
2. If today is **completed**: count it and walk backwards
3. If today is **not completed**: start from yesterday instead
4. Count consecutive completed days going backwards until a gap is found

**The "today grace period"**: If it's 9 AM and the user hasn't checked off their habit yet, the streak shouldn't drop to 0. By falling back to yesterday, the streak remains intact until midnight passes without a completion.

**Time complexity**: O(streak length) - walks backwards day by day. For a 100-day streak, it checks 100 dates.

### calculateLongestStreak

> Source: [`src/lib/streaks.ts:35-81`](../../src/lib/streaks.ts)

```typescript
function calculateLongestStreak(
  completions: CompletionRecord,
  habitId: HabitId
): { length: number; start: DateString | null; end: DateString | null } {
  // 1. Collect all completed dates for this habit
  const completedDates: DateString[] = [];
  for (const [date, ids] of Object.entries(completions)) {
    if (ids.includes(habitId)) {
      completedDates.push(date);
    }
  }

  if (completedDates.length === 0) {
    return { length: 0, start: null, end: null };
  }

  // 2. Sort chronologically
  completedDates.sort();

  // 3. Find longest consecutive run
  let longestLength = 1;
  let currentLength = 1;
  let longestStart = completedDates[0];
  let longestEnd = completedDates[0];
  let currentStart = completedDates[0];

  for (let i = 1; i < completedDates.length; i++) {
    const prev = new Date(completedDates[i - 1]);
    const curr = new Date(completedDates[i]);
    const diffMs = curr.getTime() - prev.getTime();
    const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 1) {
      currentLength++;           // Consecutive - extend current run
    } else {
      currentLength = 1;         // Gap found - reset current run
      currentStart = completedDates[i];
    }

    if (currentLength > longestLength) {
      longestLength = currentLength;
      longestStart = currentStart;
      longestEnd = completedDates[i];
    }
  }

  return { length: longestLength, start: longestStart, end: longestEnd };
}
```

**Algorithm**:
1. Collect all dates where this habit appears in completions
2. Sort dates (YYYY-MM-DD format sorts lexicographically)
3. Walk through sorted dates, checking if each pair is consecutive (1 day apart)
4. Track current run length and longest run length
5. Return the longest run with start/end dates

**Why `Math.round` for day difference?** Daylight Saving Time transitions create 23-hour or 25-hour "days". Without rounding, a DST transition could produce `diffDays = 0.958...` instead of `1`, incorrectly breaking a streak.

**Time complexity**: O(n log n) for sorting + O(n) for the walk, where n = total completed dates for this habit.

### calculateStreakInfo

> Source: [`src/lib/streaks.ts:83-97`](../../src/lib/streaks.ts)

```typescript
function calculateStreakInfo(
  completions: CompletionRecord,
  habitId: HabitId
): StreakInfo {
  const currentStreak = calculateCurrentStreak(completions, habitId);
  const longest = calculateLongestStreak(completions, habitId);

  return {
    habitId,
    currentStreak,
    longestStreak: longest.length,
    longestStreakStart: longest.start,
    longestStreakEnd: longest.end,
  };
}
```

Convenience wrapper that bundles both calculations into a single `StreakInfo` object.

## Hook: useStreaks

> Source: [`src/hooks/useStreaks.ts`](../../src/hooks/useStreaks.ts)

```typescript
function useStreaks() {
  const { data } = useAppData();

  const streakMap = useMemo(() => {
    const map = new Map<HabitId, StreakInfo>();
    for (const habit of data.habits) {
      map.set(habit.id, calculateStreakInfo(data.completions, habit.id));
    }
    return map;
  }, [data.habits, data.completions]);

  const getStreak = (habitId: HabitId): StreakInfo => {
    return streakMap.get(habitId) ?? {
      habitId,
      currentStreak: 0,
      longestStreak: 0,
      longestStreakStart: null,
      longestStreakEnd: null,
    };
  };

  return { streakMap, getStreak };
}
```

**Batch calculation**: Computes streaks for ALL habits in a single memoized pass. This is more efficient than calculating per-component because it avoids repeated iterations over the completions record.

**Fallback**: `getStreak` returns zero-valued defaults for unknown habit IDs rather than crashing.

**Memoization dependencies**: Recalculates only when `data.habits` or `data.completions` change.

## UI: StreakDisplay

> Source: [`src/components/dashboard/StreakDisplay.tsx`](../../src/components/dashboard/StreakDisplay.tsx)

Renders two inline badges:
- **Current streak**: Flame icon + `Xd` (orange color when streak > 0)
- **Longest streak**: Chart icon + `Xd best`

Only shown when at least one streak value is > 0.

## Integration with Dashboard Stats

The `calculateDashboardStats` function in [`src/lib/stats.ts:18-24`](../../src/lib/stats.ts) uses `calculateCurrentStreak` to find the "Best Streak" across all active habits:

```typescript
let currentBestStreak = 0;
for (const habit of active) {
  const streak = calculateCurrentStreak(completions, habit.id);
  if (streak > currentBestStreak) {
    currentBestStreak = streak;
  }
}
```

## Edge Cases

| Scenario | Current Streak | Longest Streak |
|----------|---------------|----------------|
| No completions ever | 0 | 0 |
| Only today completed | 1 | 1 |
| Today not completed, yesterday was | streak from yesterday backwards | unaffected |
| Gap of 2+ days | 0 (if gap is recent) | unaffected |
| Habit deleted | N/A (completion records deleted) | N/A |
| Single isolated day | 1 (if recent) | 1 |
| DST transition mid-streak | Correctly handled via `Math.round` | Same |
