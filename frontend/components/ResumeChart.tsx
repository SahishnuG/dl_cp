"use client";

import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";

export default function ResumeChart() {
  const data = [
    { name: "Strong Fit", value: 45 },
    { name: "Trainable Fit", value: 50 },
    { name: "Risky Fit", value: 25 },
  ];

  const COLORS = [
    "#10b981", // emerald
    "#f59e0b", // amber
    "#ef4444", // rose
  ];

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-slate-800 p-3 rounded-lg border border-slate-200 dark:border-slate-700 shadow-lg">
          <p className="font-medium text-slate-900 dark:text-slate-50">
            {payload[0].name}
          </p>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Count: {payload[0].value}
          </p>
          <p className="text-sm font-medium text-slate-900 dark:text-slate-50">
            {((payload[0].value / 120) * 100).toFixed(1)}%
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="group relative">
      {/* Gradient border */}
      <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-lg" />

      <div className="relative bg-white dark:bg-slate-800 rounded-2xl p-8 border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 transition-all duration-300 hover:shadow-xl overflow-hidden">
        <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 opacity-5 rounded-full -mr-20 -mt-20" />

        <div className="relative z-10">
          <h2 className="text-2xl font-bold mb-2 bg-gradient-to-r from-indigo-600 to-pink-600 dark:from-indigo-400 dark:to-pink-400 bg-clip-text text-transparent">
            Resume Classification
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400 mb-6">
            Breakdown of candidate fit classifications
          </p>

          <div className="flex flex-col lg:flex-row items-center justify-center gap-8">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={data}
                  dataKey="value"
                  outerRadius={100}
                  label={({ name, value }) => `${name}: ${value}`}
                  labelLine={false}
                >
                  {data.map((_, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index]}
                      style={{ filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.1))" }}
                    />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>

            {/* Legend */}
            <div className="space-y-3">
              {data.map((item, index) => (
                <div
                  key={index}
                  className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 hover:border-slate-300 dark:hover:border-slate-500 transition-colors"
                >
                  <div
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: COLORS[index] }}
                  />
                  <div>
                    <p className="font-medium text-slate-900 dark:text-slate-50">
                      {item.name}
                    </p>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      {item.value} resumes ({((item.value / 120) * 100).toFixed(1)}%)
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}