"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";

export default function Navbar() {
  const pathname = usePathname();
  const [isDark, setIsDark] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setIsDark(document.documentElement.classList.contains("dark"));
  }, []);

  const toggleTheme = () => {
    const html = document.documentElement;
    const newTheme = html.classList.contains("dark") ? "light" : "dark";
    html.classList.toggle("dark", newTheme === "dark");
    localStorage.setItem("theme", newTheme);
    setIsDark(newTheme === "dark");
  };

  const isActive = (path: string) => pathname === path;

  return (
    <nav className="fixed top-0 w-full bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 backdrop-blur-md bg-opacity-90 dark:bg-opacity-90 shadow-sm z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-500 to-pink-500 flex items-center justify-center">
              <span className="text-white font-bold text-lg">K</span>
            </div>
            <span className="font-bold text-xl bg-gradient-to-r from-indigo-600 to-pink-600 dark:from-indigo-400 dark:to-pink-400 bg-clip-text text-transparent">
              Karmafit
            </span>
          </Link>

          {/* Navigation Links */}
          <div className="flex gap-2">
            <Link
              href="/dashboard"
              className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
                isActive("/dashboard")
                  ? "bg-gradient-to-r from-indigo-500 to-pink-500 text-white shadow-lg shadow-indigo-500/50"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
              }`}
            >
              Dashboard
            </Link>
            <Link
              href="/candidates"
              className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
                isActive("/candidates")
                  ? "bg-gradient-to-r from-indigo-500 to-pink-500 text-white shadow-lg shadow-indigo-500/50"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
              }`}
            >
              Candidate Search
            </Link>
            <Link
              href="/analysis"
              className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
                isActive("/analysis")
                  ? "bg-gradient-to-r from-indigo-500 to-pink-500 text-white shadow-lg shadow-indigo-500/50"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
              }`}
            >
              My Analysis
            </Link>
          </div>

          {/* Theme Toggle */}
          {mounted && (
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
              aria-label="Toggle theme"
            >
              {isDark ? (
                <svg
                  className="w-5 h-5 text-yellow-400"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                </svg>
              ) : (
                <svg
                  className="w-5 h-5 text-orange-400"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 2a1 1 0 011 1v2a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.536l1.414 1.414a1 1 0 001.414-1.414l-1.414-1.414a1 1 0 00-1.414 1.414zM2.05 6.464L3.464 5.05a1 1 0 011.414 1.414L3.464 7.878a1 1 0 01-1.414-1.414zM17.95 13.536l-1.414 1.414a1 1 0 11-1.414-1.414l1.414-1.414a1 1 0 111.414 1.414zM2 10a1 1 0 011 1v2a1 1 0 11-2 0v-2a1 1 0 011-1zm14 0a1 1 0 011 1v2a1 1 0 11-2 0v-2a1 1 0 011-1zM6.464 2.05L7.878 3.464a1 1 0 01-1.414 1.414L5.05 3.464a1 1 0 011.414-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              )}
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}