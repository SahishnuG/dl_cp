"use client";

export default function DashboardStats() {
  // Replace with backend API call later
  const data = {
    total: 120,
    strong: 45,
    trainable: 50,
    risky: 25,
  };

  return (
    <div className="grid grid-cols-4 gap-4">
      <StatCard title="Total Resumes" value={data.total} />
      <StatCard title="Strong Fit" value={data.strong} color="bg-green-500" />
      <StatCard title="Trainable Fit" value={data.trainable} color="bg-yellow-500" />
      <StatCard title="Risky Fit" value={data.risky} color="bg-red-500" />
    </div>
  );
}

function StatCard({ title, value, color = "bg-blue-600" }: any) {
  return (
    <div className={`p-4 rounded-xl text-white ${color}`}>
      <h3 className="text-sm">{title}</h3>
      <p className="text-2xl font-bold">{value}</p>
    </div>
  );
}