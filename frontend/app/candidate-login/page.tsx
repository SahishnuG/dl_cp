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
    <div className="relative flex min-h-[calc(100vh-5rem)] items-center justify-center overflow-hidden py-12">
      <div className="ambient-blob left-[-15%] top-[-10%] h-[480px] w-[640px] bg-[radial-gradient(circle,rgba(94,106,210,0.25),transparent_70%)]" />
      <div className="ambient-blob right-[-12%] bottom-[-18%] h-[520px] w-[700px] bg-[radial-gradient(circle,rgba(104,114,217,0.16),transparent_70%)] [animation-delay:1.4s]" />

      <div className="relative z-[3] w-full max-w-md space-y-8">
        <div className="text-center">
          <p className="label-mono mb-4">Secure Candidate Portal</p>
          <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full border border-white/10 bg-white/5 text-4xl shadow-[inset_0_1px_0_0_rgba(255,255,255,0.15)]">
            👤
          </div>
          <h2 className="bg-gradient-to-b from-white via-white/95 to-white/75 bg-clip-text text-3xl font-semibold tracking-tight text-transparent">
            Candidate Access
          </h2>
          <p className="mt-2 text-[var(--foreground-muted)]">
            Sign in or sign up with Clerk to continue
          </p>
        </div>

        <div className="ui-card ui-spotlight p-6">
          <SignIn
            routing="hash"
            forceRedirectUrl="/upload"
            fallbackRedirectUrl="/upload"
            signUpUrl="/sign-up"
            appearance={{
              elements: {
                footer: "hidden",
                footerAction: "hidden",
                footerActionText: "hidden",
                developmentModeWarning: "hidden",
              },
            }}
          />
        </div>

        <div className="text-center text-xs text-[var(--foreground-muted)]">
          <p>Karmafit Secure Access</p>
          <p className="mt-1">Your data is encrypted in transit and at rest.</p>
        </div>
      </div>
    </div>
  );
}
