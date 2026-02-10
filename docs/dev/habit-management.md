# Habit Management - Developer Documentation

> Technical specification for creating, editing, archiving, restoring, and deleting habits.

**User guide**: [How to Manage Habits](../user/how-to-manage-habits.md)
**Related**: [Daily Tracking](./daily-tracking.md) | [Streaks](./streaks.md) | [Annotated Walkthrough](./annotate.md)

---

## Overview

Habit Management is the CRUD layer of the application. Users create habits with a name, optional description, and color. Habits can be edited, soft-deleted (archived), restored, or permanently deleted. All operations flow through the `AppDataContext` reducer.

## Data Model

### Habit Object

> Source: [`src/types/index.ts:15-24`](../../src/types/index.ts)

```typescript
interface Habit {
  id: HabitId;          // UUID via crypto.randomUUID()
  name: string;         // Required, max 50 chars
  description: string;  // Optional, max 200 chars
  createdAt: string;    // ISO 8601 timestamp
  updatedAt: string;    // ISO 8601 timestamp, changes on edit
  isArchived: boolean;  // Soft delete flag
  color: HabitColor;    // One of 9 predefined colors
  sortOrder: number;    // Integer for manual ordering
}
```

### HabitColor

```typescript
type HabitColor = "red" | "orange" | "amber" | "green" | "emerald"
                | "blue" | "indigo" | "violet" | "pink";
```

Each color maps to Tailwind CSS classes via `HABIT_COLOR_MAP` in [`src/lib/constants.ts:17-27`](../../src/lib/constants.ts):

```typescript
{
  red:    { bg: "bg-red-500",    bgLight: "bg-red-100",    text: "text-red-500" },
  blue:   { bg: "bg-blue-500",   bgLight: "bg-blue-100",   text: "text-blue-500" },
  // ...9 colors total
}
```

### HabitFormData

The form input shape (subset of Habit used for create/edit):

```typescript
type HabitFormData = {
  name: string;
  description: string;
  color: HabitColor;
};
```

## File Map

| File | Responsibility |
|------|---------------|
| [`src/types/index.ts`](../../src/types/index.ts) | Type definitions |
| [`src/lib/habits.ts`](../../src/lib/habits.ts) | Pure functions: create, update, validate, sort, filter |
| [`src/lib/id.ts`](../../src/lib/id.ts) | UUID generation |
| [`src/lib/constants.ts`](../../src/lib/constants.ts) | Color definitions, validation limits |
| [`src/context/AppDataContext.tsx`](../../src/context/AppDataContext.tsx) | State management, reducer actions |
| [`src/hooks/useHabits.ts`](../../src/hooks/useHabits.ts) | Memoized active/archived habit lists |
| [`src/hooks/useAppData.ts`](../../src/hooks/useAppData.ts) | Context access hook |
| [`src/components/habits/HabitsPage.tsx`](../../src/components/habits/HabitsPage.tsx) | Page container |
| [`src/components/habits/HabitList.tsx`](../../src/components/habits/HabitList.tsx) | List renderer |
| [`src/components/habits/HabitCard.tsx`](../../src/components/habits/HabitCard.tsx) | Individual habit display |
| [`src/components/habits/HabitForm.tsx`](../../src/components/habits/HabitForm.tsx) | Create/edit form |
| [`src/components/habits/HabitFormModal.tsx`](../../src/components/habits/HabitFormModal.tsx) | Modal wrapper for form |

## Operations

### Create Habit

**Flow**: Form submit -> validation -> context `addHabit` -> reducer `ADD_HABIT` -> localStorage

1. User fills form in `HabitForm` component
2. `validateHabitForm(formData)` runs on submit ([`src/lib/habits.ts:37-52`](../../src/lib/habits.ts)):
   - Name is trimmed and checked: required, max 50 chars
   - Description trimmed and checked: max 200 chars
   - Returns `ValidationError[]` (empty array = valid)
3. Context method `addHabit(formData)` ([`src/context/AppDataContext.tsx:110-114`](../../src/context/AppDataContext.tsx)):
   - Calculates `sortOrder` as `max(existing orders) + 1`
   - Calls `createHabit(formData, sortOrder)` which generates a UUID, trims strings, sets timestamps
4. Reducer appends to `state.habits`

```typescript
// src/lib/habits.ts:5-17
function createHabit(formData: HabitFormData, sortOrder: number): Habit {
  const now = new Date().toISOString();
  return {
    id: generateId(),              // crypto.randomUUID()
    name: formData.name.trim(),
    description: formData.description.trim(),
    color: formData.color,
    createdAt: now,
    updatedAt: now,
    isArchived: false,
    sortOrder,
  };
}
```

**Default color selection**: When creating a habit, the form defaults to `"indigo"`. The `getDefaultColor(existingHabits)` function ([`src/lib/habits.ts:66-70`](../../src/lib/habits.ts)) cycles through a predefined order and picks the first unused color.

### Edit Habit

**Flow**: Form submit -> context `editHabit` -> reducer `UPDATE_HABIT` -> localStorage

Only `name`, `description`, and `color` can be updated. The `Partial<Pick<>>` type prevents modifying `id`, `createdAt`, `sortOrder`, or `isArchived` through this path.

```typescript
// src/lib/habits.ts:19-30
function updateHabit(
  habit: Habit,
  updates: Partial<Pick<Habit, "name" | "description" | "color">>
): Habit {
  return {
    ...habit,
    ...updates,
    name: updates.name !== undefined ? updates.name.trim() : habit.name,
    description: updates.description !== undefined ? updates.description.trim() : habit.description,
    updatedAt: new Date().toISOString(),
  };
}
```

The function trims strings only if they were actually provided (checks for `undefined`), and always bumps `updatedAt`.

### Archive Habit

**Flow**: Button click -> context `archiveHabit` -> reducer `ARCHIVE_HABIT` -> localStorage

Sets `isArchived: true` and updates `updatedAt`. The habit remains in `state.habits` and all its completion records are preserved. Archived habits:
- Don't appear in the dashboard "Today" section
- Don't count toward stats or streaks
- Appear in a collapsible "Archived" section on the Habits page
- Show "Restore" and "Delete" buttons instead of "Edit" and "Archive"

### Restore Habit

**Flow**: Button click -> context `restoreHabit` -> reducer `RESTORE_HABIT` -> localStorage

Sets `isArchived: false`. The habit returns to the active list with all its historical completion data intact.

### Delete Habit (Permanent)

**Flow**: Button click -> ConfirmDialog -> context `deleteHabit` -> reducer `DELETE_HABIT` -> localStorage

This is destructive and irreversible:

```typescript
// src/context/AppDataContext.tsx:55-60
case "DELETE_HABIT":
  return {
    ...state,
    habits: state.habits.filter((h) => h.id !== action.payload),
    completions: removeHabitFromCompletions(state.completions, action.payload),
  };
```

`removeHabitFromCompletions` ([`src/lib/completions.ts:47-59`](../../src/lib/completions.ts)) iterates every date in the completions record and removes the deleted habit's ID. Empty date entries are also pruned.

Delete is only available for archived habits (the UI enforces this in `HabitCard`).

### Reorder Habits

**Flow**: Ordered ID array -> context `reorderHabits` -> reducer `REORDER_HABITS` -> localStorage

```typescript
// src/context/AppDataContext.tsx:62-71
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
```

Takes an array of habit IDs in the desired order and assigns each position as the new `sortOrder`. The `?? h.sortOrder` fallback ensures habits not in the array keep their current position.

## Validation Rules

| Field | Rule | Error Message |
|-------|------|--------------|
| `name` | Required (non-empty after trim) | "Name is required" |
| `name` | Max 50 characters | "Name must be 50 characters or less" |
| `description` | Max 200 characters | "Description must be 200 characters or less" |

Constants defined in [`src/lib/constants.ts:29-30`](../../src/lib/constants.ts):
```typescript
export const MAX_HABIT_NAME_LENGTH = 50;
export const MAX_HABIT_DESCRIPTION_LENGTH = 200;
```

## Hook: useHabits

> Source: [`src/hooks/useHabits.ts`](../../src/hooks/useHabits.ts)

```typescript
function useHabits() {
  const { data } = useAppData();
  const activeHabits = useMemo(() => getActiveHabits(data.habits), [data.habits]);
  const archivedHabits = useMemo(() => getArchivedHabits(data.habits), [data.habits]);
  return { activeHabits, archivedHabits, allHabits: data.habits };
}
```

Returns memoized lists that only recalculate when `data.habits` changes. Both `getActiveHabits` and `getArchivedHabits` filter by `isArchived` and sort by `sortOrder`.

## UI States

| State | Behavior |
|-------|----------|
| Loading | Skeleton cards (pulse animation) |
| Empty (no active habits) | EmptyState with "Create your first habit" CTA |
| Empty (no archived habits) | "No archived habits" text |
| Form validation error | Red border on field, error message below |
| Delete confirmation | ConfirmDialog with destructive warning |

## Reducer Actions

| Action | Payload | Effect |
|--------|---------|--------|
| `ADD_HABIT` | `Habit` | Append to habits array |
| `UPDATE_HABIT` | `{ id, updates }` | Map over habits, update matching ID |
| `ARCHIVE_HABIT` | `HabitId` | Set `isArchived: true` |
| `RESTORE_HABIT` | `HabitId` | Set `isArchived: false` |
| `DELETE_HABIT` | `HabitId` | Remove from habits + clean completions |
| `REORDER_HABITS` | `HabitId[]` | Update sortOrder for each habit |
