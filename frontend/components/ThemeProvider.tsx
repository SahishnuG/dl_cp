"use client";

import { useEffect, useState } from "react";

export default function ThemeProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [theme, setTheme] = useState<"light" | "dark" | null>(null);

  useEffect(() => {
    // Check system preference
    const prefersDark = window.matchMedia(
      "(prefers-color-scheme: dark)"
    ).matches;
    const stored = localStorage.getItem("theme");
    const initialTheme =
      (stored as "light" | "dark" | null) ||
      (prefersDark ? "dark" : "light");

    setTheme(initialTheme);
    document.documentElement.classList.toggle("dark", initialTheme === "dark");

    // Listen for system theme changes
    const listener = (e: MediaQueryListEvent) => {
      const newTheme = e.matches ? "dark" : "light";
      setTheme(newTheme);
      document.documentElement.classList.toggle("dark", e.matches);
      localStorage.setItem("theme", newTheme);
    };

    window
      .matchMedia("(prefers-color-scheme: dark)")
      .addEventListener("change", listener);

    return () => {
      window
        .matchMedia("(prefers-color-scheme: dark)")
        .removeEventListener("change", listener);
    };
  }, []);

  return <>{children}</>;
}
