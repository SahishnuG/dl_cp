import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <div className="min-h-[calc(100vh-5rem)] flex items-center justify-center">
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-xl flex justify-center">
        <SignUp
          routing="hash"
          signInUrl="/candidate-login"
          forceRedirectUrl="/upload"
          fallbackRedirectUrl="/upload"
        />
      </div>
    </div>
  );
}
