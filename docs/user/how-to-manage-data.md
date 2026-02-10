# How to Manage Your Data

> A guide to exporting, importing, and clearing your habit data.

**Developer docs**: [Data Management (Technical)](../dev/data-management.md)

---

## Where Your Data Lives

All your habit data is stored **locally in your browser**. It never leaves your device - there's no account, no cloud sync, and no server. This means:

- Your data is completely private
- It works offline
- No login required
- **But**: If you clear your browser data or switch devices, your data won't carry over

That's why exporting backups is important.

---

## Exporting Your Data (Backup)

Exporting creates a backup file you can save on your computer, cloud drive, or anywhere you like.

### Steps

1. Navigate to the **Settings** page
2. Click the **"Export Data"** button
3. A JSON file will automatically download to your computer
4. You'll see a green **"Data exported successfully"** notification

### The Backup File

The file is named `habit-tracker-backup-YYYY-MM-DD.json` (e.g., `habit-tracker-backup-2025-01-15.json`).

It contains:
- All your habits (active and archived)
- All your completion records (every day you've ever checked off a habit)
- Metadata like version and timestamps

The file is in JSON format - a plain text format that you can open in any text editor if you're curious about the contents.

### When to Export

- **Before clearing your browser data**
- **Before switching to a new computer or browser**
- **Weekly or monthly** as a routine backup
- **Before making big changes** (like deleting lots of habits)

---

## Importing Data (Restore)

Importing replaces your current data with data from a backup file.

### Steps

1. Navigate to the **Settings** page
2. Click the **"Import Data"** button
3. A file picker dialog will open
4. Select a `.json` backup file (previously exported from this app)
5. If the file is valid, your data is immediately restored
6. You'll see a green **"Data imported successfully"** notification

### Important Notes

- **Importing replaces everything**: Your current habits, completions, and all data will be overwritten. Export your current data first if you want to keep it.
- **Only `.json` files are accepted**: The file picker only shows JSON files.
- **The file must be valid**: It needs to be a file that was exported from this app (or follows the same format). If the file is invalid, you'll see an error message explaining what's wrong.

### Common Errors

| Error Message | What It Means |
|--------------|---------------|
| "Failed to parse JSON file" | The file isn't valid JSON. Make sure you selected the right file. |
| "Unsupported data version" | The file is from a different version of the app. |
| "Missing or invalid habits data" | The file doesn't contain a valid habits list. |
| "Missing or invalid completions data" | The file doesn't contain completion records. |
| "Invalid habit data: missing required fields" | One or more habits in the file are missing required information (name, ID, or creation date). |

---

## Clearing All Data

This permanently deletes everything and resets the app to a fresh state.

### Steps

1. Navigate to the **Settings** page
2. Click the **"Clear All Data"** button (shown in red)
3. A confirmation dialog will appear warning you:
   > "This will permanently delete all your habits and completion data. This action cannot be undone."
4. Click **"Delete"** to confirm, or **"Cancel"** to keep your data

### What Gets Deleted

- All habits (active and archived)
- All completion records
- All streak history
- Everything - the app resets to a completely empty state

### When to Clear

- Starting completely fresh with new habits
- Testing or troubleshooting
- Before handing the device to someone else

**Always export a backup before clearing**, just in case you change your mind.

---

## Transferring Data Between Devices

Since data is stored locally, you can't sync between devices automatically. But you can transfer manually:

1. **On your old device**: Go to Settings and click **Export Data**
2. **Transfer the file**: Email it to yourself, save it to cloud storage (Google Drive, iCloud, Dropbox), or use a USB drive
3. **On your new device**: Open the app, go to Settings, and click **Import Data**
4. Select the backup file

---

## Technical Details

For those curious about the underlying storage:

- **Storage mechanism**: Browser `localStorage`
- **Storage key**: `habit-tracker-data`
- **Storage limit**: Approximately 5MB (varies by browser) - more than enough for years of habit tracking
- **Format**: JSON (human-readable text)
- **Data is NOT encrypted**: Anyone with access to your browser's developer tools can see your habit data

---

## Tips

- **Export regularly**: Set a monthly reminder to export a backup
- **Keep multiple backups**: Don't overwrite old backups. The date in the filename helps you track versions
- **Test your backups**: Occasionally import an old backup into a private/incognito window to verify it works
- **Don't edit the JSON manually**: Unless you know what you're doing, editing the backup file can corrupt it and make it unimportable
