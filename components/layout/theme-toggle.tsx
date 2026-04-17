"use client";

import { MoonStar, SunMedium } from "lucide-react";
import { useTheme } from "next-themes";

import { useHydrated } from "@/lib/use-hydrated";

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const mounted = useHydrated();

  if (!mounted) {
    return (
      <button className="button-secondary h-11 w-11 rounded-full" aria-hidden>
        <SunMedium className="h-4 w-4" />
      </button>
    );
  }

  const dark = resolvedTheme !== "light";

  return (
    <button
      className="button-secondary h-11 w-11 rounded-full"
      onClick={() => setTheme(dark ? "light" : "dark")}
      type="button"
      aria-label="Cambiar tema"
    >
      {dark ? <SunMedium className="h-4 w-4" /> : <MoonStar className="h-4 w-4" />}
    </button>
  );
}
