"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { SignedIn, SignedOut, UserButton } from "@clerk/nextjs";

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
                appearance={{
                  elements: {
                    avatarBox: "w-9 h-9",
                    userButtonPopoverCard: "bg-[#0a0a0c] border border-white/10",
                    userButtonPopoverActionButton: "text-white hover:bg-white/5",
                    userButtonPopoverActionButtonText: "text-[#edecef]",
                    userButtonPopoverActionButtonIcon: "text-[#8a8f98]",
                    userButtonPopoverFooter: "hidden",
                  },
                }}
              />
            </SignedIn>
            <SignedOut>
              <Link href="/candidate-login" className="ui-btn-secondary px-4 py-2 text-sm">
                Sign in
              </Link>
              <Link href="/sign-up" className="ui-btn-primary px-4 py-2 text-sm">
                Sign up
              </Link>
            </SignedOut>
          </div>
        </div>

      </div>
    </nav>
  );
}