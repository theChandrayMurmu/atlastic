"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Menubar,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarSeparator,
  MenubarTrigger,
  MenubarSub,
  MenubarSubTrigger,
  MenubarSubContent,
} from "@/components/ui/menubar";
import {
  Globe2,
  Building2,
  Coins,
  Calculator,
  TrendingUp,
  ArrowUpDown,
  Flag,
  Clock,
  Search,
} from "lucide-react";
import { COUNTRIES } from "@/data/countries";
import { ALL_CURRENCIES } from "@/data/currencies";

interface BottomDockProps {
  onSortChange?: (sort: "asc" | "desc" | "capital") => void;
  onRegionChange?: (region: string) => void;
  onCurrencyFilter?: (curr: string | null) => void;
  currentSort?: string;
  currentRegion?: string;
  currentCurrency?: string | null;
}

export function BottomDock({
  onSortChange,
  onRegionChange,
  onCurrencyFilter,
  currentSort = "asc",
  currentRegion = "All",
  currentCurrency = null,
}: BottomDockProps) {
  const pathname = usePathname();

  const isHome = pathname === "/";
  const isCapitals = pathname === "/capitals" || pathname === "/capital";
  const isCurrencies = pathname === "/currencies" || pathname === "/currency";
  const isFlags = pathname === "/flags";
  const isCalculator = pathname === "/calculator";

  return (
    <nav
      aria-label="Bottom Navigation"
      className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-4 w-full max-w-fit pointer-events-none"
    >
      <div className="pointer-events-auto rounded-2xl p-1 bg-white/90 shadow-2xl backdrop-blur-xl border border-zinc-200/90 dark:bg-zinc-950/90 dark:border-zinc-800">
        <Menubar className="border-0 bg-transparent shadow-none h-10 gap-1">
          {/* 1. Country */}
          <MenubarMenu>
            <MenubarTrigger
              className={`cursor-pointer gap-1.5 px-3 py-1.5 rounded-xl font-medium text-xs hover:bg-zinc-100 dark:hover:bg-zinc-800 ${
                isHome ? "text-primary font-semibold" : ""
              }`}
            >
              <Globe2 className="size-3.5" />
              <span>Country</span>
            </MenubarTrigger>
            <MenubarContent side="top" align="center" className="min-w-48 mb-2">
              <MenubarItem render={<Link href="/" />} className="cursor-pointer">
                Explore Countries ({COUNTRIES.length})
              </MenubarItem>
              {onSortChange && isHome && (
                <>
                  <MenubarSeparator />
                  <MenubarItem
                    onClick={() => onSortChange("asc")}
                    className="cursor-pointer"
                  >
                    Sort: A → Z {currentSort === "asc" && "✓"}
                  </MenubarItem>
                  <MenubarItem
                    onClick={() => onSortChange("desc")}
                    className="cursor-pointer"
                  >
                    Sort: Z → A {currentSort === "desc" && "✓"}
                  </MenubarItem>
                </>
              )}
              {onRegionChange && isHome && (
                <>
                  <MenubarSeparator />
                  <MenubarSub>
                    <MenubarSubTrigger className="cursor-pointer">
                      Filter by Region
                    </MenubarSubTrigger>
                    <MenubarSubContent side="top">
                      {["All", "Africa", "Americas", "Asia", "Europe", "Oceania"].map(
                        (r) => (
                          <MenubarItem
                            key={r}
                            onClick={() => onRegionChange(r)}
                            className="cursor-pointer"
                          >
                            {r} {currentRegion === r && "✓"}
                          </MenubarItem>
                        )
                      )}
                    </MenubarSubContent>
                  </MenubarSub>
                </>
              )}
            </MenubarContent>
          </MenubarMenu>

          {/* 2. Capital */}
          <MenubarMenu>
            <MenubarTrigger
              className={`cursor-pointer gap-1.5 px-3 py-1.5 rounded-xl font-medium text-xs hover:bg-zinc-100 dark:hover:bg-zinc-800 ${
                isCapitals ? "text-primary font-semibold" : ""
              }`}
            >
              <Building2 className="size-3.5" />
              <span>Capital</span>
            </MenubarTrigger>
            <MenubarContent side="top" align="center" className="min-w-56 mb-2">
              <MenubarItem
                render={<Link href="/capitals" />}
                className="cursor-pointer font-medium"
              >
                <Clock className="size-3.5 mr-1 text-primary" />
                World Capitals & Live Clocks
              </MenubarItem>
              {isHome && onSortChange ? (
                <>
                  <MenubarSeparator />
                  <MenubarItem
                    onClick={() => onSortChange("capital")}
                    className="cursor-pointer"
                  >
                    <ArrowUpDown className="size-3.5 mr-1" />
                    Sort Countries by Capital {currentSort === "capital" && "✓"}
                  </MenubarItem>
                </>
              ) : null}
              <MenubarSeparator />
              <MenubarItem
                render={<Link href="/capitals" />}
                className="cursor-pointer"
              >
                <Building2 className="size-3.5 mr-1" />
                Explore 196 World Capitals
              </MenubarItem>
            </MenubarContent>
          </MenubarMenu>

          {/* 3. Currency */}
          <MenubarMenu>
            <MenubarTrigger
              className={`cursor-pointer gap-1.5 px-3 py-1.5 rounded-xl font-medium text-xs hover:bg-zinc-100 dark:hover:bg-zinc-800 ${
                isCurrencies ? "text-primary font-semibold" : ""
              }`}
            >
              <Coins className="size-3.5" />
              <span>Currency</span>
            </MenubarTrigger>
            <MenubarContent side="top" align="center" className="min-w-56 mb-2">
              <MenubarItem
                render={<Link href="/currencies#converter" />}
                className="cursor-pointer font-medium"
              >
                <TrendingUp className="size-3.5 mr-1 text-primary" />
                Live Currency Converter
              </MenubarItem>
              <MenubarItem
                render={<Link href="/currencies" />}
                className="cursor-pointer"
              >
                <Coins className="size-3.5 mr-1" />
                All World Currencies ({ALL_CURRENCIES.length})
              </MenubarItem>
              <MenubarSeparator />
              {onCurrencyFilter && isHome ? (
                <>
                  <MenubarItem
                    onClick={() => onCurrencyFilter(null)}
                    className="cursor-pointer"
                  >
                    All Currencies {!currentCurrency && "✓"}
                  </MenubarItem>
                  {["USD", "EUR", "GBP", "JPY", "INR"].map((cur) => (
                    <MenubarItem
                      key={cur}
                      onClick={() => onCurrencyFilter(cur)}
                      className="cursor-pointer"
                    >
                      Filter {cur} {currentCurrency === cur && "✓"}
                    </MenubarItem>
                  ))}
                </>
              ) : (
                <MenubarItem
                  render={<Link href="/" />}
                  className="cursor-pointer"
                >
                  Filter on Map/Countries
                </MenubarItem>
              )}
            </MenubarContent>
          </MenubarMenu>

          {/* 4. Flags */}
          <MenubarMenu>
            <MenubarTrigger
              className={`cursor-pointer gap-1.5 px-3 py-1.5 rounded-xl font-medium text-xs hover:bg-zinc-100 dark:hover:bg-zinc-800 ${
                isFlags ? "text-primary font-semibold" : ""
              }`}
            >
              <Flag className="size-3.5" />
              <span>Flags</span>
            </MenubarTrigger>
            <MenubarContent side="top" align="center" className="min-w-52 mb-2">
              <MenubarItem
                render={<Link href="/flags" />}
                className="cursor-pointer font-medium"
              >
                <Flag className="size-3.5 mr-1 text-primary" />
                All 287 World Flags
              </MenubarItem>
              <MenubarSeparator />
              <MenubarItem
                render={<Link href="/flags?fullscreen=true" />}
                className="cursor-pointer"
              >
                Fullscreen Showcase
              </MenubarItem>
            </MenubarContent>
          </MenubarMenu>

          {/* 5. Calculator */}
          <MenubarMenu>
            <MenubarTrigger
              className={`cursor-pointer gap-1.5 px-3 py-1.5 rounded-xl font-medium text-xs hover:bg-zinc-100 dark:hover:bg-zinc-800 ${
                isCalculator ? "text-primary font-semibold" : ""
              }`}
            >
              <Calculator className="size-3.5" />
              <span>Calculator</span>
            </MenubarTrigger>
            <MenubarContent side="top" align="center" className="min-w-52 mb-2">
              <MenubarItem
                render={<Link href="/calculator" />}
                className="cursor-pointer font-medium"
              >
                <Calculator className="size-3.5 mr-1 text-primary" />
                Cash & Coins Calculator
              </MenubarItem>
            </MenubarContent>
          </MenubarMenu>

          {/* 6. Global Search Button */}
          <button
            onClick={() =>
              window.dispatchEvent(new CustomEvent("open-global-search"))
            }
            className="cursor-pointer gap-1.5 px-3 py-1.5 rounded-xl font-medium text-xs hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-400 flex items-center transition-colors"
            title="Global Search across all pages (Cmd+K / Ctrl+K)"
          >
            <Search className="size-3.5 text-zinc-500" />
            <span className="hidden sm:inline font-mono text-[10px] px-1 py-0.2 rounded bg-zinc-200/60 dark:bg-zinc-800 text-zinc-500">
              ⌘K
            </span>
          </button>
        </Menubar>
      </div>
    </nav>
  );
}
