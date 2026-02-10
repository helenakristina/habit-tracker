# How to Build Streaks

> A guide to understanding and building habit streaks.

**Developer docs**: [Streaks (Technical)](../dev/streaks.md)

---

## What Are Streaks?

A streak counts how many **consecutive days** you've completed a habit. If you meditate every day for 10 days in a row, your meditation streak is 10.

The app tracks two streak numbers for each habit:

### Current Streak
The number of consecutive days ending **today** (or yesterday, if you haven't checked today's habits yet). This is your active streak - the one you're building right now.

### Longest Streak (Best)
The longest consecutive run you've ever achieved for this habit. This is your personal record. Even if your current streak resets to 0, your best streak stays as a badge of honor.

---

## Where Streaks Appear

### On the Dashboard
Next to each habit in the "Today" card, you'll see two badges:

```
[x] Morning meditation     12d | 15d best
```

- **12d** = Your current streak is 12 days (flame icon, shown in orange when > 0)
- **15d best** = Your longest streak ever is 15 days (chart icon)

### In the Stats Overview
The **"Best Streak"** stat card shows the highest current streak across ALL your active habits. If you have 5 habits with streaks of 3, 7, 12, 1, and 5 days, the card shows **12 days**.

---

## How Streaks Are Calculated

### The "Today Grace Period"

The app gives you until **midnight** to complete today's habit. Here's how it works:

**Scenario 1: You've already checked today's habit**
- The streak counts today and walks backwards through consecutive completed days
- Example: Completed Jan 10, 11, 12, 13, 14 (today) = **5-day streak**

**Scenario 2: You haven't checked today's habit yet**
- The streak starts from **yesterday** and walks backwards
- Your streak doesn't drop to 0 just because it's morning and you haven't done it yet
- Example: Completed Jan 10, 11, 12, 13 (yesterday). Today is Jan 14, not yet checked = still shows **4-day streak**

**Scenario 3: You missed yesterday**
- If yesterday is not completed and today is not completed, the streak is **0**
- If yesterday is not completed but today IS completed, the streak is **1**

### What Breaks a Streak

A streak breaks when there's a **gap of one or more days** without a completion. Missing a single day resets your current streak.

```
Mon  Tue  Wed  Thu  Fri  Sat  Sun
 [x]  [x]  [x]  [ ]  [x]  [x]  [x]
 |--- 3-day ---|      |-- 3-day --|
                       Current streak = 3
                       Longest streak = 3
```

---

## Building Long Streaks - Tips

1. **Start with tiny habits**: "Meditate for 1 minute" is easier to maintain than "Meditate for 30 minutes." You can always do more, but the checkbox only needs a minimum effort.

2. **Track your streaks visually**: The flame icon turning orange when your streak is active provides a visual motivator. Watch the number grow.

3. **Use the heatmap**: The [Activity Heatmap](./how-to-read-dashboard.md#activity-heatmap) on your dashboard shows your year at a glance. Gaps appear as gray squares - try to keep the green going.

4. **Don't despair after a break**: Your longest streak is always preserved. A broken streak is a chance to learn what went wrong and start fresh. Many people build their longest streaks after previous failures.

5. **Check in at the same time each day**: Attach habit tracking to an existing routine (e.g., "After morning coffee, I open the app and check off my habits").

---

## Streaks and Archived Habits

When you **archive** a habit:
- Streak calculations stop (since you're no longer tracking it)
- Your completion history is preserved

When you **restore** an archived habit:
- Streaks are recalculated from your full completion history
- If you archived 5 days ago, there will be a 5-day gap, so your current streak starts fresh
- Your longest streak remains intact from before archiving

When you **delete** a habit permanently:
- All completion data is removed
- Streaks are gone forever
- This is why archiving is recommended over deleting

---

## Frequently Asked Questions

**Q: Does the streak reset if I check a habit late at night?**
A: No. As long as you check it before midnight on that calendar day, it counts for that day.

**Q: Can I fix a streak I accidentally broke?**
A: The app doesn't currently support marking past dates as complete from the dashboard. Your streaks are based on your actual daily check-ins.

**Q: Why does my current streak show 0 even though I completed habits recently?**
A: You likely missed yesterday. The current streak counts backwards from today/yesterday and stops at the first gap.
