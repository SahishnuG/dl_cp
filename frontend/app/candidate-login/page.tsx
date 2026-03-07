"use client";

import { SignIn, useAuth } from "@clerk/nextjs";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function CandidateLogin() {
  const { isLoaded, userId } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoaded && userId) {
      router.push("/upload");
    }
  }, [isLoaded, userId, router]);

  return (
    <div className="min-h-[calc(100vh-5rem)] flex items-center justify-center">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-indigo-100 to-purple-200 dark:from-indigo-900 dark:to-purple-800 text-4xl mb-4">
            👤
          </div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400 bg-clip-text text-transparent">
            Candidate Access
          </h2>
          <p className="mt-2 text-slate-600 dark:text-slate-400">
            Sign in or sign up with Clerk to continue
          </p>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-xl flex justify-center">
          <SignIn
            routing="hash"
            forceRedirectUrl="/upload"
            fallbackRedirectUrl="/upload"
            signUpUrl="/sign-up"
          />
        </div>
      </div>
    </div>
  );
}
