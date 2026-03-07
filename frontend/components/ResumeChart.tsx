"use client";

import type { MouseEvent } from "react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

type ChartRow = {
  name: string;
  value: number;
};

type TooltipPayloadRow = {
  name: string;
  value: number;
};

type TooltipProps = {
  active?: boolean;
  payload?: TooltipPayloadRow[];
};

function ChartTooltip({ active, payload }: TooltipProps) {
  if (!active || !payload || payload.length === 0) {
    return null;
  }

  const row = payload[0];

  return (
    <div className="rounded-lg border border-white/10 bg-[#0b0b0e]/95 p-3 shadow-[0_10px_30px_rgba(0,0,0,0.45)] backdrop-blur-xl">
      <p className="text-sm font-medium text-[var(--foreground)]">{row.name}</p>
      <p className="text-xs text-[var(--foreground-muted)]">Count: {row.value}</p>
      <p className="text-xs font-medium text-[var(--foreground)]">{((row.value / 120) * 100).toFixed(1)}%</p>
    </div>
  );
}

export default function ResumeChart() {
  const data: ChartRow[] = [
    { name: "Strong Fit", value: 45 },
    { name: "Trainable Fit", value: 50 },
    { name: "Risky Fit", value: 25 },
  ];

  const colors = ["#10b981", "#f59e0b", "#ef4444"];

  const setSpotlight = (event: MouseEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    event.currentTarget.style.setProperty("--spot-x", `${event.clientX - rect.left}px`);
    event.currentTarget.style.setProperty("--spot-y", `${event.clientY - rect.top}px`);
  };

  return (
    <div onMouseMove={setSpotlight} className="ui-card ui-spotlight p-6 sm:p-8">
      <div className="relative z-[3]">
        <p className="label-mono mb-2">Classification Overview</p>
        <h2 className="mb-2 bg-gradient-to-b from-white via-white/95 to-white/70 bg-clip-text text-2xl font-semibold tracking-tight text-transparent">
          Resume Classification
        </h2>
        <p className="mb-6 text-sm text-[var(--foreground-muted)]">Breakdown of candidate fit distribution across the current pool.</p>

        <div className="flex flex-col gap-8 lg:flex-row lg:items-center">
          <div className="h-[300px] w-full lg:w-2/3">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={data} dataKey="value" outerRadius={100} label={({ name, value }) => `${name}: ${value}`} labelLine={false}>
                  {data.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={colors[index]} style={{ filter: "drop-shadow(0 4px 8px rgba(0,0,0,0.22))" }} />
                  ))}
                </Pie>
                <Tooltip content={<ChartTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="w-full space-y-3 lg:w-1/3">
            {data.map((item, index) => (
              <div key={item.name} className="rounded-xl border border-white/10 bg-white/5 p-3">
                <div className="flex items-center gap-3">
                  <span className="h-3 w-3 rounded-full" style={{ backgroundColor: colors[index] }} />
                  <p className="text-sm font-medium text-[var(--foreground)]">{item.name}</p>
                </div>
                <p className="mt-1 text-xs text-[var(--foreground-muted)]">
                  {item.value} resumes ({((item.value / 120) * 100).toFixed(1)}%)
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}