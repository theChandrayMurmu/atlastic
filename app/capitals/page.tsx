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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { WORLD_CAPITALS, WorldCapital, TOTAL_CAPITALS_COUNT } from "@/data/capitals";
import {
  Search,
  Building2,
  Clock,
  Sun,
  Moon,
  ArrowLeft,
  X,
  Shuffle,
  ArrowUpDown,
  Users,
  Mountain,
  MapPin,
  Sparkles,
  ExternalLink,
  Calendar,
  Play,
  Pause,
  ChevronLeft,
  ChevronRight,
  Sliders,
  RotateCcw,
} from "lucide-react";

type SortOption =
  | "capital-asc"
  | "country-asc"
  | "time-asc"
  | "time-desc"
  | "population-desc"
  | "elevation-desc";

// Formatter caches to keep rendering at 60 FPS
const timeFormatters = new Map<string, Intl.DateTimeFormat>();
function formatLocalTime(date: Date, tz: string, hour12: boolean): string {
  const key = `${tz}_${hour12}`;
  if (!timeFormatters.has(key)) {
    timeFormatters.set(
      key,
      new Intl.DateTimeFormat("en-US", {
        timeZone: tz,
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12,
      })
    );
  }
  try {
    return timeFormatters.get(key)!.format(date);
  } catch {
    return "--:--:--";
  }
}

const dateFormatters = new Map<string, Intl.DateTimeFormat>();
function formatLocalDate(date: Date, tz: string): string {
  if (!dateFormatters.has(tz)) {
    dateFormatters.set(
      tz,
      new Intl.DateTimeFormat("en-US", {
        timeZone: tz,
        weekday: "short",
        month: "short",
        day: "numeric",
      })
    );
  }
  try {
    return dateFormatters.get(tz)!.format(date);
  } catch {
    return "";
  }
}

const hourFormatters = new Map<string, Intl.DateTimeFormat>();
function getLocalHour(date: Date, tz: string): number {
  if (!hourFormatters.has(tz)) {
    hourFormatters.set(
      tz,
      new Intl.DateTimeFormat("en-US", {
        timeZone: tz,
        hour: "numeric",
        hour12: false,
      })
    );
  }
  try {
    return parseInt(hourFormatters.get(tz)!.format(date), 10);
  } catch {
    return 12;
  }
}

const offsetFormatters = new Map<string, Intl.DateTimeFormat>();
function getUtcOffset(date: Date, tz: string): string {
  if (!offsetFormatters.has(tz)) {
    offsetFormatters.set(
      tz,
      new Intl.DateTimeFormat("en-US", {
        timeZone: tz,
        timeZoneName: "shortOffset",
      })
    );
  }
  try {
    const parts = offsetFormatters.get(tz)!.formatToParts(date);
    const tzPart = parts.find((p) => p.type === "timeZoneName");
    return tzPart ? tzPart.value.replace("GMT", "UTC") : "UTC";
  } catch {
    return "UTC";
  }
}

function getRelativeDifference(date: Date, tz: string): string {
  try {
    const targetHourStr = new Intl.DateTimeFormat("en-US", {
      timeZone: tz,
      hour: "numeric",
      minute: "numeric",
      hour12: false,
    }).format(date);
    const localHourStr = new Intl.DateTimeFormat("en-US", {
      hour: "numeric",
      minute: "numeric",
      hour12: false,
    }).format(date);

    const [th, tm] = targetHourStr.split(":").map(Number);
    const [lh, lm] = localHourStr.split(":").map(Number);

    let diffMinutes = th * 60 + tm - (lh * 60 + lm);
    if (diffMinutes > 720) diffMinutes -= 1440;
    if (diffMinutes < -720) diffMinutes += 1440;

    const diffHours = diffMinutes / 60;
    if (diffHours === 0) return "Same time";
    const sign = diffHours > 0 ? "+" : "";
    return `${sign}${diffHours % 1 === 0 ? diffHours : diffHours.toFixed(1)}h`;
  } catch {
    return "";
  }
}

function formatPopulation(pop: number): string {
  if (pop >= 1_000_000) {
    return `${(pop / 1_000_000).toFixed(1)}M`;
  }
  if (pop >= 1_000) {
    return `${(pop / 1_000).toFixed(0)}K`;
  }
  return pop.toLocaleString();
}

function getOffsetMinutes(date: Date, tz: string): number {
  try {
    const parts = new Intl.DateTimeFormat("en-US", {
      timeZone: tz,
      timeZoneName: "shortOffset",
    }).formatToParts(date);
    const tzPart = parts.find((p) => p.type === "timeZoneName")?.value || "";
    const match = tzPart.match(/[A-Z]+([+-])(\d+)(?::(\d+))?/);
    if (!match) return 0;
    const sign = match[1] === "-" ? -1 : 1;
    const hours = parseInt(match[2], 10);
    const minutes = match[3] ? parseInt(match[3], 10) : 0;
    return sign * (hours * 60 + minutes);
  } catch {
    return 0;
  }
}

function formatMinutesToUtc(minutes: number): string {
  const sign = minutes >= 0 ? "+" : "-";
  const abs = Math.abs(minutes);
  const h = Math.floor(abs / 60);
  const m = abs % 60;
  return `UTC${sign}${h}${m > 0 ? `:${m.toString().padStart(2, "0")}` : ""}`;
}

export interface TimezoneSpanOption {
  index: number;
  offsetMinutes: number;
  label: string;
  count: number;
  sampleCapitals: string[];
  capitals: WorldCapital[];
}

function CapitalsContent() {
  const searchParams = useSearchParams();
  const initialRegion = searchParams.get("region") || "All";

  // Global ticking clock state (1 interval for all 196 capitals)
  const [now, setNow] = React.useState<Date>(() => new Date());
  const [is24Hour, setIs24Hour] = React.useState(false);

  // Filters & State
  const [searchQuery, setSearchQuery] = React.useState("");
  const [selectedRegion, setSelectedRegion] = React.useState(initialRegion);
  const [timeOfDayFilter, setTimeOfDayFilter] = React.useState<"all" | "day" | "night">("all");
  const [selectedTimezoneIndex, setSelectedTimezoneIndex] = React.useState<number | null>(null);
  const [isPlayingTour, setIsPlayingTour] = React.useState(false);
  const [sortBy, setSortBy] = React.useState<SortOption>("capital-asc");
  const [selectedCapital, setSelectedCapital] = React.useState<WorldCapital | null>(null);

  // Update clock every second
  React.useEffect(() => {
    const timer = setInterval(() => {
      setNow(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Sorted unique timezone spans across all capitals (earliest to latest)
  const timezoneSpanOptions = React.useMemo<TimezoneSpanOption[]>(() => {
    const map = new Map<number, { minutes: number; capitals: WorldCapital[] }>();
    for (const c of WORLD_CAPITALS) {
      const min = getOffsetMinutes(now, c.timezone);
      if (!map.has(min)) {
        map.set(min, { minutes: min, capitals: [] });
      }
      map.get(min)!.capitals.push(c);
    }

    const sorted = Array.from(map.values()).sort((a, b) => a.minutes - b.minutes);

    return sorted.map((item, idx) => ({
      index: idx,
      offsetMinutes: item.minutes,
      label: formatMinutesToUtc(item.minutes),
      count: item.capitals.length,
      sampleCapitals: item.capitals.map((c) => c.capital),
      capitals: item.capitals,
    }));
  }, [now]);

  // Auto-play through timezones from earliest to latest
  React.useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlayingTour && timezoneSpanOptions.length > 0) {
      interval = setInterval(() => {
        setSelectedTimezoneIndex((prev) => {
          if (prev === null) return 0;
          return (prev + 1) % timezoneSpanOptions.length;
        });
      }, 2200);
    }
    return () => clearInterval(interval);
  }, [isPlayingTour, timezoneSpanOptions.length]);

  // Filtered & Sorted capitals list
  const filteredCapitals = React.useMemo(() => {
    let list = WORLD_CAPITALS;

    // Search filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (c) =>
          c.capital.toLowerCase().includes(q) ||
          c.country.toLowerCase().includes(q) ||
          c.timezone.toLowerCase().includes(q) ||
          c.countryCode.toLowerCase().includes(q)
      );
    }

    // Region filter
    if (selectedRegion !== "All") {
      list = list.filter((c) => c.region === selectedRegion);
    }

    // Time of day filter
    if (timeOfDayFilter !== "all") {
      list = list.filter((c) => {
        const hour = getLocalHour(now, c.timezone);
        const isDaytime = hour >= 6 && hour < 18;
        return timeOfDayFilter === "day" ? isDaytime : !isDaytime;
      });
    }

    // Timezone filter from slider (earliest to latest zone)
    if (selectedTimezoneIndex !== null && timezoneSpanOptions[selectedTimezoneIndex]) {
      const targetMinutes = timezoneSpanOptions[selectedTimezoneIndex].offsetMinutes;
      list = list.filter((c) => getOffsetMinutes(now, c.timezone) === targetMinutes);
    }

    // Sorting
    return [...list].sort((a, b) => {
      switch (sortBy) {
        case "capital-asc":
          return a.capital.localeCompare(b.capital);
        case "country-asc":
          return a.country.localeCompare(b.country);
        case "time-asc": {
          const hourA = getLocalHour(now, a.timezone);
          const hourB = getLocalHour(now, b.timezone);
          return hourA - hourB;
        }
        case "time-desc": {
          const hourA = getLocalHour(now, a.timezone);
          const hourB = getLocalHour(now, b.timezone);
          return hourB - hourA;
        }
        case "population-desc":
          return b.population - a.population;
        case "elevation-desc":
          return b.elevation - a.elevation;
        default:
          return 0;
      }
    });
  }, [searchQuery, selectedRegion, timeOfDayFilter, sortBy, now]);

  // Real-time statistics across all capitals
  const stats = React.useMemo(() => {
    let dayCount = 0;
    let nightCount = 0;
    for (const c of WORLD_CAPITALS) {
      const h = getLocalHour(now, c.timezone);
      if (h >= 6 && h < 18) {
        dayCount++;
      } else {
        nightCount++;
      }
    }
    return { dayCount, nightCount };
  }, [now]);

  // Formatted viewer local & UTC clocks for header
  const userLocalTimeStr = React.useMemo(() => {
    return new Intl.DateTimeFormat("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: !is24Hour,
    }).format(now);
  }, [now, is24Hour]);

  const userUtcTimeStr = React.useMemo(() => {
    return new Intl.DateTimeFormat("en-US", {
      timeZone: "UTC",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    }).format(now);
  }, [now]);

  // Active timezone selected via slider
  const activeTimezoneOption =
    selectedTimezoneIndex !== null && timezoneSpanOptions[selectedTimezoneIndex]
      ? timezoneSpanOptions[selectedTimezoneIndex]
      : null;

  const activeZoneTime =
    activeTimezoneOption && activeTimezoneOption.capitals[0]
      ? formatLocalTime(now, activeTimezoneOption.capitals[0].timezone, is24Hour)
      : "";
  const activeZoneHour =
    activeTimezoneOption && activeTimezoneOption.capitals[0]
      ? getLocalHour(now, activeTimezoneOption.capitals[0].timezone)
      : 12;
  const isActiveZoneDaytime = activeZoneHour >= 6 && activeZoneHour < 18;

  return (
    <div className="relative flex flex-col min-h-screen bg-white text-zinc-900 dark:bg-black dark:text-zinc-50 transition-colors duration-200">
      {/* Top Header */}
      <header className="sticky top-0 z-40 w-full border-b border-zinc-100 bg-white/90 backdrop-blur-md dark:border-zinc-900 dark:bg-black/90">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="flex size-9 items-center justify-center rounded-xl bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-900 dark:hover:bg-zinc-800 transition-colors text-zinc-700 dark:text-zinc-300 shadow-xs"
              title="Back to Atlas"
            >
              <ArrowLeft className="size-4" />
            </Link>

            <div className="flex items-center gap-2.5">
              <div className="flex size-9 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 dark:bg-amber-400/10 dark:text-amber-400 shadow-xs">
                <Building2 className="size-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-lg tracking-tight">World Capitals</span>
                  <Badge variant="secondary" className="text-[11px] font-medium">
                    {TOTAL_CAPITALS_COUNT} Capitals
                  </Badge>
                </div>
                <p className="text-[11px] text-zinc-500 dark:text-zinc-400 hidden sm:block">
                  Live World Clocks, Timezones & Capital City Directory
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            {/* Live Clock Pill in Header */}
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-zinc-100/80 dark:bg-zinc-900/80 border border-zinc-200/60 dark:border-zinc-800/60 text-xs font-mono">
              <Clock className="size-3.5 text-primary animate-pulse" />
              <span className="text-zinc-500 dark:text-zinc-400 text-[11px]">Local:</span>
              <span className="font-semibold text-zinc-900 dark:text-zinc-100">
                {userLocalTimeStr}
              </span>
              <span className="text-zinc-300 dark:text-zinc-700">|</span>
              <span className="text-zinc-500 dark:text-zinc-400 text-[11px]">UTC:</span>
              <span className="text-zinc-700 dark:text-zinc-300">
                {userUtcTimeStr}
              </span>
            </div>

            {/* 12h / 24h Toggle */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIs24Hour((p) => !p)}
              className="rounded-xl text-xs cursor-pointer h-9 px-2.5"
              title="Toggle 12-hour or 24-hour clock format"
            >
              <Clock className="size-3.5 mr-1" />
              {is24Hour ? "24h" : "12h"}
            </Button>

            {/* Random Capital */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const rand =
                  filteredCapitals[Math.floor(Math.random() * filteredCapitals.length)];
                if (rand) setSelectedCapital(rand);
              }}
              className="hidden sm:inline-flex gap-1.5 rounded-xl cursor-pointer text-xs h-9"
            >
              <Shuffle className="size-3.5" />
              Random
            </Button>

            <SearchTriggerButton />
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto flex-1 w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8 pb-32">
        {/* Real-time World Stats Strip */}
        <div className="mb-6 grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3.5 rounded-2xl bg-zinc-50 border border-zinc-200/80 dark:bg-zinc-950 dark:border-zinc-800 flex items-center justify-between">
            <div>
              <p className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                Total Capitals
              </p>
              <p className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
                {TOTAL_CAPITALS_COUNT} Cities
              </p>
            </div>
            <div className="size-8 rounded-xl bg-zinc-200/60 dark:bg-zinc-900 flex items-center justify-center text-zinc-600 dark:text-zinc-400">
              <Building2 className="size-4" />
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-amber-500/5 border border-amber-500/20 dark:bg-amber-500/10 dark:border-amber-500/20 flex items-center justify-between">
            <div>
              <p className="text-[11px] font-medium text-amber-600 dark:text-amber-400 uppercase tracking-wider">
                ☀️ Daytime Now
              </p>
              <p className="text-lg font-bold text-amber-700 dark:text-amber-300">
                {stats.dayCount} Capitals
              </p>
            </div>
            <div className="size-8 rounded-xl bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <Sun className="size-4" />
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-indigo-500/5 border border-indigo-500/20 dark:bg-indigo-500/10 dark:border-indigo-500/20 flex items-center justify-between">
            <div>
              <p className="text-[11px] font-medium text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
                🌙 Nighttime Now
              </p>
              <p className="text-lg font-bold text-indigo-700 dark:text-indigo-300">
                {stats.nightCount} Capitals
              </p>
            </div>
            <div className="size-8 rounded-xl bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <Moon className="size-4" />
            </div>
          </div>

          {/* 4. Timezone Span Card */}
          <div
            onClick={() => {
              if (selectedTimezoneIndex === null) {
                setSelectedTimezoneIndex(0);
              } else {
                setSelectedTimezoneIndex(null);
                setIsPlayingTour(false);
              }
            }}
            className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
              activeTimezoneOption
                ? "bg-primary/5 border-primary/40 dark:bg-primary/10 dark:border-primary/40 shadow-xs"
                : "bg-zinc-50 border-zinc-200/80 hover:border-zinc-300 dark:bg-zinc-950 dark:border-zinc-800 dark:hover:border-zinc-700"
            }`}
            title="Click to toggle timezone filter"
          >
            <div>
              <p
                className={`text-[11px] font-medium uppercase tracking-wider ${
                  activeTimezoneOption
                    ? "text-primary font-semibold"
                    : "text-zinc-500 dark:text-zinc-400"
                }`}
              >
                {activeTimezoneOption ? `Zone: ${activeTimezoneOption.label}` : "Timezone Span"}
              </p>
              <p className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
                {activeTimezoneOption
                  ? `${activeTimezoneOption.count} ${activeTimezoneOption.count === 1 ? "Capital" : "Capitals"}`
                  : `${timezoneSpanOptions[0]?.label || "UTC-6"} to ${timezoneSpanOptions[timezoneSpanOptions.length - 1]?.label || "UTC+13"}`}
              </p>
              <p className="text-[10px] text-zinc-400 mt-0.5">
                {activeTimezoneOption ? `${activeZoneTime} • Click for all` : "24 Zones • Drag slider below"}
              </p>
            </div>
            <div
              className={`size-8 rounded-xl flex items-center justify-center ${
                activeTimezoneOption
                  ? "bg-primary/20 text-primary"
                  : "bg-zinc-200/60 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400"
              }`}
            >
              <Sliders className="size-4" />
            </div>
          </div>
        </div>

        {/* INTERACTIVE TIMEZONE SPAN SLIDER PANEL */}
        <div className="mb-6 rounded-2xl border border-zinc-200/90 bg-zinc-50/70 p-4 dark:border-zinc-800 dark:bg-zinc-950/70 backdrop-blur-sm shadow-xs">
          {/* Header Row */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
            <div className="flex items-center gap-2.5">
              <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary shrink-0">
                <Clock className="size-4" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-sm text-zinc-900 dark:text-zinc-100">
                    Timezone Span Slider
                  </h3>
                  {activeTimezoneOption ? (
                    <Badge variant="default" className="text-[11px] px-2 py-0 font-mono">
                      {activeTimezoneOption.label} ({activeTimezoneOption.count} {activeTimezoneOption.count === 1 ? "city" : "cities"})
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="text-[11px] px-2 py-0">
                      All 24 Zones
                    </Badge>
                  )}
                </div>
                <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                  {activeTimezoneOption
                    ? `Showing ${activeTimezoneOption.count} capitals in ${activeTimezoneOption.label} • Live Time: ${activeZoneTime}`
                    : `Drag slider to filter capitals from earliest (${timezoneSpanOptions[0]?.label}) to latest (${timezoneSpanOptions[timezoneSpanOptions.length - 1]?.label})`}
                </p>
              </div>
            </div>

            {/* Controls: Prev, Play/Tour, Next, All */}
            <div className="flex items-center gap-1.5 self-end sm:self-auto">
              <Button
                variant={isPlayingTour ? "default" : "outline"}
                size="sm"
                onClick={() => setIsPlayingTour((p) => !p)}
                className="h-8 px-2.5 text-xs rounded-xl cursor-pointer gap-1"
                title={isPlayingTour ? "Pause Auto World Tour" : "Play Auto World Tour"}
              >
                {isPlayingTour ? <Pause className="size-3.5" /> : <Play className="size-3.5" />}
                <span className="hidden sm:inline">{isPlayingTour ? "Pause Tour" : "Auto Tour"}</span>
              </Button>

              <Button
                variant="outline"
                size="sm"
                disabled={selectedTimezoneIndex === 0}
                onClick={() => {
                  setIsPlayingTour(false);
                  setSelectedTimezoneIndex((prev) => (prev === null ? 0 : Math.max(0, prev - 1)));
                }}
                className="size-8 p-0 rounded-xl cursor-pointer"
                title="Step to previous earlier timezone"
              >
                <ChevronLeft className="size-4" />
              </Button>

              <Button
                variant="outline"
                size="sm"
                disabled={selectedTimezoneIndex === timezoneSpanOptions.length - 1}
                onClick={() => {
                  setIsPlayingTour(false);
                  setSelectedTimezoneIndex((prev) =>
                    prev === null ? 0 : Math.min(timezoneSpanOptions.length - 1, prev + 1)
                  );
                }}
                className="size-8 p-0 rounded-xl cursor-pointer"
                title="Step to next later timezone"
              >
                <ChevronRight className="size-4" />
              </Button>

              {activeTimezoneOption && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setIsPlayingTour(false);
                    setSelectedTimezoneIndex(null);
                  }}
                  className="h-8 px-2.5 text-xs rounded-xl text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 cursor-pointer gap-1"
                  title="Show all timezones"
                >
                  <RotateCcw className="size-3" />
                  <span>All Zones</span>
                </Button>
              )}
            </div>
          </div>

          {/* Range Slider Track */}
          <div className="relative pt-2 pb-1 px-1">
            <input
              type="range"
              min={0}
              max={timezoneSpanOptions.length - 1}
              value={selectedTimezoneIndex ?? 0}
              onChange={(e) => {
                setIsPlayingTour(false);
                setSelectedTimezoneIndex(parseInt(e.target.value, 10));
              }}
              className="w-full h-2.5 bg-zinc-200 dark:bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-primary focus:outline-none transition-all"
            />

            {/* Slider Endpoint Labels & Anchor Marks */}
            <div className="flex items-center justify-between text-[10px] font-mono text-zinc-400 dark:text-zinc-500 mt-1.5 px-0.5">
              <span
                onClick={() => {
                  setIsPlayingTour(false);
                  setSelectedTimezoneIndex(0);
                }}
                className={`cursor-pointer hover:text-primary transition-colors flex items-center gap-0.5 ${
                  selectedTimezoneIndex === 0 ? "text-primary font-bold" : ""
                }`}
                title="Jump to earliest timezone"
              >
                ◀ Earliest: {timezoneSpanOptions[0]?.label || "UTC-6"}
              </span>

              <span
                onClick={() => {
                  setIsPlayingTour(false);
                  const idx = timezoneSpanOptions.findIndex((o) => o.offsetMinutes === 0);
                  if (idx !== -1) setSelectedTimezoneIndex(idx);
                }}
                className="hidden sm:inline cursor-pointer hover:text-primary transition-colors"
                title="Jump to UTC+0"
              >
                UTC+0
              </span>

              <span
                onClick={() => {
                  setIsPlayingTour(false);
                  const idx = timezoneSpanOptions.findIndex((o) => o.offsetMinutes === 330);
                  if (idx !== -1) setSelectedTimezoneIndex(idx);
                }}
                className="hidden sm:inline cursor-pointer hover:text-primary transition-colors"
                title="Jump to UTC+5:30"
              >
                UTC+5:30
              </span>

              <span
                onClick={() => {
                  setIsPlayingTour(false);
                  const idx = timezoneSpanOptions.findIndex((o) => o.offsetMinutes === 540);
                  if (idx !== -1) setSelectedTimezoneIndex(idx);
                }}
                className="hidden sm:inline cursor-pointer hover:text-primary transition-colors"
                title="Jump to UTC+9"
              >
                UTC+9
              </span>

              <span
                onClick={() => {
                  setIsPlayingTour(false);
                  setSelectedTimezoneIndex(timezoneSpanOptions.length - 1);
                }}
                className={`cursor-pointer hover:text-primary transition-colors flex items-center gap-0.5 ${
                  selectedTimezoneIndex === timezoneSpanOptions.length - 1 ? "text-primary font-bold" : ""
                }`}
                title="Jump to latest timezone"
              >
                Last: {timezoneSpanOptions[timezoneSpanOptions.length - 1]?.label || "UTC+13"} ▶
              </span>
            </div>
          </div>

          {/* Active Zone Capitals Chips Preview */}
          {activeTimezoneOption && (
            <div className="mt-3 pt-3 border-t border-zinc-200/60 dark:border-zinc-800/60 flex flex-wrap items-center gap-1.5 animate-in fade-in-50 duration-150">
              <span className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400 mr-1 flex items-center gap-1">
                {isActiveZoneDaytime ? <Sun className="size-3 text-amber-500" /> : <Moon className="size-3 text-indigo-400" />}
                Capitals in {activeTimezoneOption.label}:
              </span>
              {activeTimezoneOption.capitals.map((cap) => (
                <button
                  key={cap.id}
                  onClick={() => setSelectedCapital(cap)}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 text-xs font-medium text-zinc-800 dark:text-zinc-200 hover:border-primary hover:text-primary transition-all cursor-pointer shadow-2xs"
                >
                  <span>{cap.flag}</span>
                  <span>{cap.capital}</span>
                  <span className="text-[10px] text-zinc-400 font-mono">
                    {formatLocalTime(now, cap.timezone, is24Hour)}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Search, Region & Sort Filters */}
        <div className="mb-6 space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            {/* Search Input */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-zinc-400" />
              <Input
                type="text"
                placeholder="Search by capital, country, or timezone..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-9 h-10 rounded-xl bg-zinc-50 dark:bg-zinc-900/60 border-zinc-200 dark:border-zinc-800"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 cursor-pointer"
                >
                  <X className="size-4" />
                </button>
              )}
            </div>

            {/* Sort & Time-of-day filters */}
            <div className="flex flex-wrap items-center gap-2">
              {/* Day / Night filter pills */}
              <div className="flex items-center rounded-xl bg-zinc-100 p-1 dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800/60">
                <button
                  onClick={() => setTimeOfDayFilter("all")}
                  className={`px-2.5 py-1 text-xs font-medium rounded-lg cursor-pointer transition-colors ${
                    timeOfDayFilter === "all"
                      ? "bg-white text-zinc-900 shadow-xs dark:bg-zinc-800 dark:text-zinc-100"
                      : "text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
                  }`}
                >
                  All Times
                </button>
                <button
                  onClick={() => setTimeOfDayFilter("day")}
                  className={`px-2.5 py-1 text-xs font-medium rounded-lg cursor-pointer transition-colors flex items-center gap-1 ${
                    timeOfDayFilter === "day"
                      ? "bg-white text-amber-600 shadow-xs dark:bg-zinc-800 dark:text-amber-400"
                      : "text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
                  }`}
                >
                  <Sun className="size-3" />
                  Day
                </button>
                <button
                  onClick={() => setTimeOfDayFilter("night")}
                  className={`px-2.5 py-1 text-xs font-medium rounded-lg cursor-pointer transition-colors flex items-center gap-1 ${
                    timeOfDayFilter === "night"
                      ? "bg-white text-indigo-600 shadow-xs dark:bg-zinc-800 dark:text-indigo-400"
                      : "text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
                  }`}
                >
                  <Moon className="size-3" />
                  Night
                </button>
              </div>

              {/* Sort Selector */}
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800/60 text-xs">
                <ArrowUpDown className="size-3.5 text-zinc-400" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as SortOption)}
                  className="bg-transparent font-medium text-zinc-800 dark:text-zinc-200 outline-none cursor-pointer"
                >
                  <option value="capital-asc">Capital (A → Z)</option>
                  <option value="country-asc">Country (A → Z)</option>
                  <option value="time-asc">Time (Earliest First)</option>
                  <option value="time-desc">Time (Latest First)</option>
                  <option value="population-desc">Population (Highest)</option>
                  <option value="elevation-desc">Elevation (Highest)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Region Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {["All", "Africa", "Americas", "Asia", "Europe", "Oceania"].map((region) => {
              const isSelected = selectedRegion === region;
              const count =
                region === "All"
                  ? WORLD_CAPITALS.length
                  : WORLD_CAPITALS.filter((c) => c.region === region).length;
              return (
                <button
                  key={region}
                  onClick={() => setSelectedRegion(region)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-xl transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                    isSelected
                      ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 shadow-sm"
                      : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800"
                  }`}
                >
                  <span>{region}</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                      isSelected
                        ? "bg-white/20 text-white dark:bg-black/20 dark:text-zinc-900"
                        : "bg-zinc-200 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400"
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Results Counter & Active Filter Chips */}
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2 text-xs text-zinc-500 dark:text-zinc-400">
          <div className="flex items-center gap-2 flex-wrap">
            <span>
              Showing <strong>{filteredCapitals.length}</strong> of {TOTAL_CAPITALS_COUNT} capitals
            </span>

            {activeTimezoneOption && (
              <Badge variant="outline" className="gap-1 border-primary/40 text-primary bg-primary/5">
                <span>Zone: {activeTimezoneOption.label}</span>
                <X
                  className="size-3 cursor-pointer hover:opacity-75"
                  onClick={() => {
                    setSelectedTimezoneIndex(null);
                    setIsPlayingTour(false);
                  }}
                />
              </Badge>
            )}

            {selectedRegion !== "All" && (
              <Badge variant="outline" className="gap-1">
                <span>Region: {selectedRegion}</span>
                <X
                  className="size-3 cursor-pointer hover:opacity-75"
                  onClick={() => setSelectedRegion("All")}
                />
              </Badge>
            )}

            {timeOfDayFilter !== "all" && (
              <Badge variant="outline" className="gap-1">
                <span>{timeOfDayFilter === "day" ? "Daytime" : "Nighttime"}</span>
                <X
                  className="size-3 cursor-pointer hover:opacity-75"
                  onClick={() => setTimeOfDayFilter("all")}
                />
              </Badge>
            )}
          </div>

          {(searchQuery ||
            selectedRegion !== "All" ||
            timeOfDayFilter !== "all" ||
            selectedTimezoneIndex !== null) && (
            <button
              onClick={() => {
                setSearchQuery("");
                setSelectedRegion("All");
                setTimeOfDayFilter("all");
                setSelectedTimezoneIndex(null);
                setIsPlayingTour(false);
              }}
              className="text-primary hover:underline cursor-pointer font-medium"
            >
              Clear all filters
            </button>
          )}
        </div>

        {/* Capitals Grid */}
        {filteredCapitals.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredCapitals.map((item) => {
              const localTime = formatLocalTime(now, item.timezone, is24Hour);
              const localDate = formatLocalDate(now, item.timezone);
              const hour = getLocalHour(now, item.timezone);
              const isDaytime = hour >= 6 && hour < 18;
              const utcOffset = getUtcOffset(now, item.timezone);
              const relativeDiff = getRelativeDifference(now, item.timezone);

              return (
                <div
                  key={item.id}
                  onClick={() => setSelectedCapital(item)}
                  className="group relative cursor-pointer flex flex-col justify-between rounded-2xl border border-zinc-200/80 bg-white p-4 shadow-xs hover:shadow-xl hover:border-zinc-400 dark:border-zinc-800 dark:bg-zinc-950 dark:hover:border-zinc-600 transition-all duration-300 hover:-translate-y-1"
                >
                  {/* Top: Country Flag & Name */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="size-6 rounded-md overflow-hidden bg-zinc-100 dark:bg-zinc-900 ring-1 ring-zinc-200/60 dark:ring-zinc-800 flex-shrink-0">
                        <img
                          src={item.flagUrl}
                          alt={`${item.country} flag`}
                          className="w-full h-full object-cover"
                          loading="lazy"
                          onError={(e) => {
                            const target = e.currentTarget;
                            target.style.display = "none";
                          }}
                        />
                      </div>
                      <span className="text-xs font-medium text-zinc-600 dark:text-zinc-400 truncate">
                        {item.country}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      <Badge variant="outline" className="text-[10px] px-1.5 py-0 font-mono">
                        {item.countryCode}
                      </Badge>
                    </div>
                  </div>

                  {/* Middle: Capital City Name & Big Live Clock */}
                  <div className="mb-4">
                    <h3 className="font-bold text-lg text-zinc-900 dark:text-zinc-100 tracking-tight group-hover:text-primary transition-colors truncate">
                      {item.capital}
                    </h3>

                    {/* Clock Display */}
                    <div className="mt-2 flex items-baseline gap-2">
                      <span className="text-2xl sm:text-3xl font-extrabold tracking-tight font-mono text-zinc-900 dark:text-zinc-50">
                        {localTime}
                      </span>
                    </div>

                    <p className="text-[11px] text-zinc-400 dark:text-zinc-500 mt-0.5 flex items-center gap-1">
                      <Calendar className="size-3 text-zinc-400" />
                      {localDate}
                    </p>
                  </div>

                  {/* Badges: Day/Night, UTC, Relative Time */}
                  <div className="flex flex-wrap items-center gap-1.5 mb-3">
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-semibold ${
                        isDaytime
                          ? "bg-amber-500/10 text-amber-700 dark:bg-amber-400/10 dark:text-amber-300"
                          : "bg-indigo-500/10 text-indigo-700 dark:bg-indigo-400/10 dark:text-indigo-300"
                      }`}
                    >
                      {isDaytime ? <Sun className="size-3 text-amber-500" /> : <Moon className="size-3 text-indigo-400" />}
                      {isDaytime ? "Day" : "Night"}
                    </span>

                    <span className="px-2 py-0.5 rounded-lg text-[10px] font-mono bg-zinc-100 text-zinc-600 dark:bg-zinc-900 dark:text-zinc-400">
                      {utcOffset}
                    </span>

                    {relativeDiff && (
                      <span className="px-2 py-0.5 rounded-lg text-[10px] font-medium bg-zinc-100 text-zinc-500 dark:bg-zinc-900 dark:text-zinc-400">
                        {relativeDiff}
                      </span>
                    )}
                  </div>

                  {/* Bottom Stats Footer */}
                  <div className="pt-3 border-t border-zinc-100 dark:border-zinc-900 flex items-center justify-between text-[11px] text-zinc-500 dark:text-zinc-400">
                    <div className="flex items-center gap-1" title="Metropolitan Population">
                      <Users className="size-3 text-zinc-400" />
                      <span>{formatPopulation(item.population)}</span>
                    </div>

                    <div className="flex items-center gap-1" title="Elevation above sea level">
                      <Mountain className="size-3 text-zinc-400" />
                      <span>{item.elevation}m</span>
                    </div>

                    <div className="flex items-center gap-1" title="Region">
                      <MapPin className="size-3 text-zinc-400" />
                      <span>{item.region}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <Building2 className="size-12 text-zinc-300 dark:text-zinc-700 mb-3" />
            <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
              No capitals found
            </h3>
            <p className="mt-1 text-sm text-zinc-500 max-w-sm">
              We couldn&apos;t find any capital city matching &ldquo;{searchQuery}&rdquo;.
            </p>
            <Button
              onClick={() => {
                setSearchQuery("");
                setSelectedRegion("All");
                setTimeOfDayFilter("all");
                setSelectedTimezoneIndex(null);
                setIsPlayingTour(false);
              }}
              variant="outline"
              className="mt-4 rounded-xl cursor-pointer"
            >
              Reset Filters
            </Button>
          </div>
        )}
      </main>

      {/* CAPITAL DETAILS MODAL */}
      {selectedCapital && (
        <Dialog open={!!selectedCapital} onOpenChange={(open) => !open && setSelectedCapital(null)}>
          <DialogContent className="sm:max-w-md p-6 rounded-3xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800">
            <DialogHeader className="gap-1">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{selectedCapital.flag}</span>
                  <Badge variant="outline" className="text-xs font-mono">
                    {selectedCapital.countryCode}
                  </Badge>
                  <span className="text-xs font-medium text-zinc-500">
                    {selectedCapital.region}
                  </span>
                </div>
              </div>

              <DialogTitle className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 mt-2">
                {selectedCapital.capital}
              </DialogTitle>
              <DialogDescription className="text-xs text-zinc-500 dark:text-zinc-400">
                Capital of <strong>{selectedCapital.country}</strong>
              </DialogDescription>
            </DialogHeader>

            {/* Live Clock Feature Box */}
            <div className="my-4 p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900/80 border border-zinc-200/80 dark:border-zinc-800 text-center">
              <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-1">
                Current Local Time
              </p>
              <div className="text-3xl font-extrabold font-mono text-zinc-900 dark:text-zinc-50 tracking-wider">
                {formatLocalTime(now, selectedCapital.timezone, is24Hour)}
              </div>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                {formatLocalDate(now, selectedCapital.timezone)} • {getUtcOffset(now, selectedCapital.timezone)}
              </p>
            </div>

            {/* Facts Grid */}
            <div className="grid grid-cols-2 gap-3 text-xs mb-4">
              <div className="p-3 rounded-xl bg-zinc-100/60 dark:bg-zinc-900/50">
                <p className="text-zinc-400 font-medium">Population</p>
                <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 mt-0.5">
                  {selectedCapital.population.toLocaleString()}
                </p>
              </div>

              <div className="p-3 rounded-xl bg-zinc-100/60 dark:bg-zinc-900/50">
                <p className="text-zinc-400 font-medium">Elevation</p>
                <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 mt-0.5">
                  {selectedCapital.elevation} meters ({Math.round(selectedCapital.elevation * 3.28084)} ft)
                </p>
              </div>

              <div className="p-3 rounded-xl bg-zinc-100/60 dark:bg-zinc-900/50">
                <p className="text-zinc-400 font-medium">Coordinates</p>
                <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 mt-0.5 font-mono">
                  {selectedCapital.lat.toFixed(2)}°, {selectedCapital.lng.toFixed(2)}°
                </p>
              </div>

              <div className="p-3 rounded-xl bg-zinc-100/60 dark:bg-zinc-900/50">
                <p className="text-zinc-400 font-medium">IANA Timezone</p>
                <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 mt-0.5 truncate font-mono">
                  {selectedCapital.timezone}
                </p>
              </div>
            </div>

            {/* Trivia Box */}
            <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-900 dark:text-amber-200 flex items-start gap-2.5">
              <Sparkles className="size-4 text-amber-500 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-amber-800 dark:text-amber-300 mb-0.5">
                  Did you know?
                </p>
                <p className="leading-relaxed text-zinc-700 dark:text-zinc-300">
                  {selectedCapital.funFact}
                </p>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="mt-5 flex items-center justify-between gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedCapital(null)}
                className="rounded-xl cursor-pointer"
              >
                Close
              </Button>

              <Link
                href={`/?search=${encodeURIComponent(selectedCapital.country)}`}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200 text-xs font-semibold cursor-pointer transition-colors shadow-xs"
              >
                <span>View {selectedCapital.country} in Atlas</span>
                <ExternalLink className="size-3.5" />
              </Link>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Floating Bottom Menubar */}
      <BottomDock />
    </div>
  );
}

export default function CapitalsPage() {
  return (
    <React.Suspense fallback={<div className="min-h-screen bg-white dark:bg-black" />}>
      <CapitalsContent />
    </React.Suspense>
  );
}
