"use client";

import { useSignUp, useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";

type OAuthStrategy = "oauth_google" | "oauth_github" | "oauth_discord";

export default function SignUpPage() {
  const router = useRouter();
  const { isLoaded, userId } = useAuth();
  const { signUp, isLoaded: signUpLoaded, setActive } = useSignUp();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isLoaded && userId) {
      router.push("/upload");
    }
  }, [isLoaded, userId, router]);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!signUpLoaded) return;

    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setIsLoading(true);

    try {
      const result = await signUp.create({
        emailAddress: email,
        password,
      });

      if (result.status === "complete") {
        setActive({ session: result.createdSessionId });
        router.push("/upload");
      } else if (result.status === "missing_requirements") {
        setError("Please complete all required fields");
      }
    } catch (err: any) {
      setError(err.errors?.[0]?.message || "Sign up failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleOAuthSignUp = async (strategy: OAuthStrategy) => {
    if (!signUpLoaded) return;

    setError("");

    try {
      await signUp.authenticateWithRedirect({
        strategy,
        redirectUrl: "/sso-callback",
        redirectUrlComplete: "/upload",
      });
    } catch (err: any) {
      setError(err.errors?.[0]?.message || "Social sign up failed. Please try again.");
    }
  };

  return (
    <div className="relative flex min-h-[calc(100vh-5rem)] items-center justify-center overflow-hidden py-12">
      <div className="ambient-blob left-[-16%] top-[-10%] h-[500px] w-[680px] bg-[radial-gradient(circle,rgba(94,106,210,0.24),transparent_70%)]" />
      <div className="ambient-blob right-[-12%] bottom-[-18%] h-[540px] w-[760px] bg-[radial-gradient(circle,rgba(104,114,217,0.16),transparent_70%)] [animation-delay:1.2s]" />

      <div className="relative z-[3] w-full max-w-md space-y-6">
        <div className="text-center">
          <p className="label-mono mb-3">Candidate Onboarding</p>
          <h1 className="bg-gradient-to-b from-white via-white/95 to-white/70 bg-clip-text text-3xl font-semibold tracking-tight text-transparent">
            Create Your Account
          </h1>
          <p className="mt-2 text-sm text-[var(--foreground-muted)]">
            Set up your profile to upload and analyze resumes.
          </p>
        </div>

        <div className="ui-card p-6 space-y-4">
          <form onSubmit={handleSignUp} className="space-y-4">
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

            <div>
              <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
                Confirm Password
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className="ui-input w-full"
                required
              />
            </div>

            <button
              type="submit"
              disabled={isLoading || !signUpLoaded}
              className="ui-btn-primary w-full px-4 py-3"
            >
              {isLoading ? "Creating account..." : "Create Account"}
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
              onClick={() => handleOAuthSignUp("oauth_google")}
              className="ui-btn-secondary w-full px-3 py-2 text-sm"
            >
              Google
            </button>
            <button
              type="button"
              onClick={() => handleOAuthSignUp("oauth_github")}
              className="ui-btn-secondary w-full px-3 py-2 text-sm"
            >
              GitHub
            </button>
            <button
              type="button"
              onClick={() => handleOAuthSignUp("oauth_discord")}
              className="ui-btn-secondary w-full px-3 py-2 text-sm"
            >
              Discord
            </button>
          </div>

          <div>
            <p className="text-center text-sm text-[var(--foreground-muted)]">
              Already have an account?{" "}
              <Link href="/candidate-login" className="text-[var(--accent)] hover:text-[var(--accent-bright)] font-medium">
                Sign in
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
