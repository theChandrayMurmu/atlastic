"use client";

import * as React from "react";
import { Search } from "lucide-react";

interface SearchTriggerButtonProps {
  className?: string;
  variant?: "compact" | "full";
}

export function SearchTriggerButton({
  className = "",
  variant = "full",
}: SearchTriggerButtonProps) {
  const [isMac, setIsMac] = React.useState(false);

  React.useEffect(() => {
    const isApple = /(Mac|iPhone|iPod|iPad)/i.test(
      navigator.platform || navigator.userAgent || ""
    );
    setIsMac(isApple);
  }, []);

  const handleClick = () => {
    window.dispatchEvent(new CustomEvent("open-global-search"));
  };

  if (variant === "compact") {
    return (
      <button
        onClick={handleClick}
        className={`flex size-9 items-center justify-center rounded-xl bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-900 dark:hover:bg-zinc-800 transition-colors text-zinc-700 dark:text-zinc-300 shadow-xs cursor-pointer ${className}`}
        title={`Search across all pages (${isMac ? "⌘K" : "Ctrl+K"})`}
      >
        <Search className="size-4" />
      </button>
    );
  }

  return (
    <button
      onClick={handleClick}
      className={`flex items-center gap-2 px-3 py-1.5 rounded-xl bg-zinc-100/90 hover:bg-zinc-200/90 dark:bg-zinc-900/90 dark:hover:bg-zinc-800/90 text-xs text-zinc-500 dark:text-zinc-400 border border-zinc-200/60 dark:border-zinc-800/60 transition-all cursor-pointer shadow-xs ${className}`}
      title={`Search across all pages (${isMac ? "⌘K" : "Ctrl+K"})`}
    >
      <Search className="size-3.5 text-zinc-400" />
      <span className="hidden sm:inline">Search...</span>
      <kbd className="hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-mono font-medium rounded bg-white dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 border border-zinc-200/80 dark:border-zinc-700/80 shadow-2xs">
        {isMac ? "⌘K" : "Ctrl+K"}
      </kbd>
    </button>
  );
}
