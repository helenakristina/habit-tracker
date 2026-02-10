# Dashboard & Analytics - Developer Documentation

> Technical specification for the dashboard stats, trends chart, and activity heatmap.

**User guide**: [How to Read Your Dashboard](../user/how-to-read-dashboard.md)
**Related**: [Daily Tracking](./daily-tracking.md) | [Streaks](./streaks.md) | [Annotated Walkthrough](./annotate.md)

---

## Overview

The dashboard is the app's home page (`/`). It surfaces four key metrics, a completion trends chart (7D/30D), today's habit checklist, and a GitHub-style activity heatmap covering the past year.

## File Map

| File | Responsibility |
|------|---------------|
| [`src/app/page.tsx`](../../src/app/page.tsx) | Route entry point |
| [`src/components/dashboard/DashboardPage.tsx`](../../src/components/dashboard/DashboardPage.tsx) | Page container, loading state |
| [`src/components/dashboard/StatsOverview.tsx`](../../src/components/dashboard/StatsOverview.tsx) | 4-card stats grid |
| [`src/components/dashboard/StatCard.tsx`](../../src/components/dashboard/StatCard.tsx) | Individual stat card |
| [`src/components/dashboard/TodayHabits.tsx`](../../src/components/dashboard/TodayHabits.tsx) | Today's checklist |
| [`src/components/dashboard/TrendsChart.tsx`](../../src/components/dashboard/TrendsChart.tsx) | SVG line chart |
| [`src/components/calendar/CalendarHeatmap.tsx`](../../src/components/calendar/CalendarHeatmap.tsx) | Year-long heatmap |
| [`src/components/calendar/HeatmapCell.tsx`](../../src/components/calendar/HeatmapCell.tsx) | Single heatmap day |
| [`src/components/calendar/HeatmapLegend.tsx`](../../src/components/calendar/HeatmapLegend.tsx) | Intensity legend |
| [`src/lib/stats.ts`](../../src/lib/stats.ts) | All stat/chart/heatmap calculations |

## Page Layout

> Source: [`src/components/dashboard/DashboardPage.tsx`](../../src/components/dashboard/DashboardPage.tsx)

```
+---------------------------------------+
| Dashboard (h1)                        |
+---------------------------------------+
| [Total] [Today] [Streak] [30D Rate]   |  <- StatsOverview
+-------------------+-------------------+
| Today's Habits    | Trends Chart      |  <- Grid (1 col mobile, 2 col desktop)
| [ ] Habit 1       | ~~~ line chart ~~~|
| [x] Habit 2       |                   |
+-------------------+-------------------+
| Activity Heatmap (365 days)           |  <- CalendarHeatmap
| [][][][][][] ... [][][][][][]         |
+---------------------------------------+
```

**Loading state**: While `isLoading` is true (localStorage not yet hydrated), a skeleton is shown:
- Pulsing rectangle for the title
- 4 pulsing cards in a 2x2 (mobile) / 4-column (desktop) grid
- One large pulsing rectangle for the chart area

## Statistics

### calculateDashboardStats

> Source: [`src/lib/stats.ts:8-46`](../../src/lib/stats.ts)

```typescript
function calculateDashboardStats(
  habits: Habit[],
  completions: CompletionRecord
): DashboardStats {
  const active = getActiveHabits(habits);
  const activeIds = active.map((h) => h.id);
  const todayStr = today();

  // 1. Total active habits
  const totalHabits = active.length;

  // 2. Completed today
  const completedToday = getCompletionCountForDate(completions, todayStr, activeIds);

  // 3. Best current streak across all habits
  let currentBestStreak = 0;
  for (const habit of active) {
    const streak = calculateCurrentStreak(completions, habit.id);
    if (streak > currentBestStreak) currentBestStreak = streak;
  }

  // 4. 30-day overall completion rate
  const last30 = getLastNDays(30);
  let totalPossible = 0;
  let totalCompleted = 0;

  for (const date of last30) {
    const habitsOnDate = active.filter(
      (h) => toDateString(new Date(h.createdAt)) <= date
    );
    totalPossible += habitsOnDate.length;
    totalCompleted += getCompletionCountForDate(
      completions, date, habitsOnDate.map((h) => h.id)
    );
  }

  const overallCompletionRate = totalPossible > 0
    ? Math.round((totalCompleted / totalPossible) * 100) : 0;

  return { totalHabits, completedToday, currentBestStreak, overallCompletionRate };
}
```

**Key detail: `createdAt`-aware rate calculation**. When calculating the 30-day rate, habits are only counted for dates *on or after* their creation. A habit created 3 days ago won't penalize the rate for the 27 days before it existed. The comparison `toDateString(new Date(h.createdAt)) <= date` works because "YYYY-MM-DD" strings sort lexicographically.

### Stat Cards

The `StatsOverview` renders four `StatCard` components:

| Card | Value | Sub-label |
|------|-------|-----------|
| Total Habits | `stats.totalHabits` | - |
| Done Today | `stats.completedToday` | `/N` (total active habits) |
| Best Streak | `stats.currentBestStreak` | `days` |
| 30-Day Rate | `stats.overallCompletionRate` | `%` |

Layout: `grid grid-cols-2 sm:grid-cols-4` (2x2 on mobile, 4-across on desktop).

## Trends Chart

### calculateTrendData

> Source: [`src/lib/stats.ts:48-64`](../../src/lib/stats.ts)

```typescript
function calculateTrendData(
  habits: Habit[],
  completions: CompletionRecord,
  days: number
): TrendDataPoint[] {
  const active = getActiveHabits(habits);
  const dateRange = getLastNDays(days);  // Chronological array of DateStrings

  return dateRange.map((date) => {
    const habitsOnDate = active.filter(
      (h) => toDateString(new Date(h.createdAt)) <= date
    );
    const total = habitsOnDate.length;
    const completed = getCompletionCountForDate(
      completions, date, habitsOnDate.map((h) => h.id)
    );
    const rate = total > 0 ? Math.round((completed / total) * 100) : 0;

    return { date, completed, total, rate };
  });
}
```

Returns an array of `TrendDataPoint` objects, one per day:

```typescript
interface TrendDataPoint {
  date: DateString;
  completed: number;   // Number of habits completed
  total: number;       // Number of habits that existed on this date
  rate: number;        // Percentage: (completed / total) * 100
}
```

### SVG Chart Rendering

> Source: [`src/components/dashboard/TrendsChart.tsx`](../../src/components/dashboard/TrendsChart.tsx)

The chart is a hand-rolled SVG (no charting library). Key dimensions:
- ViewBox: `0 0 300 120`
- Padding: 20px on all sides
- Chart area: 260px wide, 80px tall

**Coordinate mapping**:

```typescript
const points = trendData.map((d, i) => {
  // X: spread data points evenly across width
  const x = chartPadding + (i / (trendData.length - 1 || 1)) * (300 - chartPadding * 2);
  // Y: map rate (0-100%) to vertical position (inverted because SVG y=0 is top)
  const y = chartHeight - chartPadding - (d.rate / maxRate) * (chartHeight - chartPadding * 2);
  return { x, y, ...d };
});
```

**Rendering layers** (bottom to top):
1. **Grid lines**: Dashed horizontal lines at 0%, 25%, 50%, 75%, 100%
2. **Area fill**: Semi-transparent polygon under the line (`opacity="0.1"`)
3. **Line**: Solid `2px` stroke in primary color
4. **Data points**: `3px` radius circles with `<title>` tooltips

**Range toggle**: 7D/30D buttons switch the `range` state, which triggers a memoized recalculation of trend data.

**Empty state**: When no data exists or all totals are 0, shows "No data yet" message instead of the chart.

## Activity Heatmap

### generateHeatmapData

> Source: [`src/lib/stats.ts:66-88`](../../src/lib/stats.ts)

```typescript
function generateHeatmapData(
  habits: Habit[],
  completions: CompletionRecord
): HeatmapDay[] {
  const active = getActiveHabits(habits);
  const activeIds = active.map((h) => h.id);
  const days = getLastNDays(HEATMAP_DAYS);   // 365 days

  return days.map((date) => {
    const total = activeIds.length;
    const count = getCompletionCountForDate(completions, date, activeIds);
    let intensity = 0;
    if (total > 0 && count > 0) {
      const ratio = count / total;
      if (ratio <= 0.25) intensity = 1;
      else if (ratio <= 0.5) intensity = 2;
      else if (ratio <= 0.75) intensity = 3;
      else intensity = 4;
    }
    return { date, count, total, intensity };
  });
}
```

Returns 365 `HeatmapDay` objects:

```typescript
interface HeatmapDay {
  date: DateString;
  count: number;      // Habits completed this day
  total: number;      // Total active habits
  intensity: number;  // 0-4 scale for color
}
```

**Intensity scale**:

| Intensity | Ratio Range | CSS Color |
|-----------|------------|-----------|
| 0 | 0% (none completed) | `bg-gray-100` |
| 1 | 1-25% | `bg-green-200` |
| 2 | 26-50% | `bg-green-300` |
| 3 | 51-75% | `bg-green-400` |
| 4 | 76-100% | `bg-green-500` |

### CalendarHeatmap Layout

> Source: [`src/components/calendar/CalendarHeatmap.tsx`](../../src/components/calendar/CalendarHeatmap.tsx)

The heatmap renders as a grid of tiny squares organized by weeks:

```
     Jan       Feb       Mar  ...  Dec
Mon  [][][][] [][][][] [][][]      [][][][]
Tue  [][][][] [][][][] [][][]      [][][][]
Wed  [][][][] [][][][] [][][]      [][][][]
Thu  [][][][] [][][][] [][][]      [][][][]
Fri  [][][][] [][][][] [][][]      [][][][]
Sat  [][][][] [][][][] [][][]      [][][][]
Sun  [][][][] [][][][] [][][]      [][][][]
                                   Less [][][][][] More
```

**Week organization** (memoized):

```typescript
const weeks = useMemo(() => {
  const result = [];
  let currentWeek = [];

  // Pad first week so days align to correct row
  const firstDayOfWeek = getDayOfWeek(parseDateString(heatmapData[0].date));
  for (let i = 0; i < firstDayOfWeek; i++) {
    currentWeek.push({ date: "", count: 0, total: 0, intensity: 0 });
  }

  // Group remaining days into 7-day chunks
  for (const day of heatmapData) {
    currentWeek.push(day);
    if (currentWeek.length === 7) {
      result.push(currentWeek);
      currentWeek = [];
    }
  }
  if (currentWeek.length > 0) result.push(currentWeek);

  return result;
}, [heatmapData]);
```

**First-week padding**: If 365 days ago was a Wednesday (index 3), the first column needs 3 empty cells so that Wednesday's data sits in the Wednesday row.

**Month labels** (memoized): Scans each week's first valid date and emits a label when the month changes.

**Day labels**: Shows `Mon`, `Wed`, `Fri` on alternating rows for readability.

### HeatmapCell

> Source: [`src/components/calendar/HeatmapCell.tsx`](../../src/components/calendar/HeatmapCell.tsx)

Each cell is a `12x12px` (w-3 h-3) rounded div. The `<title>` attribute provides a native tooltip: `"Jan 15, 2025: 3/5 completed"`.

### HeatmapLegend

> Source: [`src/components/calendar/HeatmapLegend.tsx`](../../src/components/calendar/HeatmapLegend.tsx)

Shows `Less [0][1][2][3][4] More` with the 5 intensity colors.

## Performance Considerations

All stat calculations are wrapped in `useMemo`:

```typescript
// In StatsOverview:
const stats = useMemo(
  () => calculateDashboardStats(habits, completions),
  [habits, completions]
);

// In TrendsChart:
const trendData = useMemo(
  () => calculateTrendData(habits, completions, range),
  [habits, completions, range]
);

// In CalendarHeatmap:
const heatmapData = useMemo(
  () => generateHeatmapData(habits, completions),
  [habits, completions]
);
```

Recalculations only happen when habits or completions actually change, not on every re-render.

## Edge Cases

| Scenario | Behavior |
|----------|----------|
| No habits | All stats show 0, empty states for chart/list |
| No completions | Rate = 0%, heatmap all gray, trends line at bottom |
| Habit created mid-period | Only counted from its creation date forward |
| All habits archived | Active count = 0, empty dashboard |
| Very long streaks (365+) | Heatmap shows full year, streak shows actual count |
| Range toggle (7D/30D) | Chart recalculates with memoization |
