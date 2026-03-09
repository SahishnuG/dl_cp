"use client";

import type { FormEvent, MouseEvent } from "react";
import { useState } from "react";
import { useAuth } from "@clerk/nextjs";
import CandidateReport, { type CandidateProfile } from "./CandidateReport";

interface SearchResult {
  candidate_id: string;
  username: string;
  name: string;
  analysis: Omit<CandidateProfile, "id">;
}

async function parseJsonSafely<T>(response: Response): Promise<T> {
  const raw = await response.text();
  try {
    return JSON.parse(raw) as T;
  } catch {
    const snippet = raw.slice(0, 180).replace(/\s+/g, " ").trim();
    throw new Error(`Expected JSON response, got: ${snippet || "<empty response>"}`);
  }
}

export default function CandidateSearch() {
  const [candidateId, setCandidateId] = useState("");
  const [hasSearched, setHasSearched] = useState(false);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [selectedCandidate, setSelectedCandidate] = useState<CandidateProfile | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const { getToken } = useAuth();

  const setSpotlight = (event: MouseEvent<HTMLFormElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    event.currentTarget.style.setProperty("--spot-x", `${event.clientX - rect.left}px`);
    event.currentTarget.style.setProperty("--spot-y", `${event.clientY - rect.top}px`);
  };

  const handleSearch = async (e?: FormEvent) => {
    if (e) e.preventDefault();

    const query = candidateId.trim();
    if (!query) return;

    setIsLoading(true);
    setError("");
    setSearchResults([]);
    setSelectedCandidate(null);

    try {
      const token = await getToken();
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      
      const response = await fetch(
        `${apiUrl}/api/candidates/search?q=${encodeURIComponent(query)}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
            "ngrok-skip-browser-warning": "true",
          },
        }
      );

      if (!response.ok) {
        if (response.status === 404) {
          setError("No candidates found");
          setSearchResults([]);
        } else {
          throw new Error("Failed to search candidate");
        }
      } else {
        const data = await parseJsonSafely<{
          results: SearchResult[];
          count: number;
        }>(response);
        setSearchResults(data.results);
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "An error occurred while searching";
      setError(message);
      setSearchResults([]);
    } finally {
      setHasSearched(true);
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <p className="label-mono mb-2">Recruiter Tools</p>
        <h1 className="mb-2 bg-gradient-to-b from-white via-white/95 to-white/70 bg-clip-text text-3xl font-semibold tracking-tight text-transparent sm:text-4xl">
          Candidate Search
        </h1>
        <p className="text-[var(--foreground-muted)]">
          Find and analyze candidate profiles
        </p>
      </div>

      <form onSubmit={handleSearch} onMouseMove={setSpotlight} className="ui-card ui-spotlight p-6 sm:p-8">
        <div className="relative z-[3]">
          <label className="mb-3 block text-sm font-semibold text-[var(--foreground)]">Search Candidates</label>

          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search by ID, username, or name..."
                value={candidateId}
                onChange={(e) => {
                  setCandidateId(e.target.value);
                  setHasSearched(false);
                }}
                className="ui-input"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading || !candidateId.trim()}
              className="ui-btn-primary min-w-36 px-6 py-3 text-sm disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Searching...
                </>
              ) : (
                "Search"
              )}
            </button>
          </div>

          <p className="mt-2 text-xs text-[var(--foreground-muted)]">Search by candidate ID, username, or name (partial matches supported).</p>
        </div>
      </form>

      {searchResults.length > 0 && !selectedCandidate && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white">
              Found {searchResults.length} {searchResults.length === 1 ? "candidate" : "candidates"}
            </h2>
          </div>
          
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {searchResults.map((result) => {
              const classification = result.analysis.classification || "Unknown";
              const score = result.analysis.score || 0;
              
              return (
                <button
                  key={result.candidate_id}
                  onClick={() => setSelectedCandidate({ id: result.candidate_id, ...result.analysis })}
                  className="ui-card group cursor-pointer p-5 text-left transition-all hover:scale-[1.02]"
                >
                  <div className="mb-3 flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-white">{result.name}</h3>
                      <p className="text-sm text-[var(--foreground-muted)]">@{result.username}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-white">{score}</div>
                      <div className="text-xs text-[var(--foreground-muted)]">Score</div>
                    </div>
                  </div>
                  
                  <div className="mb-3">
                    <span
                      className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${
                        classification === "Strong Fit"
                          ? "bg-emerald-500/20 text-emerald-300"
                          : classification === "Trainable Fit"
                          ? "bg-amber-500/20 text-amber-300"
                          : "bg-rose-500/20 text-rose-300"
                      }`}
                    >
                      {classification}
                    </span>
                  </div>
                  
                  <p className="line-clamp-2 text-sm text-[var(--foreground-muted)]">
                    {result.analysis.explainability || "No explainability summary available"}
                  </p>
                  
                  <div className="mt-3 flex items-center gap-2 text-sm text-[var(--accent)]">
                    <span>View Full Report</span>
                    <span className="transition-transform group-hover:translate-x-1">→</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {selectedCandidate && (
        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {searchResults.length > 1 && (
            <button
              onClick={() => setSelectedCandidate(null)}
              className="ui-btn-secondary px-4 py-2 text-sm"
            >
              ← Back to Results
            </button>
          )}
          <CandidateReport candidate={selectedCandidate} />
        </div>
      )}

      {hasSearched && error && searchResults.length === 0 && !selectedCandidate && (
        <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-4 text-sm text-rose-300">
          {error}
        </div>
      )}

      {hasSearched && !selectedCandidate && !isLoading && !error && candidateId && searchResults.length === 0 && (
        <div className="ui-card p-6 text-center text-sm text-[var(--foreground-muted)]">
          No candidates found. Try a different search term.
        </div>
      )}
    </div>
  );
}