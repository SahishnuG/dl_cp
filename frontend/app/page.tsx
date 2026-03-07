"use client";

import Link from "next/link";
import type { MouseEvent } from "react";
import { useState } from "react";

export default function Home() {
  const [selectedRole, setSelectedRole] = useState<"candidate" | "recruiter" | null>(null);

  const setSpotlight = (event: MouseEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    event.currentTarget.style.setProperty("--spot-x", `${event.clientX - rect.left}px`);
    event.currentTarget.style.setProperty("--spot-y", `${event.clientY - rect.top}px`);
  };

  return (
    <div className="relative min-h-[calc(100vh-5rem)] overflow-hidden py-10 sm:py-14">
      <div className="ambient-blob -left-[20%] top-[-20%] h-[720px] w-[920px] bg-[radial-gradient(circle,rgba(94,106,210,0.35),transparent_70%)]" />
      <div className="ambient-blob right-[-16%] top-[2%] h-[560px] w-[760px] bg-[radial-gradient(circle,rgba(107,116,225,0.22),transparent_70%)] [animation-delay:1.2s]" />
      <div className="ambient-blob bottom-[-30%] left-[25%] h-[620px] w-[920px] bg-[radial-gradient(circle,rgba(94,106,210,0.18),transparent_70%)] [animation-duration:10s]" />

      <div className="relative mx-auto w-full max-w-5xl space-y-10">
        <div className="space-y-5 text-center">
          <p className="label-mono">Resume Intelligence Platform</p>
          <h1 className="mx-auto max-w-4xl text-4xl font-semibold tracking-[-0.03em] text-transparent sm:text-6xl lg:text-7xl bg-gradient-to-b from-white via-white/95 to-white/70 bg-clip-text">
            Hire with clarity in a
            <span className="mx-3 bg-[linear-gradient(90deg,#5E6AD2,#8490ff,#5E6AD2)] bg-[length:200%_100%] bg-clip-text text-transparent animate-[gradient-shift_6s_ease_infinite]">
              single glance
            </span>
          </h1>
          <p className="mx-auto max-w-2xl text-base leading-relaxed text-[var(--foreground-muted)] sm:text-lg">
            Choose your role to continue. Candidates get immediate resume feedback, and recruiters move from signal to shortlist with fewer clicks.
          </p>
        </div>

        <div className="mt-4 grid gap-6 md:grid-cols-2">
          <Link href="/candidate-login">
            <div
              onMouseEnter={() => setSelectedRole("candidate")}
              onMouseLeave={() => setSelectedRole(null)}
              onMouseMove={setSpotlight}
              className={`ui-card ui-spotlight group cursor-pointer p-7 sm:p-8 ${
                selectedRole === "candidate" ? "border-[color:var(--border-accent)]" : ""
              }`}
            >
              <div className="absolute inset-0 z-[2] rounded-2xl bg-gradient-to-b from-[#5e6ad2]/30 to-transparent opacity-0 transition-opacity duration-300 [transition-timing-function:cubic-bezier(0.16,1,0.3,1)] group-hover:opacity-100" />
              <div className="relative z-[3] flex min-h-64 flex-col justify-between gap-7">
                <div>
                  <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-3xl shadow-[inset_0_1px_0_0_rgba(255,255,255,0.15)]">
                    👤
                  </div>
                  <h2 className="text-2xl font-semibold tracking-tight text-transparent bg-gradient-to-b from-white via-white/95 to-white/75 bg-clip-text">
                    I&apos;m a Candidate
                  </h2>
                  <p className="mt-3 max-w-md text-sm leading-relaxed text-[var(--foreground-muted)] sm:text-base">
                    Upload your resume and receive a clear AI report with strengths, growth areas, and fit breakdown.
                  </p>
                </div>

                <div className="flex items-center justify-between">
                  <span className="label-mono">Fast Feedback</span>
                  <span className="ui-btn-secondary h-9 w-9 text-lg">→</span>
                </div>
              </div>
            </div>
          </Link>

          <Link href="/dashboard">
            <div
              onMouseEnter={() => setSelectedRole("recruiter")}
              onMouseLeave={() => setSelectedRole(null)}
              onMouseMove={setSpotlight}
              className={`ui-card ui-spotlight group cursor-pointer p-7 sm:p-8 ${
                selectedRole === "recruiter" ? "border-[color:var(--border-accent)]" : ""
              }`}
            >
              <div className="absolute inset-0 z-[2] rounded-2xl bg-gradient-to-b from-[#5e6ad2]/30 to-transparent opacity-0 transition-opacity duration-300 [transition-timing-function:cubic-bezier(0.16,1,0.3,1)] group-hover:opacity-100" />
              <div className="relative z-[3] flex min-h-64 flex-col justify-between gap-7">
                <div>
                  <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-3xl shadow-[inset_0_1px_0_0_rgba(255,255,255,0.15)]">
                    💼
                  </div>
                  <h2 className="text-2xl font-semibold tracking-tight text-transparent bg-gradient-to-b from-white via-white/95 to-white/75 bg-clip-text">
                    I&apos;m a Recruiter
                  </h2>
                  <p className="mt-3 max-w-md text-sm leading-relaxed text-[var(--foreground-muted)] sm:text-base">
                    Open your dashboard to compare profiles, inspect fit metrics, and make confident shortlisting decisions.
                  </p>
                </div>

                <div className="flex items-center justify-between">
                  <span className="label-mono">Data-Driven Hiring</span>
                  <span className="ui-btn-secondary h-9 w-9 text-lg">→</span>
                </div>
              </div>
            </div>
          </Link>
        </div>

        <div className="grid gap-4 pt-2 text-center sm:grid-cols-3 sm:text-left">
          <div className="ui-card p-5">
            <p className="label-mono">Speed</p>
            <h3 className="mt-2 text-lg font-semibold text-[var(--foreground)]">Instant Analysis</h3>
            <p className="mt-1 text-sm text-[var(--foreground-muted)]">
              Live scoring and narrative summaries within seconds.
            </p>
          </div>

          <div className="ui-card p-5">
            <p className="label-mono">Clarity</p>
            <h3 className="mt-2 text-lg font-semibold text-[var(--foreground)]">Smart Matching</h3>
            <p className="mt-1 text-sm text-[var(--foreground-muted)]">
              Classification signals help teams align quickly.
            </p>
          </div>

          <div className="ui-card p-5">
            <p className="label-mono">Confidence</p>
            <h3 className="mt-2 text-lg font-semibold text-[var(--foreground)]">Detailed Reports</h3>
            <p className="mt-1 text-sm text-[var(--foreground-muted)]">
              Transparent metrics and recommendation context.
            </p>
          </div>
        </div>

        <div className="flex justify-center">
          <Link href="/candidate-login" className="ui-btn-primary px-6 py-3 text-sm sm:text-base">
            Start Candidate Flow
          </Link>
        </div>
      </div>
    </div>
  );
}