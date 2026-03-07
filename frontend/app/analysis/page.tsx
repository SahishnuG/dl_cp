"use client";

import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import { useAuth, useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";

interface AnalysisData {
  name: string;
  email?: string;
  position?: string;
  experience?: string;
  classification: string;
  score: number;
  technicalScore: number;
  culturalScore: number;
  growthPotential: number;
  strengths: string[];
  weaknesses: string[];
}

export default function AnalysisPage() {
  const { isLoaded, isSignedIn, getToken } = useAuth();
  const { user } = useUser();
  const router = useRouter();
  const [analysis, setAnalysis] = useState<AnalysisData | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchAnalysis = useCallback(async () => {
    try {
      setIsLoading(true);
      const token = await getToken();
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      const candidateId = user?.id;

      const response = await fetch(`${apiUrl}/api/candidates/${candidateId}/full-analysis`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        if (response.status === 404) {
          setError("No resume analysis found. Please upload your resume first.");
        } else {
          throw new Error("Failed to load analysis");
        }
        return;
      }

      const data = (await response.json()) as { analysis: AnalysisData; resume_image_url?: string };
      setAnalysis(data.analysis);

      if (data.resume_image_url) {
        const imageResponse = await fetch(`${apiUrl}${data.resume_image_url}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (imageResponse.ok) {
          const imageBlob = await imageResponse.blob();
          const blobUrl = URL.createObjectURL(imageBlob);
          setImageUrl(blobUrl);
        } else {
          setImageUrl(null);
        }
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to load your analysis";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, [getToken, user?.id]);

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.push("/candidate-login");
      return;
    }

    if (isLoaded && isSignedIn && user) {
      fetchAnalysis();
    }
  }, [fetchAnalysis, isLoaded, isSignedIn, router, user]);

  useEffect(() => {
    return () => {
      if (imageUrl && imageUrl.startsWith("blob:")) {
        URL.revokeObjectURL(imageUrl);
      }
    };
  }, [imageUrl]);

  if (!isLoaded || isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mx-auto mb-4 h-14 w-14 animate-spin rounded-full border-4 border-[var(--accent)] border-t-transparent" />
          <p className="text-[var(--foreground-muted)]">Loading your analysis...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-8">
        <div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 p-8 text-center">
          <div className="mb-4 text-4xl">⚠️</div>
          <h2 className="mb-2 text-2xl font-semibold text-rose-300">{error}</h2>
          <button onClick={() => router.push("/upload")} className="ui-btn-primary mt-4 px-6 py-3 text-sm">
            Upload Resume
          </button>
        </div>
      </div>
    );
  }

  if (!analysis) {
    return null;
  }

  const classificationStyles: Record<string, string> = {
    "Strong Fit": "border-emerald-500/30 bg-emerald-500/10 text-emerald-300",
    "Trainable Fit": "border-amber-500/30 bg-amber-500/10 text-amber-300",
    "Risky Fit": "border-rose-500/30 bg-rose-500/10 text-rose-300",
  };

  return (
    <div className="mx-auto max-w-6xl space-y-8 px-4 py-8">
      <div>
        <p className="label-mono mb-2">Candidate Perspective</p>
        <h1 className="mb-2 bg-gradient-to-b from-white via-white/95 to-white/70 bg-clip-text text-3xl font-semibold tracking-tight text-transparent sm:text-4xl">
          Your Resume Analysis
        </h1>
        <p className="text-[var(--foreground-muted)]">
          Comprehensive analysis of your resume and qualifications
        </p>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-[var(--foreground)]">Resume Preview</h2>
          <div className="ui-card p-4">
            {imageUrl ? (
              <div className="relative aspect-[8.5/11] w-full overflow-hidden rounded-lg border border-white/10 bg-black/20">
                <Image
                  src={imageUrl}
                  alt="Resume"
                  fill
                  unoptimized
                  className="h-full w-full object-contain"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
              </div>
            ) : (
              <div className="flex aspect-[8.5/11] items-center justify-center rounded-lg border border-white/10 bg-white/5">
                <p className="text-[var(--foreground-muted)]">Resume image not available</p>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <section className="ui-card p-6">
            <h3 className="mb-4 text-lg font-semibold text-[var(--foreground)]">Personal Information</h3>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-[var(--foreground-muted)]">Name</p>
                <p className="font-semibold text-[var(--foreground)]">{analysis.name}</p>
              </div>
              <div>
                <p className="text-sm text-[var(--foreground-muted)]">Email</p>
                <p className="font-semibold text-[var(--foreground)]">{analysis.email || "Not specified"}</p>
              </div>
              <div>
                <p className="text-sm text-[var(--foreground-muted)]">Position</p>
                <p className="font-semibold text-[var(--foreground)]">{analysis.position || "Not specified"}</p>
              </div>
              <div>
                <p className="text-sm text-[var(--foreground-muted)]">Experience</p>
                <p className="font-semibold text-[var(--foreground)]">{analysis.experience || "Not specified"}</p>
              </div>
            </div>
          </section>

          <section className="ui-card p-6">
            <h3 className="mb-4 text-lg font-semibold text-[var(--foreground)]">Overall Assessment</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-[var(--foreground-muted)]">Classification</span>
                <span className={`rounded-full border px-4 py-2 font-semibold ${classificationStyles[analysis.classification] || "border-white/15 bg-white/10 text-[var(--foreground)]"}`}>
                  {analysis.classification}
                </span>
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[var(--foreground-muted)]">Overall Score</span>
                  <span className="text-2xl font-semibold text-[var(--accent-bright)]">{analysis.score}%</span>
                </div>
                <div className="h-3 w-full rounded-full bg-white/10">
                  <div className="h-3 rounded-full bg-gradient-to-r from-[#5e6ad2] to-[#6872d9]" style={{ width: `${analysis.score}%` }} />
                </div>
              </div>
            </div>
          </section>

          <section className="ui-card p-6">
            <h3 className="mb-4 text-lg font-semibold text-[var(--foreground)]">Score Breakdown</h3>
            <div className="space-y-4">
              <MetricRow label="Technical Skills" value={analysis.technicalScore} color="from-blue-500 to-indigo-500" />
              <MetricRow label="Cultural Fit" value={analysis.culturalScore} color="from-violet-500 to-fuchsia-500" />
              <MetricRow label="Growth Potential" value={analysis.growthPotential} color="from-emerald-500 to-teal-500" />
            </div>
          </section>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
        <section className="ui-card p-6">
          <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-[var(--foreground)]">
            <span className="text-2xl">💪</span> Strengths
          </h3>
          <div className="flex flex-wrap gap-2">
            {analysis.strengths.map((strength: string, index: number) => (
              <span
                key={index}
                className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-sm font-medium text-emerald-300"
              >
                {strength}
              </span>
            ))}
          </div>
        </section>

        <section className="ui-card p-6">
          <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-[var(--foreground)]">
            <span className="text-2xl">📚</span> Areas for Improvement
          </h3>
          <div className="flex flex-wrap gap-2">
            {analysis.weaknesses.map((weakness: string, index: number) => (
              <span
                key={index}
                className="rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-sm font-medium text-amber-300"
              >
                {weakness}
              </span>
            ))}
          </div>
        </section>
      </div>

      <div className="flex justify-center">
        <button onClick={() => router.push("/upload")} className="ui-btn-primary px-8 py-3 text-sm">
          Update Resume
        </button>
      </div>
    </div>
  );
}

function MetricRow({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <span className="text-[var(--foreground-muted)]">{label}</span>
        <span className={`bg-gradient-to-r ${color} bg-clip-text font-semibold text-transparent`}>{value}%</span>
      </div>
      <div className="h-2 w-full rounded-full bg-white/10">
        <div className={`h-2 rounded-full bg-gradient-to-r ${color}`} style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}
