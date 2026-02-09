"use client";

import { useState } from "react";
import { useAppData } from "@/hooks/useAppData";
import Button from "@/components/ui/Button";
import ConfirmDialog from "@/components/ui/ConfirmDialog";

interface ClearDataButtonProps {
  onSuccess: () => void;
}

export default function ClearDataButton({ onSuccess }: ClearDataButtonProps) {
  const { clearAllData } = useAppData();
  const [showConfirm, setShowConfirm] = useState(false);

  const handleClear = () => {
    clearAllData();
    onSuccess();
  };

  return (
    <>
      <Button variant="destructive" onClick={() => setShowConfirm(true)} className="w-full sm:w-auto">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" className="mr-2">
          <path d="M3 4h10M5.5 4V3a1 1 0 011-1h3a1 1 0 011 1v1M6.5 7v4M9.5 7v4M4.5 4l.5 8a1 1 0 001 1h4a1 1 0 001-1l.5-8" />
        </svg>
        Clear All Data
      </Button>

      <ConfirmDialog
        isOpen={showConfirm}
        onClose={() => setShowConfirm(false)}
        onConfirm={handleClear}
        title="Clear All Data"
        message="This will permanently delete all your habits and completion history. This cannot be undone. Consider exporting your data first."
        confirmLabel="Clear Everything"
      />
    </>
  );
}
