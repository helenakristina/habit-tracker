import { AppData } from "@/types";

export function exportData(data: AppData): void {
  const json = JSON.stringify(data, null, 2);
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

export function validateImportData(data: unknown): { valid: boolean; error?: string; data?: AppData } {
  if (!data || typeof data !== "object") {
    return { valid: false, error: "Invalid file format" };
  }

  const obj = data as Record<string, unknown>;

  if (obj.version !== 1) {
    return { valid: false, error: "Unsupported data version" };
  }

  if (!Array.isArray(obj.habits)) {
    return { valid: false, error: "Missing or invalid habits data" };
  }

  if (!obj.completions || typeof obj.completions !== "object") {
    return { valid: false, error: "Missing or invalid completions data" };
  }

  // Validate each habit has required fields
  for (const habit of obj.habits) {
    if (!habit.id || !habit.name || !habit.createdAt) {
      return { valid: false, error: "Invalid habit data: missing required fields" };
    }
  }

  return { valid: true, data: data as AppData };
}

export function parseImportFile(file: File): Promise<unknown> {
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
