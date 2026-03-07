import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import { dark } from "@clerk/ui/themes";
import { Geist, Geist_Mono } from "next/font/google";
import Navbar from "@/components/Navbar";
import ParticleBackground from "@/components/ParticleBackground";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

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
    <ClerkProvider
      appearance={{
        baseTheme: dark,
        variables: {
          colorPrimary: "#5e6ad2",
          colorBackground: "#0a0a0c",
          colorInputBackground: "#0f0f12",
          colorInputText: "#edecef",
          colorText: "#edecef",
          colorTextSecondary: "#8a8f98",
          colorDanger: "#ef4444",
          borderRadius: "0.5rem",
          fontFamily: "var(--font-geist-sans), Inter, sans-serif",
        },
        elements: {
          footer: "hidden",
        },
      }}
    >
      <html
        lang="en"
        className="dark"
        suppressHydrationWarning
      >
        <body className={`${geistSans.variable} ${geistMono.variable} bg-[var(--background-base)] text-[var(--foreground)] antialiased`}>
          <ParticleBackground />
          <Navbar />
          <main className="relative min-h-screen pt-20">
            <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">{children}</div>
          </main>
        </body>
      </html>
    </ClerkProvider>
  );
}