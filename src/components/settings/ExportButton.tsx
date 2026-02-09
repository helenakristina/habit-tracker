"use client";

import { useAppData } from "@/hooks/useAppData";
import { exportData } from "@/lib/export";
import Button from "@/components/ui/Button";

interface ExportButtonProps {
  onSuccess: () => void;
}

export default function ExportButton({ onSuccess }: ExportButtonProps) {
  const { data } = useAppData();

  const handleExport = () => {
    exportData(data);
    onSuccess();
  };

  return (
    <Button variant="secondary" onClick={handleExport} className="w-full sm:w-auto">
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" className="mr-2">
        <path d="M8 2v8M4 7l4 4 4-4M2 12v1a1 1 0 001 1h10a1 1 0 001-1v-1" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      Export Data
    </Button>
  );
}
