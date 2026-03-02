export default function CandidateReport({ candidate }: any) {
  const getClassificationColor = (classification: string) => {
    switch (classification) {
      case "Strong Fit":
        return {
          bg: "from-emerald-500 to-emerald-600",
          icon: "⭐",
          light: "from-emerald-100 to-emerald-200 dark:from-emerald-900 dark:to-emerald-800",
        };
      case "Trainable Fit":
        return {
          bg: "from-amber-500 to-amber-600",
          icon: "🎯",
          light: "from-amber-100 to-amber-200 dark:from-amber-900 dark:to-amber-800",
        };
      case "Risky Fit":
        return {
          bg: "from-rose-500 to-rose-600",
          icon: "⚠️",
          light: "from-rose-100 to-rose-200 dark:from-rose-900 dark:to-rose-800",
        };
      default:
        return {
          bg: "from-indigo-500 to-indigo-600",
          icon: "❓",
          light: "from-indigo-100 to-indigo-200 dark:from-indigo-900 dark:to-indigo-800",
        };
    }
  };

  const colors = getClassificationColor(candidate.classification);

  return (
    <div className="group relative">
      <div
        className={`absolute inset-0 bg-gradient-to-r ${colors.bg} rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-lg`}
      />

      <div className="relative bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 transition-all duration-300 hover:shadow-xl overflow-hidden">
        <div
          className={`absolute top-0 right-0 w-40 h-40 bg-gradient-to-br ${colors.bg} opacity-5 rounded-full -mr-20 -mt-20`}
        />

        {/* Header Section */}
        <div className="relative z-10 bg-gradient-to-r from-slate-50 dark:from-slate-700/50 to-transparent p-8 border-b border-slate-200 dark:border-slate-700">
          <div className="flex items-start justify-between gap-6">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-4">
                <div
                  className={`w-12 h-12 rounded-lg bg-gradient-to-br ${colors.light} flex items-center justify-center text-xl`}
                >
                  {colors.icon}
                </div>
                <div>
                  <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-50">
                    {candidate.name}
                  </h2>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    ID: {candidate.id}
                  </p>
                </div>
              </div>

              {candidate.email && (
                <p className="text-slate-700 dark:text-slate-300 flex items-center gap-2">
                  <span>📧</span> {candidate.email}
                </p>
              )}
              {candidate.position && (
                <p className="text-slate-700 dark:text-slate-300 flex items-center gap-2">
                  <span>💼</span> {candidate.position}
                </p>
              )}
            </div>

            {/* Classification Badge */}
            <div className="text-right">
              <div
                className={`inline-block bg-gradient-to-r ${colors.bg} text-white px-6 py-3 rounded-xl font-bold text-lg mb-2 shadow-lg`}
              >
                {candidate.classification}
              </div>
              <p className="text-slate-600 dark:text-slate-400 text-sm">
                Match Score
              </p>
            </div>
          </div>
        </div>

        {/* Scoring Section */}
        <div className="relative z-10 p-8 border-b border-slate-200 dark:border-slate-700">
          <h3 className="text-xl font-bold text-slate-900 dark:text-slate-50 mb-6">
            Performance Metrics
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <ScoreCard label="Overall Score" value={candidate.score} color="from-indigo-500 to-indigo-600" />
            {candidate.technicalScore && (
              <ScoreCard
                label="Technical Skills"
                value={candidate.technicalScore}
                color="from-purple-500 to-purple-600"
              />
            )}
            {candidate.culturalScore && (
              <ScoreCard
                label="Cultural Fit"
                value={candidate.culturalScore}
                color="from-pink-500 to-pink-600"
              />
            )}
            {candidate.growthPotential && (
              <ScoreCard
                label="Growth Potential"
                value={candidate.growthPotential}
                color="from-amber-500 to-amber-600"
              />
            )}
          </div>

          {candidate.experience && (
            <div className="mt-6 p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg border border-slate-200 dark:border-slate-600">
              <p className="text-sm text-slate-600 dark:text-slate-400">Experience Level</p>
              <p className="font-semibold text-slate-900 dark:text-slate-50">
                {candidate.experience}
              </p>
            </div>
          )}
        </div>

        {/* Strengths & Weaknesses */}
        <div className="relative z-10 p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Strengths */}
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-slate-50 mb-4 flex items-center gap-2">
                <span className="text-2xl">✅</span> Strengths
              </h3>
              <div className="space-y-2">
                {candidate.strengths.map((strength: string, i: number) => (
                  <div
                    key={i}
                    className="flex items-center gap-3 p-3 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-lg"
                  >
                    <div className="w-2 h-2 bg-emerald-500 rounded-full" />
                    <span className="font-medium text-slate-900 dark:text-slate-50">
                      {strength}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Weaknesses */}
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-slate-50 mb-4 flex items-center gap-2">
                <span className="text-2xl">⚡</span> Development Areas
              </h3>
              <div className="space-y-2">
                {candidate.weaknesses.map((weakness: string, i: number) => (
                  <div
                    key={i}
                    className="flex items-center gap-3 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg"
                  >
                    <div className="w-2 h-2 bg-amber-500 rounded-full" />
                    <span className="font-medium text-slate-900 dark:text-slate-50">
                      {weakness}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="relative z-10 p-8 border-t border-slate-200 dark:border-slate-700 flex gap-3">
          <button className="flex-1 px-6 py-3 bg-gradient-to-r from-indigo-500 to-indigo-600 text-white font-semibold rounded-lg hover:shadow-lg hover:shadow-indigo-500/50 transition-all duration-300">
            Contact Candidate
          </button>
          <button className="flex-1 px-6 py-3 bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-slate-50 font-semibold rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors">
            Schedule Interview
          </button>
        </div>
      </div>
    </div>
  );
}

function ScoreCard({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: string;
}) {
  return (
    <div className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg border border-slate-200 dark:border-slate-600">
      <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">{label}</p>

      {/* Circular Progress */}
      <div className="flex items-center justify-between">
        <div className="relative w-16 h-16">
          <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90">
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="text-slate-200 dark:text-slate-600"
            />
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke="url(#grad)"
              strokeWidth="2"
              strokeDasharray={`${2 * Math.PI * 45 * (value / 100)} ${2 * Math.PI * 45}`}
              strokeLinecap="round"
              className="transition-all duration-500"
            />
            <defs>
              <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="currentColor" />
              </linearGradient>
            </defs>
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className={`text-lg font-bold bg-gradient-to-r ${color} bg-clip-text text-transparent`}>
              {value}
            </span>
          </div>
        </div>
        <div className="flex-1 ml-4">
          <div className="h-2 bg-slate-200 dark:bg-slate-600 rounded-full overflow-hidden">
            <div
              className={`h-full bg-gradient-to-r ${color} transition-all duration-500`}
              style={{ width: `${value}%` }}
            />
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
            {value}%
          </p>
        </div>
      </div>
    </div>
  );
}