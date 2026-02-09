export default function HeatmapLegend() {
  const levels = [
    { className: "bg-gray-100", label: "No activity" },
    { className: "bg-green-200", label: "1-25%" },
    { className: "bg-green-300", label: "26-50%" },
    { className: "bg-green-400", label: "51-75%" },
    { className: "bg-green-500", label: "76-100%" },
  ];

  return (
    <div className="flex items-center gap-1 text-xs text-muted-foreground">
      <span>Less</span>
      {levels.map((level) => (
        <div
          key={level.label}
          className={`w-3 h-3 rounded-sm ${level.className}`}
          title={level.label}
        />
      ))}
      <span>More</span>
    </div>
  );
}
