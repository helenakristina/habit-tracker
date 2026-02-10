# How to Read Your Dashboard

> A guide to understanding your dashboard stats, trends chart, and activity heatmap.

**Developer docs**: [Dashboard & Analytics (Technical)](../dev/dashboard-analytics.md)

---

## Overview

The Dashboard is your home page. It gives you a complete picture of your habit tracking progress at a glance. It has four sections, each described below.

---

## Stats Overview

At the top of the dashboard, you'll see four stat cards:

```
+-------------+  +-------------+  +-------------+  +--------------+
| Total       |  | Done Today  |  | Best Streak |  | 30-Day Rate  |
| Habits      |  |             |  |             |  |              |
|     5       |  |   3 / 5     |  |   12 days   |  |     78%      |
+-------------+  +-------------+  +-------------+  +--------------+
```

### Total Habits
The number of **active** habits you're currently tracking. Archived habits are not counted.

### Done Today
How many habits you've completed today, shown as **completed / total**. For example, "3/5" means you've checked off 3 of your 5 habits so far.

### Best Streak
The highest **current** streak among all your active habits. If you have habits with streaks of 3, 7, and 12, this shows **12 days**. This is NOT your all-time longest streak - it's the best active streak right now.

### 30-Day Rate
Your overall completion percentage for the last 30 days. Calculated as:

```
(total completions across all days) / (total possible completions) x 100
```

**Smart counting**: If you created a habit 10 days ago, it only counts for those 10 days, not the full 30. This prevents new habits from unfairly lowering your rate.

---

## Today's Habits

This card lists all your active habits with checkboxes. See [How to Track Habits Daily](./how-to-track-daily.md) for the full guide on checking off habits.

Key elements:
- Today's date shown in the header
- Progress counter (e.g., "3/5 completed")
- Each habit has a checkbox, name, and streak badges
- Streak badges show current streak (flame) and longest streak (chart)

**Empty state**: If you have no habits, this section shows a "Create Habit" button linking to the Habits page.

---

## Trends Chart

The trends chart shows your daily completion rate as a line graph over time.

```
100% |                    *
 75% |        *     *   *
 50% |  *   *
 25% |*
  0% +--+--+--+--+--+--+--
     Mon Tue Wed Thu Fri Sat Sun
```

### Reading the Chart
- **Y-axis** (vertical): Completion rate from 0% to 100%
- **X-axis** (horizontal): Dates over the selected time range
- **Line**: Connects your daily completion rates
- **Shaded area**: The area under the line, filled with a light primary color
- **Data points**: Circles on the line; hover over them to see exact values

### Tooltips
Hover over (or tap on mobile) any data point to see:
```
2025-01-15: 80% (4/5)
```
This means on January 15, you completed 4 out of 5 habits (80%).

### Time Range Toggle
Two buttons in the top-right corner let you switch between:
- **7D**: Last 7 days (shows recent trends)
- **30D**: Last 30 days (shows longer patterns)

The active range is highlighted in your primary color.

### What Affects the Rate
- Only **active** (non-archived) habits are counted
- Habits are only counted for dates **on or after** they were created
- If you had 3 habits a week ago but now have 5, the chart correctly reflects the different totals

---

## Activity Heatmap

At the bottom of your dashboard, you'll find a GitHub-style activity heatmap showing the past **365 days** (one full year).

```
         Jan     Feb     Mar     Apr  ...  Dec
Mon      [][][]  [][][]  [][][]  [][]      [][][][]
Tue      [][][]  [][][]  [][][]  [][]      [][][][]
Wed      [][][]  [][][]  [][][]  [][]      [][][][]
Thu      [][][]  [][][]  [][][]  [][]      [][][][]
Fri      [][][]  [][][]  [][][]  [][]      [][][][]
Sat      [][][]  [][][]  [][][]  [][]      [][][][]
Sun      [][][]  [][][]  [][][]  [][]      [][][][]

                              Less [][][][][] More
```

### How to Read It

Each small square represents **one day**. The color tells you how much you completed:

| Color | Meaning |
|-------|---------|
| Gray | No habits completed (0%) |
| Light green | 1-25% of habits completed |
| Medium green | 26-50% of habits completed |
| Dark green | 51-75% of habits completed |
| Darkest green | 76-100% of habits completed |

### Layout
- **Columns** = Weeks (left is oldest, right is most recent)
- **Rows** = Days of the week (Monday at top, Sunday at bottom)
- **Month labels** appear along the top when a new month begins
- **Day labels** (Mon, Wed, Fri) appear on the left side

### Hovering Over a Day
Hover over any square to see a tooltip with:
```
Jan 15, 2025: 4/5 completed
```

### What the Heatmap Shows You

- **Consistency patterns**: Solid green rows mean you're consistent throughout the week
- **Weekend gaps**: If weekends are always gray, you might want to adjust your habits for those days
- **Improvement over time**: A heatmap that gets darker from left to right shows you're building consistency
- **Breaks and recoveries**: Gray patches show when you fell off, and green patches show when you got back on track

---

## Dashboard When You're Just Starting

If you're new and have no habits yet, the dashboard will show:
- All stats at **0**
- "No habits yet" message with a **"Create Habit"** button
- Empty trends chart with "No data yet" message
- Fully gray heatmap

Don't worry - it fills up fast once you start tracking!

---

## Tips

- **Check your dashboard daily**: It only takes a few seconds to see your progress and check off habits
- **Watch the 30-day rate**: This is your most meaningful long-term metric. Aim for consistent improvement, not perfection
- **Use the 7D chart for short-term patterns**: Notice if certain days of the week are consistently low
- **Let the heatmap motivate you**: There's something satisfying about filling in those green squares. Try not to break the pattern!
