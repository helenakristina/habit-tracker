"use client";

import { useState, useMemo } from "react";
import { Habit, CompletionRecord } from "@/types";
import { calculateTrendData } from "@/lib/stats";
import Card from "@/components/ui/Card";

interface TrendsChartProps {
  habits: Habit[];
  completions: CompletionRecord;
}

export default function TrendsChart({ habits, completions }: TrendsChartProps) {
  const [range, setRange] = useState<7 | 30>(7);

  const trendData = useMemo(() => calculateTrendData(habits, completions, range), [habits, completions, range]);

  const maxRate = 100;
  const chartHeight = 120;
  const chartPadding = 20;

  if (trendData.length === 0 || trendData.every((d) => d.total === 0)) {
    return (
      <Card>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-foreground">Trends</h2>
        </div>
        <p className="text-sm text-muted-foreground text-center py-8">
          No data yet. Complete some habits to see trends!
        </p>
      </Card>
    );
  }

  const points = trendData.map((d, i) => {
    const x = chartPadding + (i / (trendData.length - 1 || 1)) * (300 - chartPadding * 2);
    const y = chartHeight - chartPadding - (d.rate / maxRate) * (chartHeight - chartPadding * 2);
    return { x, y, ...d };
  });

  const pathData = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");

  // Area under the line
  const areaPath = `${pathData} L ${points[points.length - 1].x} ${chartHeight - chartPadding} L ${points[0].x} ${chartHeight - chartPadding} Z`;

  return (
    <Card>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-foreground">Trends</h2>
        <div className="flex rounded-lg border border-border overflow-hidden">
          <button
            onClick={() => setRange(7)}
            className={`px-3 py-1 text-xs font-medium transition-colors ${
              range === 7 ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted"
            }`}
          >
            7D
          </button>
          <button
            onClick={() => setRange(30)}
            className={`px-3 py-1 text-xs font-medium transition-colors ${
              range === 30 ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted"
            }`}
          >
            30D
          </button>
        </div>
      </div>

      <svg viewBox={`0 0 300 ${chartHeight}`} className="w-full" aria-label="Completion rate trend">
        {/* Grid lines */}
        {[0, 25, 50, 75, 100].map((pct) => {
          const y = chartHeight - chartPadding - (pct / maxRate) * (chartHeight - chartPadding * 2);
          return (
            <g key={pct}>
              <line x1={chartPadding} y1={y} x2={300 - chartPadding} y2={y} stroke="var(--border)" strokeWidth="0.5" strokeDasharray="4 4" />
              <text x={chartPadding - 4} y={y + 3} textAnchor="end" fill="var(--muted-foreground)" fontSize="8">
                {pct}%
              </text>
            </g>
          );
        })}

        {/* Area fill */}
        <path d={areaPath} fill="var(--primary)" opacity="0.1" />

        {/* Line */}
        <path d={pathData} fill="none" stroke="var(--primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />

        {/* Data points */}
        {points.map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r="3" fill="var(--primary)">
            <title>{`${p.date}: ${p.rate}% (${p.completed}/${p.total})`}</title>
          </circle>
        ))}
      </svg>
    </Card>
  );
}
