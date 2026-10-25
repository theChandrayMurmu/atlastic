"use client";

import * as React from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ThemeToggle } from "@/components/theme-toggle";
import { SearchTriggerButton } from "@/components/search-trigger-button";
import { BottomDock } from "@/components/bottom-dock";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { WORLD_FLAGS, WorldFlag, TOTAL_FLAGS_COUNT } from "@/data/flags";
import {
  Search,
  Flag,
  ArrowLeft,
  X,
  Maximize2,
  Minimize2,
  ChevronLeft,
  ChevronRight,
  Play,
  Pause,
  Shuffle,
  Grid,
} from "lucide-react";

function FlagsContent() {
  const searchParams = useSearchParams();
  const initialFullscreen = searchParams.get("fullscreen") === "true";

  const [searchQuery, setSearchQuery] = React.useState("");
  const [selectedFlagIndex, setSelectedFlagIndex] = React.useState<number | null>(
    initialFullscreen ? 0 : null
  );
  const [isPlaying, setIsPlaying] = React.useState(false);
  const [isBrowserFullscreen, setIsBrowserFullscreen] = React.useState(false);

  // Filtered flags by name search
  const filteredFlags = React.useMemo(() => {
    if (!searchQuery.trim()) return WORLD_FLAGS;
    const q = searchQuery.toLowerCase().trim();
    return WORLD_FLAGS.filter((f) => f.name.toLowerCase().includes(q));
  }, [searchQuery]);

  // Slideshow auto-play effect
  React.useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying && selectedFlagIndex !== null) {
      interval = setInterval(() => {
        setSelectedFlagIndex((prev) => {
          if (prev === null) return 0;
          return (prev + 1) % filteredFlags.length;
        });
      }, 3000);
    }
    return () => clearInterval(interval);
  }, [isPlaying, selectedFlagIndex, filteredFlags.length]);

  // Keyboard navigation for Fullscreen mode
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (selectedFlagIndex === null) return;
      if (e.key === "Escape") {
        setSelectedFlagIndex(null);
        setIsPlaying(false);
      } else if (e.key === "ArrowRight") {
        setSelectedFlagIndex((prev) =>
          prev !== null ? (prev + 1) % filteredFlags.length : 0
        );
      } else if (e.key === "ArrowLeft") {
        setSelectedFlagIndex((prev) =>
          prev !== null
            ? (prev - 1 + filteredFlags.length) % filteredFlags.length
            : 0
        );
      } else if (e.key === " ") {
        e.preventDefault();
        setIsPlaying((p) => !p);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedFlagIndex, filteredFlags.length]);

  const toggleBrowserFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsBrowserFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      }
      setIsBrowserFullscreen(false);
    }
  };

  const currentFlag =
    selectedFlagIndex !== null ? filteredFlags[selectedFlagIndex] : null;

  return (
    <div className="relative flex flex-col min-h-screen bg-white text-zinc-900 dark:bg-black dark:text-zinc-50 transition-colors duration-200">
      {/* Top Header */}
      <header className="sticky top-0 z-40 w-full border-b border-zinc-100 bg-white/90 backdrop-blur-md dark:border-zinc-900 dark:bg-black/90">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="flex size-9 items-center justify-center rounded-xl bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-900 dark:hover:bg-zinc-800 transition-colors text-zinc-700 dark:text-zinc-300 shadow-xs"
              title="Back to Home"
            >
              <ArrowLeft className="size-4" />
            </Link>

            <div className="flex items-center gap-2.5">
              <div className="flex size-9 items-center justify-center rounded-xl bg-rose-500/10 text-rose-600 dark:bg-rose-400/10 dark:text-rose-400 shadow-xs">
                <Flag className="size-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-lg tracking-tight">World Flags</span>
                  <Badge variant="secondary" className="text-[11px] font-medium">
                    {TOTAL_FLAGS_COUNT} Flags
                  </Badge>
                </div>
                <p className="text-[11px] text-zinc-500 dark:text-zinc-400 hidden sm:block">
                  Complete collection of 287 world, regional and territory flags
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const rand = Math.floor(Math.random() * filteredFlags.length);
                setSelectedFlagIndex(rand);
              }}
              className="hidden sm:inline-flex gap-1.5 rounded-xl cursor-pointer text-xs"
            >
              <Shuffle className="size-3.5" />
              Random Flag
            </Button>
            <SearchTriggerButton />
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="mx-auto flex-1 w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8 pb-32">
        {/* Search & Actions Bar */}
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-zinc-400" />
            <Input
              type="text"
              placeholder="Search by country or territory name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-9 h-10 rounded-xl bg-zinc-50 dark:bg-zinc-900/60 border-zinc-200 dark:border-zinc-800"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
              >
                <X className="size-4" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-zinc-500 dark:text-zinc-400">
              Showing <strong>{filteredFlags.length}</strong> of {TOTAL_FLAGS_COUNT} flags
            </span>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setSelectedFlagIndex(0)}
              className="gap-1.5 rounded-xl cursor-pointer text-xs"
            >
              <Maximize2 className="size-3.5" />
              Fullscreen Showcase
            </Button>
          </div>
        </div>

        {/* 287 Flags Grid: ONLY Flag Picture and Name */}
        {filteredFlags.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-6">
            {filteredFlags.map((flag, index) => (
              <div
                key={`${flag.code}-${index}`}
                onClick={() => setSelectedFlagIndex(index)}
                className="group cursor-pointer flex flex-col rounded-2xl border border-zinc-200/80 bg-white overflow-hidden shadow-xs hover:shadow-xl hover:border-zinc-400 dark:border-zinc-800 dark:bg-zinc-950 dark:hover:border-zinc-600 transition-all duration-300 hover:-translate-y-1"
              >
                {/* Full Flag Picture */}
                <div className="relative w-full aspect-[3/2] bg-zinc-100 dark:bg-zinc-900 overflow-hidden">
                  <img
                    src={flag.flagUrl}
                    alt={`${flag.name} flag`}
                    loading="lazy"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    onError={(e) => {
                      const target = e.currentTarget;
                      if (!target.dataset.fallbackTried) {
                        target.dataset.fallbackTried = "true";
                        // try lower-res flagcdn or fallback
                        if (flag.flagUrl.startsWith("https://flagcdn.com/w1280/")) {
                          target.src = flag.flagUrl.replace("/w1280/", "/w320/");
                        } else {
                          target.src = "/globe.svg";
                        }
                      }
                    }}
                  />
                  {/* Subtle hover overlay hint */}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                    <div className="size-9 rounded-full bg-black/60 text-white flex items-center justify-center backdrop-blur-xs shadow-md">
                      <Maximize2 className="size-4" />
                    </div>
                  </div>
                </div>

                {/* Country Name */}
                <div className="p-3 text-center">
                  <h3 className="font-semibold text-xs sm:text-sm text-zinc-900 dark:text-zinc-100 truncate group-hover:text-primary transition-colors">
                    {flag.name}
                  </h3>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <Flag className="size-12 text-zinc-300 dark:text-zinc-700 mb-3" />
            <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
              No flags found
            </h3>
            <p className="mt-1 text-sm text-zinc-500 max-w-sm">
              We couldn&apos;t find any flag matching &ldquo;{searchQuery}&rdquo;.
            </p>
            <Button
              onClick={() => setSearchQuery("")}
              variant="outline"
              className="mt-4 rounded-xl cursor-pointer"
            >
              Reset Search
            </Button>
          </div>
        )}
      </main>

      {/* FULLSCREEN IMMERSIVE FLAG VIEWER MODAL */}
      {currentFlag && selectedFlagIndex !== null && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex flex-col justify-between bg-black/95 backdrop-blur-xl text-white select-none animate-in fade-in-0 duration-200"
        >
          {/* Fullscreen Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 z-10">
            <div className="flex items-center gap-3">
              <span className="text-xs uppercase tracking-widest text-zinc-400 font-mono">
                {selectedFlagIndex + 1} / {filteredFlags.length}
              </span>
            </div>

            {/* Name of the Flag prominently in center */}
            <div className="text-center px-4">
              <h2 className="text-lg sm:text-2xl font-bold tracking-tight text-white drop-shadow-md">
                {currentFlag.name}
              </h2>
            </div>

            {/* Controls */}
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsPlaying((p) => !p)}
                title={isPlaying ? "Pause Slideshow" : "Play Slideshow"}
                className="size-9 rounded-full text-white hover:bg-white/10 cursor-pointer"
              >
                {isPlaying ? <Pause className="size-4" /> : <Play className="size-4" />}
              </Button>

              <Button
                variant="ghost"
                size="icon"
                onClick={toggleBrowserFullscreen}
                title="Toggle Monitor Fullscreen"
                className="size-9 rounded-full text-white hover:bg-white/10 cursor-pointer"
              >
                {isBrowserFullscreen ? (
                  <Minimize2 className="size-4" />
                ) : (
                  <Maximize2 className="size-4" />
                )}
              </Button>

              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  setSelectedFlagIndex(null);
                  setIsPlaying(false);
                }}
                title="Close Fullscreen (Esc)"
                className="size-9 rounded-full text-white hover:bg-white/10 cursor-pointer"
              >
                <X className="size-5" />
              </Button>
            </div>
          </div>

          {/* Fullscreen Flag Picture (Main Centerpiece) */}
          <div className="relative flex-1 flex items-center justify-center p-4 sm:p-12 overflow-hidden">
            {/* Previous Flag Button */}
            <button
              onClick={() =>
                setSelectedFlagIndex((prev) =>
                  prev !== null
                    ? (prev - 1 + filteredFlags.length) % filteredFlags.length
                    : 0
                )
              }
              aria-label="Previous flag"
              className="absolute left-4 sm:left-8 z-20 flex size-12 items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white backdrop-blur-md transition-transform hover:scale-110 active:scale-95 cursor-pointer"
            >
              <ChevronLeft className="size-6" />
            </button>

            {/* Flag Image: Large, appealing, high-definition */}
            <div className="relative max-w-5xl max-h-[75vh] w-full flex items-center justify-center">
              <img
                key={currentFlag.code}
                src={currentFlag.flagUrl}
                alt={`${currentFlag.name} flag`}
                className="max-w-full max-h-[75vh] object-contain rounded-xl shadow-2xl ring-1 ring-white/10 animate-in zoom-in-95 duration-200"
                onError={(e) => {
                  const target = e.currentTarget;
                  if (!target.dataset.fallbackTried) {
                    target.dataset.fallbackTried = "true";
                    if (currentFlag.flagUrl.startsWith("https://flagcdn.com/w1280/")) {
                      target.src = currentFlag.flagUrl.replace("/w1280/", "/w640/");
                    } else {
                      target.src = "/globe.svg";
                    }
                  }
                }}
              />
            </div>

            {/* Next Flag Button */}
            <button
              onClick={() =>
                setSelectedFlagIndex((prev) =>
                  prev !== null ? (prev + 1) % filteredFlags.length : 0
                )
              }
              aria-label="Next flag"
              className="absolute right-4 sm:right-8 z-20 flex size-12 items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white backdrop-blur-md transition-transform hover:scale-110 active:scale-95 cursor-pointer"
            >
              <ChevronRight className="size-6" />
            </button>
          </div>

          {/* Fullscreen Bottom Footer */}
          <div className="flex items-center justify-between px-6 py-4 border-t border-white/10 z-10 text-xs text-zinc-400">
            <span className="hidden sm:inline">
              Use <kbd className="px-1.5 py-0.5 rounded bg-white/10 font-mono">←</kbd> and{" "}
              <kbd className="px-1.5 py-0.5 rounded bg-white/10 font-mono">→</kbd> arrow keys to navigate • Press <kbd className="px-1.5 py-0.5 rounded bg-white/10 font-mono">Space</kbd> to play/pause
            </span>
            <span className="sm:hidden text-center w-full">
              Swipe or tap arrows to navigate
            </span>
            <button
              onClick={() => setSelectedFlagIndex(null)}
              className="hidden sm:inline text-zinc-300 hover:text-white cursor-pointer underline"
            >
              Exit to Gallery
            </button>
          </div>
        </div>
      )}

      {/* Floating Bottom Menubar */}
      <BottomDock />
    </div>
  );
}

export default function FlagsPage() {
  return (
    <React.Suspense fallback={<div className="min-h-screen bg-white dark:bg-black" />}>
      <FlagsContent />
    </React.Suspense>
  );
}
