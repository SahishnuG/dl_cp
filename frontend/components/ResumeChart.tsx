"use client";

import { PieChart, Pie, Cell, Tooltip } from "recharts";

export default function ResumeChart() {
  const data = [
    { name: "Strong Fit", value: 45 },
    { name: "Trainable Fit", value: 50 },
    { name: "Risky Fit", value: 25 },
  ];

  const COLORS = ["#16a34a", "#eab308", "#dc2626"];

  return (
    <div className="bg-white p-6 rounded-xl shadow-md">
      <h2 className="text-lg font-semibold mb-4">Resume Classification</h2>
      <PieChart width={400} height={300}>
        <Pie
          data={data}
          dataKey="value"
          outerRadius={100}
          label
        >
          {data.map((_, index) => (
            <Cell key={index} fill={COLORS[index]} />
          ))}
        </Pie>
        <Tooltip />
      </PieChart>
    </div>
  );
}