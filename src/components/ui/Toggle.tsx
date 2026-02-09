"use client";

interface ToggleProps {
  enabled: boolean;
  onChange: (enabled: boolean) => void;
  label?: string;
}

export default function Toggle({ enabled, onChange, label }: ToggleProps) {
  return (
    <button
      role="switch"
      aria-checked={enabled}
      aria-label={label}
      onClick={() => onChange(!enabled)}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2
        ${enabled ? "bg-primary" : "bg-gray-300"}`}
    >
      <span
        className={`inline-block h-4 w-4 rounded-full bg-white transition-transform
          ${enabled ? "translate-x-6" : "translate-x-1"}`}
      />
    </button>
  );
}
