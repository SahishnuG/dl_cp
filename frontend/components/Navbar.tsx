"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { SignInButton, SignUpButton, SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import { dark } from '@clerk/ui/themes'

export default function Navbar() {
  const pathname = usePathname();

  const isActive = (path: string) => pathname === path;

  const links = [
    { href: "/dashboard", label: "Dashboard" },
    { href: "/candidates", label: "Candidate Search" },
    { href: "/analysis", label: "My Analysis" },
  ];

  return (
    <nav className="ui-nav-shell fixed top-0 z-50 w-full">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="group flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-gradient-to-b from-[#6872d9] to-[#5e6ad2] shadow-[0_0_0_1px_rgba(94,106,210,0.5),0_6px_18px_rgba(94,106,210,0.35)]">
              <span className="text-lg font-semibold text-white">K</span>
            </div>
            <span className="bg-gradient-to-b from-white via-white/95 to-white/70 bg-clip-text text-xl font-semibold tracking-tight text-transparent">
              Karmafit
            </span>
          </Link>

          <div className="hidden items-center gap-3 md:flex">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`ui-nav-link rounded-lg px-4 py-2 text-sm font-medium ${
                  isActive(link.href) ? "ui-nav-link-active" : ""
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <SignedIn>
              <UserButton
                userProfileProps={{
                  appearance: {
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
                      footerAction: "hidden",
                      footerPages: "hidden",
                      card: "bg-[#0a0a0c] border border-white/10",
                      cardBox: "bg-[#0a0a0c]",
                      rootBox: "bg-[#0a0a0c]",
                    },
                  },
                }}
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
                    footerAction: "hidden",
                    footerPages: "hidden",

                    card: "bg-[#0a0a0c]",
                    cardBox: "bg-[#0a0a0c]",
                    rootBox: "bg-[#0a0a0c]",
                  },
                }}
              />
            </SignedIn>
            <SignedOut>
              <SignInButton mode="modal">
                <button className="ui-btn-secondary px-4 py-2 text-sm">Sign in</button>
              </SignInButton>
              <SignUpButton mode="modal">
                <button className="ui-btn-primary px-4 py-2 text-sm">Sign up</button>
              </SignUpButton>
            </SignedOut>
          </div>
        </div>

      </div>
    </nav>
  );
}