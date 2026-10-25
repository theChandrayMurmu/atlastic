"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { COUNTRIES } from "@/data/countries";
import { WORLD_CAPITALS } from "@/data/capitals";
import { ALL_CURRENCIES } from "@/data/currencies";
import { WORLD_FLAGS } from "@/data/flags";
import {
  Search,
  Globe2,
  Building2,
  Coins,
  Flag,
  Calculator,
  ArrowRight,
  TrendingUp,
  X,
  Clock,
  Sparkles,
  Sun,
  Moon,
  ChevronDown,
} from "lucide-react";

export type SearchCategory = "all" | "countries" | "capitals" | "currencies" | "flags" | "tools";

interface SearchResultItem {
  id: string;
  title: string;
  subtitle: string;
  category: "countries" | "capitals" | "currencies" | "flags" | "tools";
  badge?: string;
  flagUrl?: string;
  flagEmoji?: string;
  url: string;
  actionText?: string;
}

// Fixed system tools & pages
const TOOLS_ITEMS: SearchResultItem[] = [
  {
    id: "tool-countries",
    title: "Country Atlas & World Map",
    subtitle: "Explore 195 sovereign countries with filters & details",
    category: "tools",
    badge: "Atlas",
    flagEmoji: "🌍",
    url: "/",
    actionText: "Open Atlas",
  },
  {
    id: "tool-capitals",
    title: "World Capitals & Live Clocks",
    subtitle: "Real-time world clocks across all 196 capitals & timezones",
    category: "tools",
    badge: "Clocks",
    flagEmoji: "🏛️",
    url: "/capitals",
    actionText: "View Clocks",
  },
  {
    id: "tool-currencies",
    title: "All World Currencies",
    subtitle: "Directory of 160+ world currencies & symbols",
    category: "tools",
    badge: "Currencies",
    flagEmoji: "🪙",
    url: "/currencies",
    actionText: "Browse",
  },
  {
    id: "tool-converter",
    title: "Currency Exchange Converter",
    subtitle: "Real-time currency converter with live rates",
    category: "tools",
    badge: "Tool",
    flagEmoji: "📈",
    url: "/currencies#converter",
    actionText: "Convert",
  },
  {
    id: "tool-flags",
    title: "287 World Flags Gallery",
    subtitle: "Appealing fullscreen flags of all countries & regions",
    category: "tools",
    badge: "Flags",
    flagEmoji: "🚩",
    url: "/flags",
    actionText: "View Flags",
  },
  {
    id: "tool-flags-fullscreen",
    title: "Fullscreen Flags Showcase",
    subtitle: "Cinema slideshow viewer for world flags",
    category: "tools",
    badge: "Showcase",
    flagEmoji: "🎬",
    url: "/flags?fullscreen=true",
    actionText: "Start Slideshow",
  },
  {
    id: "tool-calculator",
    title: "Cash & Coins Money Calculator",
    subtitle: "Denomination counter with auto-updating currency tables",
    category: "tools",
    badge: "Calculator",
    flagEmoji: "🧮",
    url: "/calculator",
    actionText: "Calculate",
  },
];

export function GlobalSearch() {
  const router = useRouter();

  const [isOpen, setIsOpen] = React.useState(false);
  const [query, setQuery] = React.useState("");
  const [selectedCategory, setSelectedCategory] = React.useState<SearchCategory>("all");
  const [selectedIndex, setSelectedIndex] = React.useState(0);
  const [isMac, setIsMac] = React.useState(false);

  // Mobile Pull-to-Search state
  const [pullY, setPullY] = React.useState(0);
  const [isPulling, setIsPulling] = React.useState(false);
  const [canRelease, setCanRelease] = React.useState(false);

  const touchStartRef = React.useRef<number | null>(null);
  const inputRef = React.useRef<HTMLInputElement | null>(null);
  const resultsContainerRef = React.useRef<HTMLDivElement | null>(null);

  // Detect OS for shortcut hint (Cmd+K on Mac, Ctrl+K on Windows/Linux)
  React.useEffect(() => {
    const isApple = /(Mac|iPhone|iPod|iPad)/i.test(
      navigator.platform || navigator.userAgent || ""
    );
    setIsMac(isApple);
  }, []);

  // Keyboard shortcut listener: Cmd+K / Ctrl+K and custom event
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Check for Cmd+K (Mac) or Ctrl+K (Windows/Linux)
      if ((e.metaKey || e.ctrlKey) && (e.key === "k" || e.key === "K")) {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      } else if (e.key === "Escape" && isOpen) {
        setIsOpen(false);
      }
    };

    const handleCustomOpen = () => {
      setIsOpen(true);
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("open-global-search", handleCustomOpen);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("open-global-search", handleCustomOpen);
    };
  }, [isOpen]);

  // Mobile Pull-To-Search: touch event listeners on window
  React.useEffect(() => {
    const handleTouchStart = (e: TouchEvent) => {
      // Only trigger if user is at the very top of the page
      if (window.scrollY <= 1 && document.documentElement.scrollTop <= 1) {
        touchStartRef.current = e.touches[0].clientY;
        setIsPulling(true);
      } else {
        touchStartRef.current = null;
        setIsPulling(false);
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (touchStartRef.current === null) return;
      if (window.scrollY > 1 || document.documentElement.scrollTop > 1) {
        setPullY(0);
        setCanRelease(false);
        setIsPulling(false);
        return;
      }

      const currentY = e.touches[0].clientY;
      const diff = currentY - touchStartRef.current;

      if (diff > 0) {
        // Logarithmic resistance
        const distance = Math.min(Math.pow(diff, 0.85) * 1.8, 90);
        setPullY(distance);
        setCanRelease(distance >= 60);
      } else {
        setPullY(0);
        setCanRelease(false);
      }
    };

    const handleTouchEnd = () => {
      if (canRelease) {
        // Haptic feedback if available
        if (typeof navigator !== "undefined" && navigator.vibrate) {
          try {
            navigator.vibrate(20);
          } catch {}
        }
        setIsOpen(true);
      }
      setPullY(0);
      setCanRelease(false);
      setIsPulling(false);
      touchStartRef.current = null;
    };

    window.addEventListener("touchstart", handleTouchStart, { passive: true });
    window.addEventListener("touchmove", handleTouchMove, { passive: true });
    window.addEventListener("touchend", handleTouchEnd, { passive: true });

    return () => {
      window.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("touchend", handleTouchEnd);
    };
  }, [canRelease]);

  // Auto-focus input when modal opens
  React.useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
      setSelectedIndex(0);
    } else {
      setQuery("");
    }
  }, [isOpen]);

  // Search Results filtering across all datasets
  const searchResults = React.useMemo<SearchResultItem[]>(() => {
    const q = query.toLowerCase().trim();

    // Default suggestions when query is empty
    if (!q) {
      if (selectedCategory === "tools") return TOOLS_ITEMS;
      if (selectedCategory === "countries") {
        return COUNTRIES.slice(0, 8).map((c) => ({
          id: `country-${c.code}`,
          title: c.name,
          subtitle: `Capital: ${c.capital} • Currency: ${c.currencyCode} (${c.currency})`,
          category: "countries" as const,
          badge: c.region,
          flagUrl: `https://flagcdn.com/w160/${c.code.toLowerCase()}.png`,
          flagEmoji: c.flag,
          url: `/?search=${encodeURIComponent(c.name)}`,
        }));
      }
      if (selectedCategory === "capitals") {
        return WORLD_CAPITALS.slice(0, 8).map((c) => ({
          id: `capital-${c.id}`,
          title: c.capital,
          subtitle: `Capital of ${c.country} • ${c.timezone}`,
          category: "capitals" as const,
          badge: c.region,
          flagUrl: c.flagUrl,
          flagEmoji: c.flag,
          url: `/capitals?search=${encodeURIComponent(c.capital)}`,
        }));
      }
      if (selectedCategory === "currencies") {
        return ALL_CURRENCIES.slice(0, 8).map((cur) => ({
          id: `cur-${cur.code}`,
          title: `${cur.code} - ${cur.name}`,
          subtitle: `Symbol: ${cur.symbol} • Used in ${cur.countries.length} countries`,
          category: "currencies" as const,
          badge: cur.symbol,
          url: `/currencies?search=${encodeURIComponent(cur.code)}`,
        }));
      }
      if (selectedCategory === "flags") {
        return WORLD_FLAGS.slice(0, 8).map((f) => ({
          id: `flag-${f.code}`,
          title: f.name,
          subtitle: f.type,
          category: "flags" as const,
          badge: f.type === "Sovereign State" ? "Sovereign" : "Region",
          flagUrl: f.flagUrl,
          url: `/flags?search=${encodeURIComponent(f.name)}`,
        }));
      }

      // "All" tab when empty: show Tools first + sample popular picks
      return [
        ...TOOLS_ITEMS.slice(0, 4),
        {
          id: "cap-tokyo",
          title: "Tokyo",
          subtitle: "Capital of Japan • Asia/Tokyo",
          category: "capitals" as const,
          badge: "Popular",
          flagUrl: "https://flagcdn.com/w160/jp.png",
          flagEmoji: "🇯🇵",
          url: "/capitals?search=Tokyo",
        },
        {
          id: "cap-london",
          title: "London",
          subtitle: "Capital of United Kingdom • Europe/London",
          category: "capitals" as const,
          badge: "Popular",
          flagUrl: "https://flagcdn.com/w160/gb.png",
          flagEmoji: "🇬🇧",
          url: "/capitals?search=London",
        },
        {
          id: "country-in",
          title: "India",
          subtitle: "Capital: New Delhi • Currency: INR (Indian Rupee)",
          category: "countries" as const,
          badge: "Popular",
          flagUrl: "https://flagcdn.com/w160/in.png",
          flagEmoji: "🇮🇳",
          url: "/?search=India",
        },
        {
          id: "country-us",
          title: "United States",
          subtitle: "Capital: Washington, D.C. • Currency: USD (US Dollar)",
          category: "countries" as const,
          badge: "Popular",
          flagUrl: "https://flagcdn.com/w160/us.png",
          flagEmoji: "🇺🇸",
          url: "/?search=United%20States",
        },
      ];
    }

    const results: SearchResultItem[] = [];

    // 1. Search Tools
    if (selectedCategory === "all" || selectedCategory === "tools") {
      const toolMatches = TOOLS_ITEMS.filter(
        (t) =>
          t.title.toLowerCase().includes(q) ||
          t.subtitle.toLowerCase().includes(q) ||
          t.badge?.toLowerCase().includes(q)
      );
      results.push(...toolMatches);
    }

    // 2. Search Capitals
    if (selectedCategory === "all" || selectedCategory === "capitals") {
      const capMatches = WORLD_CAPITALS.filter(
        (c) =>
          c.capital.toLowerCase().includes(q) ||
          c.country.toLowerCase().includes(q) ||
          c.timezone.toLowerCase().includes(q)
      ).slice(0, 10);

      results.push(
        ...capMatches.map((c) => ({
          id: `capital-${c.id}`,
          title: c.capital,
          subtitle: `Capital of ${c.country} • ${c.timezone} • ${c.population.toLocaleString()} pop`,
          category: "capitals" as const,
          badge: c.region,
          flagUrl: c.flagUrl,
          flagEmoji: c.flag,
          url: `/capitals?search=${encodeURIComponent(c.capital)}`,
        }))
      );
    }

    // 3. Search Countries
    if (selectedCategory === "all" || selectedCategory === "countries") {
      const countryMatches = COUNTRIES.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.code.toLowerCase().includes(q) ||
          c.capital.toLowerCase().includes(q) ||
          c.currencyCode.toLowerCase().includes(q) ||
          c.currency.toLowerCase().includes(q)
      ).slice(0, 10);

      results.push(
        ...countryMatches.map((c) => ({
          id: `country-${c.code}`,
          title: c.name,
          subtitle: `Capital: ${c.capital} • Currency: ${c.currencyCode} (${c.currency})`,
          category: "countries" as const,
          badge: c.region,
          flagUrl: `https://flagcdn.com/w160/${c.code.toLowerCase()}.png`,
          flagEmoji: c.flag,
          url: `/?search=${encodeURIComponent(c.name)}`,
        }))
      );
    }

    // 4. Search Currencies
    if (selectedCategory === "all" || selectedCategory === "currencies") {
      const curMatches = ALL_CURRENCIES.filter(
        (cur) =>
          cur.code.toLowerCase().includes(q) ||
          cur.name.toLowerCase().includes(q) ||
          cur.symbol.toLowerCase().includes(q) ||
          cur.countries.some((c) => c.name.toLowerCase().includes(q))
      ).slice(0, 10);

      results.push(
        ...curMatches.map((cur) => ({
          id: `cur-${cur.code}`,
          title: `${cur.code} - ${cur.name}`,
          subtitle: `Symbol: ${cur.symbol} • Used in ${cur.countries.length} countries (${cur.countries.slice(0, 3).map((c) => c.name).join(", ")})`,
          category: "currencies" as const,
          badge: cur.symbol,
          url: `/currencies?search=${encodeURIComponent(cur.code)}`,
        }))
      );
    }

    // 5. Search Flags
    if (selectedCategory === "all" || selectedCategory === "flags") {
      const flagMatches = WORLD_FLAGS.filter(
        (f) => f.name.toLowerCase().includes(q) || f.code.toLowerCase().includes(q)
      ).slice(0, 10);

      results.push(
        ...flagMatches.map((f) => ({
          id: `flag-${f.code}`,
          title: `${f.name} Flag`,
          subtitle: f.type,
          category: "flags" as const,
          badge: f.type === "Sovereign State" ? "Sovereign" : "Region",
          flagUrl: f.flagUrl,
          url: `/flags?search=${encodeURIComponent(f.name)}`,
        }))
      );
    }

    return results;
  }, [query, selectedCategory]);

  // Handle item selection & navigation
  const handleSelectItem = (item: SearchResultItem) => {
    setIsOpen(false);
    router.push(item.url);
  };

  // Keyboard navigation within results list
  const handleInputKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) =>
        prev < searchResults.length - 1 ? prev + 1 : 0
      );
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) =>
        prev > 0 ? prev - 1 : searchResults.length - 1
      );
    } else if (e.key === "Enter" && searchResults[selectedIndex]) {
      e.preventDefault();
      handleSelectItem(searchResults[selectedIndex]);
    }
  };

  // Scroll active item into view
  React.useEffect(() => {
    if (resultsContainerRef.current) {
      const activeEl = resultsContainerRef.current.querySelector(
        `[data-index="${selectedIndex}"]`
      ) as HTMLElement;
      if (activeEl) {
        activeEl.scrollIntoView({ block: "nearest" });
      }
    }
  }, [selectedIndex]);

  return (
    <>
      {/* MOBILE PULL-TO-SEARCH VISUAL INDICATOR */}
      <div
        className="fixed top-0 left-0 right-0 z-50 pointer-events-none flex justify-center transition-transform duration-100 ease-out sm:hidden"
        style={{
          transform: `translateY(${Math.max(pullY - 55, -60)}px)`,
          opacity: pullY > 10 ? Math.min(pullY / 40, 1) : 0,
        }}
      >
        <div
          className={`flex items-center gap-2 px-4 py-2 rounded-full shadow-xl border backdrop-blur-md text-xs font-semibold transition-colors duration-200 ${
            canRelease
              ? "bg-zinc-900 text-white border-zinc-700 dark:bg-white dark:text-zinc-900 dark:border-zinc-300 scale-105"
              : "bg-white/95 text-zinc-700 border-zinc-200 dark:bg-zinc-900/95 dark:text-zinc-300 dark:border-zinc-800"
          }`}
        >
          <div
            className={`transition-transform duration-200 ${
              canRelease ? "rotate-180 text-primary" : ""
            }`}
          >
            <ChevronDown className="size-4 animate-bounce" />
          </div>
          <span>{canRelease ? "Release to search 🔍" : "Pull down to search..."}</span>
        </div>
      </div>

      {/* GLOBAL SEARCH DIALOG / COMMAND PALETTE */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent
          showCloseButton={false}
          className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl p-0 gap-0 overflow-hidden rounded-2xl bg-white/95 dark:bg-zinc-950/95 border border-zinc-200 dark:border-zinc-800 shadow-2xl backdrop-blur-xl animate-in zoom-in-95 duration-150"
        >
          {/* Accessible Hidden Dialog Title */}
          <DialogTitle className="sr-only">Global Search</DialogTitle>

          {/* Search Header Bar */}
          <div className="flex items-center gap-3 px-4 py-3.5 border-b border-zinc-100 dark:border-zinc-900">
            <Search className="size-5 text-zinc-400 shrink-0" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setSelectedIndex(0);
              }}
              onKeyDown={handleInputKeyDown}
              placeholder="Search countries, capitals, currencies, flags, tools..."
              className="flex-1 bg-transparent text-sm sm:text-base font-medium text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 outline-none"
            />
            {query && (
              <button
                onClick={() => {
                  setQuery("");
                  setSelectedIndex(0);
                }}
                className="size-5 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 cursor-pointer"
              >
                <X className="size-3" />
              </button>
            )}
            <div className="hidden sm:flex items-center gap-1.5 px-2 py-1 rounded-md bg-zinc-100 dark:bg-zinc-900 text-[11px] font-mono font-medium text-zinc-500 border border-zinc-200/60 dark:border-zinc-800/60">
              <span>{isMac ? "⌘" : "Ctrl+"}</span>
              <span>K</span>
            </div>
          </div>

          {/* Category Filter Chips */}
          <div className="flex items-center gap-1.5 px-4 py-2 border-b border-zinc-100 dark:border-zinc-900 overflow-x-auto scrollbar-none bg-zinc-50/50 dark:bg-zinc-900/30">
            {[
              { id: "all", label: "All" },
              { id: "tools", label: "⚡ Tools" },
              { id: "capitals", label: "🏛️ Capitals" },
              { id: "countries", label: "🌍 Countries" },
              { id: "currencies", label: "🪙 Currencies" },
              { id: "flags", label: "🚩 Flags" },
            ].map((cat) => {
              const isActive = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => {
                    setSelectedCategory(cat.id as SearchCategory);
                    setSelectedIndex(0);
                  }}
                  className={`px-2.5 py-1 text-xs font-medium rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
                    isActive
                      ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 shadow-xs"
                      : "text-zinc-600 hover:bg-zinc-200/60 dark:text-zinc-400 dark:hover:bg-zinc-800/60"
                  }`}
                >
                  {cat.label}
                </button>
              );
            })}
          </div>

          {/* Search Results List */}
          <div
            ref={resultsContainerRef}
            className="max-h-[60vh] sm:max-h-[380px] overflow-y-auto p-2 divide-y divide-zinc-50 dark:divide-zinc-900/50"
          >
            {searchResults.length > 0 ? (
              searchResults.map((item, index) => {
                const isSelected = index === selectedIndex;
                return (
                  <div
                    key={item.id}
                    data-index={index}
                    onClick={() => handleSelectItem(item)}
                    onMouseEnter={() => setSelectedIndex(index)}
                    className={`flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl cursor-pointer transition-all ${
                      isSelected
                        ? "bg-zinc-100 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-50"
                        : "hover:bg-zinc-50 dark:hover:bg-zinc-900/50 text-zinc-700 dark:text-zinc-300"
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      {/* Flag / Icon */}
                      <div className="size-8 rounded-lg overflow-hidden bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center shrink-0 border border-zinc-200/60 dark:border-zinc-800">
                        {item.flagUrl ? (
                          <img
                            src={item.flagUrl}
                            alt=""
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              const target = e.currentTarget;
                              target.style.display = "none";
                            }}
                          />
                        ) : (
                          <span className="text-base">{item.flagEmoji || "🌐"}</span>
                        )}
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-sm truncate">
                            {item.title}
                          </span>
                          {item.badge && (
                            <span className="text-[10px] px-1.5 py-0.2 font-medium rounded-md bg-zinc-200/70 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
                              {item.badge}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-zinc-400 dark:text-zinc-500 truncate mt-0.5">
                          {item.subtitle}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {isSelected && (
                        <span className="hidden sm:inline-flex items-center gap-1 text-[11px] text-zinc-400 font-mono">
                          <span>Jump</span>
                          <ArrowRight className="size-3 text-primary" />
                        </span>
                      )}
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="py-12 text-center text-zinc-400">
                <Search className="size-8 mx-auto mb-2 opacity-40" />
                <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  No matching results found
                </p>
                <p className="text-xs text-zinc-400 mt-1">
                  Try searching for a different country, capital city, or currency code.
                </p>
              </div>
            )}
          </div>

          {/* Footer with Keyboard Hints */}
          <div className="flex items-center justify-between px-4 py-2.5 border-t border-zinc-100 dark:border-zinc-900 bg-zinc-50/70 dark:bg-zinc-900/40 text-[11px] text-zinc-400 font-mono">
            <div className="flex items-center gap-3">
              <span className="hidden sm:inline-flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 rounded bg-zinc-200/60 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">
                  ↑
                </kbd>
                <kbd className="px-1.5 py-0.5 rounded bg-zinc-200/60 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">
                  ↓
                </kbd>{" "}
                navigate
              </span>
              <span className="hidden sm:inline-flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 rounded bg-zinc-200/60 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">
                  ↵
                </kbd>{" "}
                select
              </span>
              <span className="inline-flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 rounded bg-zinc-200/60 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">
                  esc
                </kbd>{" "}
                close
              </span>
            </div>

            <div className="flex items-center gap-1 text-[10px] text-zinc-400">
              <span>Smartphones: pull down to search</span>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
