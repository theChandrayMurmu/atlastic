"use client";

import * as React from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";

export function ThemeToggle() {
  const { setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <Button
        variant="outline"
        size="icon"
        className="h-9 w-9 rounded-full border border-zinc-200 dark:border-zinc-800"
      >
        <span className="sr-only">Toggle theme</span>
      </Button>
    );
  }

  const isDark = resolvedTheme === "dark";

  return (
    <Button
      variant="outline"
      size="icon"
      className="h-9 w-9 rounded-full cursor-pointer border border-zinc-200 bg-white/80 shadow-xs transition-all hover:bg-zinc-100 hover:scale-105 active:scale-95 dark:border-zinc-800 dark:bg-zinc-900/80 dark:hover:bg-zinc-800"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-label="Toggle dark / light mode"
    >
      {isDark ? (
        <Sun className="h-4 w-4 text-amber-400 transition-all duration-300" />
      ) : (
        <Moon className="h-4 w-4 text-zinc-700 transition-all duration-300" />
      )}
      <span className="sr-only">Toggle dark / light mode</span>
    </Button>
  );
}
