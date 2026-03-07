"use client";

import type { MouseEvent } from "react";

export default function DashboardStats() {
  // Replace with backend API call later
  const data = {
    total: 120,
    strong: 45,
    trainable: 50,
    risky: 25,
  };

  const setSpotlight = (event: MouseEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    event.currentTarget.style.setProperty("--spot-x", `${event.clientX - rect.left}px`);
    event.currentTarget.style.setProperty("--spot-y", `${event.clientY - rect.top}px`);
  };

  return (
    <div>
      <p className="label-mono mb-3">Recruiter Workspace</p>
      <h1 className="mb-2 bg-gradient-to-b from-white via-white/95 to-white/75 bg-clip-text text-3xl font-semibold tracking-tight text-transparent sm:text-4xl">
        Dashboard
      </h1>
      <p className="mb-8 text-[var(--foreground-muted)]">
        Overview of your recruitment pipeline
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Resumes"
          value={data.total}
          icon="📋"
          gradient="from-indigo-500 to-indigo-600"
          iconBg="from-[#5e6ad2]/25 to-[#6872d9]/15"
          setSpotlight={setSpotlight}
        />
        <StatCard
          title="Strong Fit"
          value={data.strong}
          icon="⭐"
          gradient="from-emerald-500 to-emerald-600"
          iconBg="from-emerald-500/25 to-emerald-500/10"
          setSpotlight={setSpotlight}
        />
        <StatCard
          title="Trainable Fit"
          value={data.trainable}
          icon="🎯"
          gradient="from-amber-500 to-amber-600"
          iconBg="from-amber-500/25 to-amber-500/10"
          setSpotlight={setSpotlight}
        />
        <StatCard
          title="Risky Fit"
          value={data.risky}
          icon="⚠️"
          gradient="from-rose-500 to-rose-600"
          iconBg="from-rose-500/25 to-rose-500/10"
          setSpotlight={setSpotlight}
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
  setSpotlight,
}: {
  title: string;
  value: number;
  icon: string;
  gradient: string;
  iconBg: string;
  setSpotlight: (event: MouseEvent<HTMLDivElement>) => void;
}) {
  return (
    <div onMouseMove={setSpotlight} className="ui-card ui-spotlight group p-6">
      <div className="absolute right-[-52px] top-[-52px] h-28 w-28 rounded-full bg-gradient-to-br from-white/10 to-transparent blur-xl" />

      <div className="relative z-[3]">
        <div
          className={`mb-4 flex h-14 w-14 items-center justify-center rounded-xl border border-white/10 bg-gradient-to-br ${iconBg} text-2xl shadow-[inset_0_1px_0_0_rgba(255,255,255,0.15)]`}
        >
          {icon}
        </div>

        <h3 className="mb-2 text-sm font-medium text-[var(--foreground-muted)]">
          {title}
        </h3>
        <p className={`text-3xl font-semibold bg-gradient-to-r ${gradient} bg-clip-text text-transparent`}>
          {value}
        </p>

        <div className="mt-4 h-1 overflow-hidden rounded-full bg-white/10">
          <div
            className={`h-full bg-gradient-to-r ${gradient} transition-all duration-500`}
            style={{
              width: `${((value % 120) / 120) * 100}%`,
            }}
          />
        </div>

        <p className="mt-3 label-mono">
            {title}
          </p>
      </div>
    </div>
  );
}