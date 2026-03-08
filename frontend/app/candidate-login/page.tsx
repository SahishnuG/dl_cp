"use client";

import { useSignIn, useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";

type OAuthStrategy = "oauth_google" | "oauth_github" | "oauth_discord";

export default function CandidateLogin() {
  const router = useRouter();
  const { isLoaded, userId } = useAuth();
  const { signIn, isLoaded: signInLoaded, setActive } = useSignIn();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isLoaded && userId) {
      router.push("/upload");
    }
  }, [isLoaded, userId, router]);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!signInLoaded) return;

    setError("");
    setIsLoading(true);

    try {
      const result = await signIn.create({
        identifier: email,
        password,
      });

      if (result.status === "complete") {
        setActive({ session: result.createdSessionId });
        router.push("/upload");
      }
    } catch (err: any) {
      setError(err.errors?.[0]?.message || "Sign in failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleOAuthSignIn = async (strategy: OAuthStrategy) => {
    if (!signInLoaded) return;

    setError("");

    try {
      await signIn.authenticateWithRedirect({
        strategy,
        redirectUrl: "/sso-callback",
        redirectUrlComplete: "/upload",
      });
    } catch (err: any) {
      setError(err.errors?.[0]?.message || "Social sign in failed. Please try again.");
    }
  };

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
            Sign in to upload and analyze your resume
          </p>
        </div>

        <div className="ui-card ui-spotlight p-6 space-y-4">
          <form onSubmit={handleSignIn} className="space-y-4">
            {error && (
              <div className="rounded-lg bg-red-500/10 border border-red-500/20 p-3 text-sm text-red-400">
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="ui-input w-full"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="ui-input w-full"
                required
              />
            </div>

            <button
              type="submit"
              disabled={isLoading || !signInLoaded}
              className="ui-btn-primary w-full px-4 py-3"
            >
              {isLoading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/10" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="bg-[#0a0a0c] px-2 text-[var(--foreground-muted)]">or</span>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
            <button
              type="button"
              onClick={() => handleOAuthSignIn("oauth_google")}
              className="ui-btn-secondary w-full px-3 py-2 text-sm"
            >
              Google
            </button>
            <button
              type="button"
              onClick={() => handleOAuthSignIn("oauth_github")}
              className="ui-btn-secondary w-full px-3 py-2 text-sm"
            >
              GitHub
            </button>
            <button
              type="button"
              onClick={() => handleOAuthSignIn("oauth_discord")}
              className="ui-btn-secondary w-full px-3 py-2 text-sm"
            >
              Discord
            </button>
          </div>

          <div>
            <p className="text-center text-sm text-[var(--foreground-muted)]">
              Don't have an account?{" "}
              <Link href="/sign-up" className="text-[var(--accent)] hover:text-[var(--accent-bright)] font-medium">
                Sign up
              </Link>
            </p>
          </div>
        </div>

        <div className="text-center text-xs text-[var(--foreground-muted)]">
          <p>Karmafit Secure Access</p>
          <p className="mt-1">Your data is encrypted in transit and at rest.</p>
        </div>
      </div>
    </div>
  );
}
