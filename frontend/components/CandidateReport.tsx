export interface CandidateProfile {
  id: string;
  name: string;
  email?: string;
  experience?: string;
  classification: string;
  score: number;
  ethicalScore?: number;
  integrityRisk?: number;
  longTermRetention?: number;
  workforceAlignment?: number;
  explainability?: string;
}

function getClassificationColor(classification: string) {
  switch (classification) {
    case "Strong Fit":
      return { bg: "from-emerald-500 to-emerald-600", icon: "⭐" };
    case "Trainable Fit":
      return { bg: "from-amber-500 to-amber-600", icon: "🎯" };
    case "Risky Fit":
      return { bg: "from-rose-500 to-rose-600", icon: "⚠️" };
    default:
      return { bg: "from-[#5e6ad2] to-[#6872d9]", icon: "❓" };
  }
}

export default function CandidateReport({ candidate }: { candidate: CandidateProfile }) {
  const colors = getClassificationColor(candidate.classification);

  const scoreRows = [
    { label: "Overall Score", value: candidate.score, color: "from-[#5e6ad2] to-[#6872d9]" },
    { label: "Ethical Score", value: candidate.ethicalScore, color: "from-blue-500 to-indigo-500" },
    { label: "Integrity Risk", value: candidate.integrityRisk, color: "from-rose-500 to-orange-500" },
    { label: "Long-Term Retention", value: candidate.longTermRetention, color: "from-violet-500 to-fuchsia-500" },
    { label: "Workforce Alignment", value: candidate.workforceAlignment, color: "from-emerald-500 to-teal-500" },
  ].filter((row): row is { label: string; value: number; color: string } => typeof row.value === "number");

  return (
    <section className="ui-card ui-spotlight overflow-hidden">
      <div className="border-b border-white/10 p-7 sm:p-8">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="label-mono mb-3">Candidate Snapshot</p>
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-xl">
                {colors.icon}
              </div>
              <div>
                <h2 className="bg-gradient-to-b from-white via-white/95 to-white/70 bg-clip-text text-2xl font-semibold tracking-tight text-transparent sm:text-3xl">
                  {candidate.name}
                </h2>
                <p className="text-sm text-[var(--foreground-muted)]">ID: {candidate.id}</p>
              </div>
            </div>

            <div className="mt-4 flex flex-wrap gap-2 text-sm text-[var(--foreground-muted)]">
              {candidate.email && <span className="ui-badge">📧 {candidate.email}</span>}
              {candidate.experience && <span className="ui-badge">⏳ {candidate.experience}</span>}
            </div>
          </div>

          <div className="text-left sm:text-right">
            <span className={`inline-flex rounded-full bg-gradient-to-r ${colors.bg} px-5 py-2 text-sm font-semibold text-white shadow-[0_6px_20px_rgba(0,0,0,0.3)]`}>
              {candidate.classification}
            </span>
            <p className="mt-2 text-xs text-[var(--foreground-muted)]">Match Quality</p>
          </div>
        </div>
      </div>

      <div className="border-b border-white/10 p-7 sm:p-8">
        <h3 className="mb-4 text-lg font-semibold text-[var(--foreground)]">Performance Metrics</h3>
        <div className="grid gap-4 md:grid-cols-2">
          {scoreRows.map((row) => (
            <ScoreRow key={row.label} label={row.label} value={row.value} color={row.color} />
          ))}
        </div>
      </div>

      <div className="p-7 sm:p-8">
        <div>
          <h3 className="mb-4 text-lg font-semibold text-[var(--foreground)]">Explainability</h3>
          <div className="rounded-xl border border-white/10 bg-white/5 p-4 text-sm leading-relaxed text-[var(--foreground-muted)]">
            {candidate.explainability || "No explainability details available."}
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-3 border-t border-white/10 p-7 sm:flex-row sm:p-8">
        <button className="ui-btn-primary flex-1 px-5 py-3 text-sm">Contact Candidate</button>
        <button className="ui-btn-secondary flex-1 px-5 py-3 text-sm">Schedule Interview</button>
      </div>
    </section>
  );
}

function ScoreRow({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-4">
      <div className="mb-2 flex items-center justify-between text-sm">
        <span className="text-[var(--foreground-muted)]">{label}</span>
        <span className={`bg-gradient-to-r ${color} bg-clip-text font-semibold text-transparent`}>{value}%</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-white/10">
        <div className={`h-full rounded-full bg-gradient-to-r ${color}`} style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}