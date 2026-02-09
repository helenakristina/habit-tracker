"use client";

import { useAppData } from "@/hooks/useAppData";
import { useToast } from "@/hooks/useToast";
import Card from "@/components/ui/Card";
import ExportButton from "./ExportButton";
import ImportButton from "./ImportButton";
import ClearDataButton from "./ClearDataButton";
import { ToastContainer } from "@/components/ui/Toast";

export default function SettingsPage() {
  const { isLoading } = useAppData();
  const { toasts, addToast, dismissToast } = useToast();

  if (isLoading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-8 w-32 bg-muted rounded" />
        <div className="h-32 bg-muted rounded-xl" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-foreground">Settings</h1>

      <Card>
        <h2 className="text-lg font-semibold text-foreground mb-1">Data Management</h2>
        <p className="text-sm text-muted-foreground mb-4">
          Export your data for backup, import from a previous export, or clear everything and start fresh.
        </p>

        <div className="flex flex-col sm:flex-row gap-3">
          <ExportButton onSuccess={() => addToast("Data exported successfully", "success")} />
          <ImportButton
            onSuccess={() => addToast("Data imported successfully", "success")}
            onError={(msg) => addToast(msg, "error")}
          />
          <ClearDataButton onSuccess={() => addToast("All data cleared", "success")} />
        </div>
      </Card>

      <Card>
        <h2 className="text-lg font-semibold text-foreground mb-1">About</h2>
        <p className="text-sm text-muted-foreground">
          Habit Tracker helps you build and maintain positive daily habits.
          All data is stored locally in your browser — nothing is sent to any server.
        </p>
      </Card>

      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}
