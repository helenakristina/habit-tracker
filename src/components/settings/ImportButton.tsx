"use client";

import { useRef } from "react";
import { useAppData } from "@/hooks/useAppData";
import { parseImportFile, validateImportData } from "@/lib/export";
import Button from "@/components/ui/Button";

interface ImportButtonProps {
  onSuccess: () => void;
  onError: (message: string) => void;
}

export default function ImportButton({ onSuccess, onError }: ImportButtonProps) {
  const { importData } = useAppData();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const raw = await parseImportFile(file);
      const result = validateImportData(raw);

      if (!result.valid || !result.data) {
        onError(result.error ?? "Invalid file format");
        return;
      }

      importData(result.data);
      onSuccess();
    } catch {
      onError("Failed to read file");
    }

    // Reset input so same file can be selected again
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        accept=".json"
        onChange={handleImport}
        className="hidden"
        aria-label="Import data file"
      />
      <Button variant="secondary" onClick={() => fileInputRef.current?.click()} className="w-full sm:w-auto">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" className="mr-2">
          <path d="M8 10V2M4 5l4-4 4 4M2 12v1a1 1 0 001 1h10a1 1 0 001-1v-1" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        Import Data
      </Button>
    </>
  );
}
