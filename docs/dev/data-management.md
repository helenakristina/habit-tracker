# Data Management - Developer Documentation

> Technical specification for data export, import, persistence, and clearing.

**User guide**: [How to Manage Your Data](../user/how-to-manage-data.md)
**Related**: [Habit Management](./habit-management.md) | [Annotated Walkthrough](./annotate.md)

---

## Overview

All app data persists in the browser's `localStorage` under a single key. Users can export data as a JSON backup file, import previously exported files to restore data, and clear all data permanently. There is no server-side storage.

## File Map

| File | Responsibility |
|------|---------------|
| [`src/lib/storage.ts`](../../src/lib/storage.ts) | localStorage read/write/clear |
| [`src/lib/export.ts`](../../src/lib/export.ts) | Export, import validation, file parsing |
| [`src/lib/constants.ts`](../../src/lib/constants.ts) | Storage key, default data |
| [`src/context/AppDataContext.tsx`](../../src/context/AppDataContext.tsx) | Init, sync, import/clear actions |
| [`src/components/settings/SettingsPage.tsx`](../../src/components/settings/SettingsPage.tsx) | Settings page container |
| [`src/components/settings/ExportButton.tsx`](../../src/components/settings/ExportButton.tsx) | Export trigger |
| [`src/components/settings/ImportButton.tsx`](../../src/components/settings/ImportButton.tsx) | Import trigger + file picker |
| [`src/components/settings/ClearDataButton.tsx`](../../src/components/settings/ClearDataButton.tsx) | Clear with confirmation |
| [`src/hooks/useToast.ts`](../../src/hooks/useToast.ts) | Feedback notifications |

## Storage Architecture

### Storage Key

```typescript
// src/lib/constants.ts:3
export const STORAGE_KEY = "habit-tracker-data";
```

The entire app state is stored as a single JSON blob under this key.

### Default State

```typescript
// src/lib/constants.ts:32-37
export const DEFAULT_APP_DATA = {
  version: 1 as const,
  habits: [],
  completions: {},
  lastModified: new Date().toISOString(),
};
```

Used when localStorage is empty, unparseable, or has an incompatible version.

## Persistence Flow

### Initialization (App Load)

> Source: [`src/context/AppDataContext.tsx:96-101`](../../src/context/AppDataContext.tsx)

```typescript
// Runs once on mount
useEffect(() => {
  const saved = loadAppData();
  dispatch({ type: "IMPORT_DATA", payload: saved });
  setIsLoading(false);
  setIsInitialized(true);
}, []);
```

**Order matters**: The data must be loaded and dispatched before `setIsInitialized(true)`, because the sync effect (below) checks `isInitialized` to prevent overwriting real data with defaults.

### loadAppData

> Source: [`src/lib/storage.ts:4-25`](../../src/lib/storage.ts)

```typescript
function loadAppData(): AppData {
  // SSR guard: no localStorage on server
  if (typeof window === "undefined") {
    return { ...DEFAULT_APP_DATA, lastModified: new Date().toISOString() };
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...DEFAULT_APP_DATA, ... };

    const parsed = JSON.parse(raw);
    if (parsed.version !== 1) return { ...DEFAULT_APP_DATA, ... };

    return parsed as AppData;
  } catch {
    return { ...DEFAULT_APP_DATA, ... };
  }
}
```

**Three fallback paths** to `DEFAULT_APP_DATA`:
1. Running on server (no `window`)
2. No data in localStorage
3. JSON parse error or version mismatch

### Sync (Auto-save)

> Source: [`src/context/AppDataContext.tsx:104-108`](../../src/context/AppDataContext.tsx)

```typescript
useEffect(() => {
  if (isInitialized) {
    saveAppData(data);
  }
}, [data, isInitialized]);
```

Fires on every `data` change after initialization. The `isInitialized` guard prevents saving the temporary default state that exists between mount and localStorage load.

### saveAppData

> Source: [`src/lib/storage.ts:27-39`](../../src/lib/storage.ts)

```typescript
function saveAppData(data: AppData): void {
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
```

Always updates `lastModified` on save. Catches errors (e.g., localStorage full) and logs them without crashing the app.

## Export

### exportData

> Source: [`src/lib/export.ts:3-14`](../../src/lib/export.ts)

```typescript
function exportData(data: AppData): void {
  const json = JSON.stringify(data, null, 2);       // Pretty-printed
  const blob = new Blob([json], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `habit-tracker-backup-${new Date().toISOString().slice(0, 10)}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
```

**Technique**: Creates a temporary `<a>` element with a Blob URL, triggers a click to start the download, then cleans up both the element and the URL object.

**Filename**: `habit-tracker-backup-YYYY-MM-DD.json` (e.g., `habit-tracker-backup-2025-01-15.json`)

**Exported structure**: The full `AppData` object:
```json
{
  "version": 1,
  "habits": [
    {
      "id": "abc-123",
      "name": "Morning meditation",
      "description": "10 minutes",
      "color": "indigo",
      "createdAt": "2025-01-01T10:00:00.000Z",
      "updatedAt": "2025-01-01T10:00:00.000Z",
      "isArchived": false,
      "sortOrder": 0
    }
  ],
  "completions": {
    "2025-01-15": ["abc-123"]
  },
  "lastModified": "2025-01-15T20:30:00.000Z"
}
```

## Import

### parseImportFile

> Source: [`src/lib/export.ts:45-59`](../../src/lib/export.ts)

```typescript
function parseImportFile(file: File): Promise<unknown> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const parsed = JSON.parse(e.target?.result as string);
        resolve(parsed);
      } catch {
        reject(new Error("Failed to parse JSON file"));
      }
    };
    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsText(file);
  });
}
```

Wraps the browser `FileReader` API in a Promise. Reads the file as text, then parses JSON.

### validateImportData

> Source: [`src/lib/export.ts:16-43`](../../src/lib/export.ts)

```typescript
function validateImportData(data: unknown): {
  valid: boolean;
  error?: string;
  data?: AppData;
} {
  // 1. Must be a non-null object
  if (!data || typeof data !== "object") {
    return { valid: false, error: "Invalid file format" };
  }

  // 2. Version must be 1
  if (obj.version !== 1) {
    return { valid: false, error: "Unsupported data version" };
  }

  // 3. habits must be an array
  if (!Array.isArray(obj.habits)) {
    return { valid: false, error: "Missing or invalid habits data" };
  }

  // 4. completions must be an object
  if (!obj.completions || typeof obj.completions !== "object") {
    return { valid: false, error: "Missing or invalid completions data" };
  }

  // 5. Each habit must have id, name, createdAt
  for (const habit of obj.habits) {
    if (!habit.id || !habit.name || !habit.createdAt) {
      return { valid: false, error: "Invalid habit data: missing required fields" };
    }
  }

  return { valid: true, data: data as AppData };
}
```

**Validation rules**:
| Check | Error Message |
|-------|--------------|
| Not an object | "Invalid file format" |
| `version !== 1` | "Unsupported data version" |
| `habits` not array | "Missing or invalid habits data" |
| `completions` not object | "Missing or invalid completions data" |
| Habit missing id/name/createdAt | "Invalid habit data: missing required fields" |

### Import Flow

1. User clicks "Import Data" button
2. Hidden `<input type="file" accept=".json">` triggers
3. `parseImportFile(file)` reads and parses JSON
4. `validateImportData(parsed)` runs validation
5. If valid: `importData(data)` dispatches `IMPORT_DATA` action
6. Reducer replaces entire state: `return action.payload`
7. Sync effect saves to localStorage
8. Success toast shown

**Error handling**: Invalid files, parse errors, and validation failures all show toast notifications with specific messages.

**Input reset**: After file selection, `event.target.value = ""` resets the input so the same file can be re-selected.

## Clear All Data

### Flow

1. User clicks "Clear All Data"
2. `ConfirmDialog` shows warning
3. On confirm, `clearAllData()` is called:

```typescript
// src/context/AppDataContext.tsx:144-147
const clearAllData = useCallback(() => {
  clearAppData();               // localStorage.removeItem(STORAGE_KEY)
  dispatch({ type: "CLEAR_DATA" });
}, []);
```

```typescript
// Reducer
case "CLEAR_DATA":
  return { ...DEFAULT_APP_DATA, lastModified: new Date().toISOString() };
```

**Two-step process**:
1. `clearAppData()` removes the localStorage entry
2. `CLEAR_DATA` action resets in-memory state to defaults

The localStorage clear happens first to ensure data is gone even if the dispatch fails.

## Settings Page Layout

> Source: [`src/components/settings/SettingsPage.tsx`](../../src/components/settings/SettingsPage.tsx)

```
+---------------------------------------+
| Settings (h1)                         |
+---------------------------------------+
| Data Management (Card)                |
|                                       |
| [Export Data]  [Import Data]          |
| [Clear All Data]                      |
+---------------------------------------+
| About (Card)                          |
| "Your data is stored locally..."      |
+---------------------------------------+
```

Each button triggers a toast notification on success or error.

## Security Considerations

- **No server communication**: Data never leaves the device
- **localStorage limits**: ~5MB per origin; the app handles `localStorage.setItem` failures gracefully
- **Import validation**: Untrusted JSON is validated before being loaded into state
- **No sensitive data**: Habit names/completions are not credentials or PII, but users should be aware that anyone with browser access can see their data

## Edge Cases

| Scenario | Behavior |
|----------|----------|
| localStorage empty | Default state used (empty habits, no completions) |
| Corrupt JSON in localStorage | Falls back to default state |
| Version mismatch | Falls back to default state |
| Import file not JSON | Error toast: "Failed to parse JSON file" |
| Import file missing fields | Error toast with specific field error |
| localStorage full | `console.error` logged, app continues without saving |
| Private/incognito mode | Works normally but data cleared when window closes |
| SSR (server-side rendering) | `typeof window === "undefined"` checks prevent crashes |
| Clear then navigate | All pages show empty state, localStorage is clean |
