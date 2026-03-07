"use client";

import { useState } from "react";
import { useAuth } from "@clerk/nextjs";
import CandidateReport from "./CandidateReport";

export default function CandidateSearch() {
  const [candidateId, setCandidateId] = useState("");
  const [candidate, setCandidate] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const { getToken } = useAuth();

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    if (!candidateId.trim()) return;

    setIsLoading(true);
    setError("");

    try {
      const token = await getToken();
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      
      const response = await fetch(`${apiUrl}/api/candidates/search?q=${encodeURIComponent(candidateId)}`, {
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        if (response.status === 404) {
          setError("Candidate not found");
          setCandidate(null);
        } else {
          throw new Error("Failed to search candidate");
        }
      } else {
        const data = await response.json();
        setCandidate({
          id: data.candidate_id,
          ...data.analysis,
        });
      }
    } catch (err: any) {
      setError(err.message || "An error occurred while searching");
      setCandidate(null);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-indigo-600 to-pink-600 dark:from-indigo-400 dark:to-pink-400 bg-clip-text text-transparent">
          Candidate Search
        </h1>
        <p className="text-slate-600 dark:text-slate-400">
          Find and analyze candidate profiles
        </p>
      </div>

      {/* Search Section */}
      <div className="group relative">
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-pink-500 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-lg" />

        <form
          onSubmit={handleSearch}
          className="relative bg-white dark:bg-slate-800 rounded-2xl p-8 border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 transition-all duration-300 hover:shadow-xl"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-indigo-500 to-pink-500 opacity-5 rounded-full -mr-16 -mt-16" />

          <div className="relative z-10">
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">
              Search by Candidate ID
            </label>

            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1 relative">
                <input
                  type="text"
                  placeholder="Enter candidate ID (e.g., C001)"
                  value={candidateId}
                  onChange={(e) => setCandidateId(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:text-slate-50 placeholder:text-slate-500 dark:placeholder:text-slate-400 transition-all"
                />
              </div>

              <button
                onClick={() => handleSearch()}
                disabled={isLoading || !candidateId.trim()}
                className="px-6 py-3 bg-gradient-to-r from-indigo-500 to-pink-500 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-indigo-500/50 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Searching...
                  </>
                ) : (
                  <>
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                      />
                    </svg>
                    Search
                  </>
                )}
              </button>
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
              💡 Tip: Use candidate IDs like C001, C002, etc.
            </p>
          </div>
        </form>
      </div>

      {/* Results Section */}
      {candidate && (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          <CandidateReport candidate={candidate} />
        </div>
      )}

      {/* Error State */}
      {error && !candidate && (
        <div className="text-center py-12">
          <div className="text-4xl mb-4">❌</div>
          <p className="text-red-600 dark:text-red-400">
            {error}
          </p>
        </div>
      )}

      {/* Empty State */}
      {!candidate && !isLoading && !error && candidateId && (
        <div className="text-center py-12">
          <div className="text-4xl mb-4">🔍</div>
          <p className="text-slate-600 dark:text-slate-400">
            No candidate found. Try a different ID.
          </p>
        </div>
      )}
    </div>
  );
}