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
    <div>
      <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-indigo-600 to-pink-600 dark:from-indigo-400 dark:to-pink-400 bg-clip-text text-transparent">
        Dashboard
      </h1>
      <p className="text-slate-600 dark:text-slate-400 mb-8">
        Overview of your recruitment pipeline
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Resumes"
          value={data.total}
          icon="📋"
          gradient="from-indigo-500 to-indigo-600"
          iconBg="from-indigo-100 to-indigo-200 dark:from-indigo-900 dark:to-indigo-800"
        />
        <StatCard
          title="Strong Fit"
          value={data.strong}
          icon="⭐"
          gradient="from-emerald-500 to-emerald-600"
          iconBg="from-emerald-100 to-emerald-200 dark:from-emerald-900 dark:to-emerald-800"
        />
        <StatCard
          title="Trainable Fit"
          value={data.trainable}
          icon="🎯"
          gradient="from-amber-500 to-amber-600"
          iconBg="from-amber-100 to-amber-200 dark:from-amber-900 dark:to-amber-800"
        />
        <StatCard
          title="Risky Fit"
          value={data.risky}
          icon="⚠️"
          gradient="from-rose-500 to-rose-600"
          iconBg="from-rose-100 to-rose-200 dark:from-rose-900 dark:to-rose-800"
        />
      </div>
    </div>
  );
}

function StatCard({
  title,
  value,
  icon,
  gradient,
  iconBg,
}: {
  title: string;
  value: number;
  icon: string;
  gradient: string;
  iconBg: string;
}) {
  return (
    <div className="group relative">
      {/* Gradient border */}
      <div
        className={`absolute inset-0 bg-gradient-to-r ${gradient} rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-lg`}
      />

      <div className="relative bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 transition-all duration-300 hover:shadow-xl overflow-hidden">
        {/* Background accent */}
        <div
          className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${gradient} opacity-5 rounded-full -mr-16 -mt-16`}
        />

        <div className="relative z-10">
          {/* Icon */}
          <div
            className={`w-14 h-14 rounded-xl bg-gradient-to-br ${iconBg} flex items-center justify-center text-2xl mb-4`}
          >
            {icon}
          </div>

          {/* Title and Value */}
          <h3 className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">
            {title}
          </h3>
          <p className={`text-3xl font-bold bg-gradient-to-r ${gradient} bg-clip-text text-transparent`}>
            {value}
          </p>

          {/* Progress indicator */}
          <div className="mt-4 h-1 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
            <div
              className={`h-full bg-gradient-to-r ${gradient} transition-all duration-500`}
              style={{
                width: `${((value % 120) / 120) * 100}%`,
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}