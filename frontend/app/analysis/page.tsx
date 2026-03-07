"use client";

import { useEffect, useState } from "react";
import { useAuth, useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";

export default function AnalysisPage() {
  const { isLoaded, isSignedIn, getToken } = useAuth();
  const { user } = useUser();
  const router = useRouter();
  const [analysis, setAnalysis] = useState<any>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.push("/candidate-login");
      return;
    }

    if (isLoaded && isSignedIn && user) {
      fetchAnalysis();
    }
  }, [isLoaded, isSignedIn, user]);

  useEffect(() => {
    return () => {
      if (imageUrl && imageUrl.startsWith("blob:")) {
        URL.revokeObjectURL(imageUrl);
      }
    };
  }, [imageUrl]);

  const fetchAnalysis = async () => {
    try {
      setIsLoading(true);
      const token = await getToken();
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      const candidateId = user?.id;

      const response = await fetch(
        `${apiUrl}/api/candidates/${candidateId}/full-analysis`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        if (response.status === 404) {
          setError("No resume analysis found. Please upload your resume first.");
        } else {
          throw new Error("Failed to load analysis");
        }
        return;
      }

      const data = await response.json();
      setAnalysis(data.analysis);

      // Fetch image with auth and convert to blob URL.
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
    } catch (err: any) {
      setError(err.message || "Failed to load your analysis");
    } finally {
      setIsLoading(false);
    }
  };

  if (!isLoaded || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-600 dark:text-slate-400">Loading your analysis...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl p-8 text-center">
          <div className="text-4xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-red-600 dark:text-red-400 mb-2">
            {error}
          </h2>
          <button
            onClick={() => router.push("/upload")}
            className="mt-4 px-6 py-3 bg-gradient-to-r from-indigo-500 to-pink-500 text-white font-semibold rounded-xl hover:shadow-lg transition-all"
          >
            Upload Resume
          </button>
        </div>
      </div>
    );
  }

  if (!analysis) {
    return null;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-indigo-600 to-pink-600 dark:from-indigo-400 dark:to-pink-400 bg-clip-text text-transparent">
          Your Resume Analysis
        </h1>
        <p className="text-slate-600 dark:text-slate-400">
          Comprehensive analysis of your resume and qualifications
        </p>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Resume Image */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-200">
            Resume Preview
          </h2>
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-lg">
            {imageUrl ? (
              <div className="relative w-full aspect-[8.5/11] bg-slate-100 dark:bg-slate-700 rounded-lg overflow-hidden">
                <img
                  src={imageUrl}
                  alt="Resume"
                  className="object-contain w-full h-full"
                />
              </div>
            ) : (
              <div className="flex items-center justify-center aspect-[8.5/11] bg-slate-100 dark:bg-slate-700 rounded-lg">
                <p className="text-slate-500">Resume image not available</p>
              </div>
            )}
          </div>
        </div>

        {/* Analysis Details */}
        <div className="space-y-6">
          {/* Personal Info */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-lg">
            <h3 className="text-lg font-semibold mb-4 text-slate-800 dark:text-slate-200">
              Personal Information
            </h3>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-slate-500 dark:text-slate-400">Name</p>
                <p className="font-semibold text-slate-800 dark:text-slate-200">
                  {analysis.name}
                </p>
              </div>
              <div>
                <p className="text-sm text-slate-500 dark:text-slate-400">Email</p>
                <p className="font-semibold text-slate-800 dark:text-slate-200">
                  {analysis.email || "Not specified"}
                </p>
              </div>
              <div>
                <p className="text-sm text-slate-500 dark:text-slate-400">Position</p>
                <p className="font-semibold text-slate-800 dark:text-slate-200">
                  {analysis.position}
                </p>
              </div>
              <div>
                <p className="text-sm text-slate-500 dark:text-slate-400">Experience</p>
                <p className="font-semibold text-slate-800 dark:text-slate-200">
                  {analysis.experience}
                </p>
              </div>
            </div>
          </div>

          {/* Classification & Overall Score */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-lg">
            <h3 className="text-lg font-semibold mb-4 text-slate-800 dark:text-slate-200">
              Overall Assessment
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-slate-600 dark:text-slate-400">Classification</span>
                <span
                  className={`px-4 py-2 rounded-full font-semibold ${
                    analysis.classification === "Strong Fit"
                      ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                      : analysis.classification === "Trainable Fit"
                      ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
                      : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                  }`}
                >
                  {analysis.classification}
                </span>
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-slate-600 dark:text-slate-400">Overall Score</span>
                  <span className="font-bold text-2xl text-indigo-600 dark:text-indigo-400">
                    {analysis.score}%
                  </span>
                </div>
                <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-3">
                  <div
                    className="bg-gradient-to-r from-indigo-500 to-pink-500 h-3 rounded-full transition-all duration-500"
                    style={{ width: `${analysis.score}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Score Breakdown */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-lg">
            <h3 className="text-lg font-semibold mb-4 text-slate-800 dark:text-slate-200">
              Score Breakdown
            </h3>
            <div className="space-y-4">
              {/* Technical Score */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-slate-600 dark:text-slate-400">Technical Skills</span>
                  <span className="font-semibold text-blue-600 dark:text-blue-400">
                    {analysis.technicalScore}%
                  </span>
                </div>
                <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                  <div
                    className="bg-blue-500 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${analysis.technicalScore}%` }}
                  />
                </div>
              </div>

              {/* Cultural Score */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-slate-600 dark:text-slate-400">Cultural Fit</span>
                  <span className="font-semibold text-purple-600 dark:text-purple-400">
                    {analysis.culturalScore}%
                  </span>
                </div>
                <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                  <div
                    className="bg-purple-500 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${analysis.culturalScore}%` }}
                  />
                </div>
              </div>

              {/* Growth Potential */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-slate-600 dark:text-slate-400">Growth Potential</span>
                  <span className="font-semibold text-green-600 dark:text-green-400">
                    {analysis.growthPotential}%
                  </span>
                </div>
                <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                  <div
                    className="bg-green-500 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${analysis.growthPotential}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Strengths & Weaknesses */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Strengths */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-lg">
          <h3 className="text-lg font-semibold mb-4 text-slate-800 dark:text-slate-200 flex items-center gap-2">
            <span className="text-2xl">💪</span>
            Strengths
          </h3>
          <div className="flex flex-wrap gap-2">
            {analysis.strengths.map((strength: string, index: number) => (
              <span
                key={index}
                className="px-3 py-1 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 rounded-full text-sm font-medium"
              >
                {strength}
              </span>
            ))}
          </div>
        </div>

        {/* Weaknesses */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-lg">
          <h3 className="text-lg font-semibold mb-4 text-slate-800 dark:text-slate-200 flex items-center gap-2">
            <span className="text-2xl">📚</span>
            Areas for Improvement
          </h3>
          <div className="flex flex-wrap gap-2">
            {analysis.weaknesses.map((weakness: string, index: number) => (
              <span
                key={index}
                className="px-3 py-1 bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400 rounded-full text-sm font-medium"
              >
                {weakness}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Action Button */}
      <div className="flex justify-center">
        <button
          onClick={() => router.push("/upload")}
          className="px-8 py-3 bg-gradient-to-r from-indigo-500 to-pink-500 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-indigo-500/50 transition-all duration-300"
        >
          Update Resume
        </button>
      </div>
    </div>
  );
}
