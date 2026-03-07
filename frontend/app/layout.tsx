import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import Navbar from "@/components/Navbar";
import ThemeProvider from "@/components/ThemeProvider";
import ParticleBackground from "@/components/ParticleBackground";

export const metadata = {
  title: "Karmafit - Resume Analysis Platform",
  description: "Advanced candidate evaluation and resume analysis system",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning>
        <body className="bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-50">
          <ThemeProvider>
            <ParticleBackground />
            <Navbar />
            <main className="min-h-screen relative pt-20">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {children}
              </div>
            </main>
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}