import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
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
          <p className="mt-2 text-sm text-[var(--foreground-muted)]">Set up your profile to upload and analyze resumes.</p>
        </div>

        <div className="ui-card p-6">
          <SignUp
            routing="hash"
            signInUrl="/candidate-login"
            forceRedirectUrl="/upload"
            fallbackRedirectUrl="/upload"
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
