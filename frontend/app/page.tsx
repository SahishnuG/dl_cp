"use client";

import Link from "next/link";
import { useState } from "react";

export default function Home() {
  const [selectedRole, setSelectedRole] = useState<"candidate" | "recruiter" | null>(null);

  return (
    <div className="min-h-[calc(100vh-5rem)] flex items-center justify-center">
      <div className="max-w-4xl w-full space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-indigo-600 to-pink-600 dark:from-indigo-400 dark:to-pink-400 bg-clip-text text-transparent">
            Welcome to Karmafit
          </h1>
          <p className="text-xl text-slate-600 dark:text-slate-400">
            Choose your role to continue
          </p>
        </div>

        {/* Role Selection Cards */}
        <div className="grid md:grid-cols-2 gap-6 mt-12">
          {/* Candidate Card */}
          <Link href="/candidate-login">
            <div
              onMouseEnter={() => setSelectedRole("candidate")}
              onMouseLeave={() => setSelectedRole(null)}
              className={`group relative cursor-pointer transition-all duration-300 ${
                selectedRole === "candidate" ? "scale-105" : ""
              }`}
            >
              {/* Gradient border effect */}
              <div
                className={`absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl transition-opacity duration-300 blur-lg ${
                  selectedRole === "candidate" ? "opacity-100" : "opacity-0"
                }`}
              />

              <div className="relative bg-white dark:bg-slate-800 rounded-2xl p-8 border-2 border-slate-200 dark:border-slate-700 hover:border-indigo-500 dark:hover:border-indigo-400 transition-all duration-300 h-64 flex flex-col justify-between">
                {/* Icon */}
                <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-indigo-100 to-purple-200 dark:from-indigo-900 dark:to-purple-800 flex items-center justify-center text-4xl mb-4">
                  👤
                </div>

                {/* Content */}
                <div>
                  <h2 className="text-2xl font-bold mb-3 bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400 bg-clip-text text-transparent">
                    I'm a Candidate
                  </h2>
                  <p className="text-slate-600 dark:text-slate-400">
                    Upload your resume and get instant AI-powered analysis and feedback
                  </p>
                </div>

                {/* Arrow */}
                <div className="flex justify-end">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 flex items-center justify-center text-white group-hover:scale-110 transition-transform duration-300">
                    →
                  </div>
                </div>
              </div>
            </div>
          </Link>

          {/* Recruiter Card */}
          <Link href="/dashboard">
            <div
              onMouseEnter={() => setSelectedRole("recruiter")}
              onMouseLeave={() => setSelectedRole(null)}
              className={`group relative cursor-pointer transition-all duration-300 ${
                selectedRole === "recruiter" ? "scale-105" : ""
              }`}
            >
              {/* Gradient border effect */}
              <div
                className={`absolute inset-0 bg-gradient-to-r from-pink-500 to-rose-600 rounded-2xl transition-opacity duration-300 blur-lg ${
                  selectedRole === "recruiter" ? "opacity-100" : "opacity-0"
                }`}
              />

              <div className="relative bg-white dark:bg-slate-800 rounded-2xl p-8 border-2 border-slate-200 dark:border-slate-700 hover:border-pink-500 dark:hover:border-pink-400 transition-all duration-300 h-64 flex flex-col justify-between">
                {/* Icon */}
                <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-pink-100 to-rose-200 dark:from-pink-900 dark:to-rose-800 flex items-center justify-center text-4xl mb-4">
                  💼
                </div>

                {/* Content */}
                <div>
                  <h2 className="text-2xl font-bold mb-3 bg-gradient-to-r from-pink-600 to-rose-600 dark:from-pink-400 dark:to-rose-400 bg-clip-text text-transparent">
                    I'm a Recruiter
                  </h2>
                  <p className="text-slate-600 dark:text-slate-400">
                    Access the dashboard to review candidates and manage recruitment
                  </p>
                </div>

                {/* Arrow */}
                <div className="flex justify-end">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-r from-pink-500 to-rose-600 flex items-center justify-center text-white group-hover:scale-110 transition-transform duration-300">
                    →
                  </div>
                </div>
              </div>
            </div>
          </Link>
        </div>

        {/* Features */}
        <div className="mt-16 text-center grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <div className="text-3xl">⚡</div>
            <h3 className="font-semibold text-slate-900 dark:text-slate-100">
              Instant Analysis
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Get AI-powered resume insights in seconds
            </p>
          </div>
          <div className="space-y-2">
            <div className="text-3xl">🎯</div>
            <h3 className="font-semibold text-slate-900 dark:text-slate-100">
              Smart Matching
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Advanced candidate classification system
            </p>
          </div>
          <div className="space-y-2">
            <div className="text-3xl">📊</div>
            <h3 className="font-semibold text-slate-900 dark:text-slate-100">
              Detailed Reports
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Comprehensive scoring and recommendations
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}