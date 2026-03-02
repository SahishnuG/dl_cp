"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const pathname = usePathname();

  const linkClass = (path: string) =>
    `px-4 py-2 rounded-lg ${
      pathname === path ? "bg-blue-600 text-white" : "bg-gray-200"
    }`;

  return (
    <nav className="flex gap-4 p-4 shadow-md">
      <Link href="/dashboard" className={linkClass("/dashboard")}>
        Dashboard
      </Link>
      <Link href="/candidates" className={linkClass("/candidates")}>
        Candidate Search
      </Link>
    </nav>
  );
}