"use client";

import * as React from "react";
import Link from "next/link";
import { ThemeToggle } from "@/components/theme-toggle";
import { SearchTriggerButton } from "@/components/search-trigger-button";
import { BottomDock } from "@/components/bottom-dock";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { COUNTRIES } from "@/data/countries";
import {
  Search,
  Globe2,
  Building2,
  Coins,
  Compass,
  X,
  Flag,
} from "lucide-react";

const REGIONS = ["All", "Africa", "Americas", "Asia", "Europe", "Oceania"] as const;

export default function Home() {
  const [searchQuery, setSearchQuery] = React.useState("");
  const [selectedRegion, setSelectedRegion] = React.useState<string>("All");
  const [sortOrder, setSortOrder] = React.useState<"asc" | "desc" | "capital">("asc");
  const [currencyFilter, setCurrencyFilter] = React.useState<string | null>(null);

  // Filtered & Sorted countries
  const filteredCountries = React.useMemo(() => {
    return COUNTRIES.filter((country) => {
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        country.name.toLowerCase().includes(q) ||
        country.capital.toLowerCase().includes(q) ||
        country.currency.toLowerCase().includes(q) ||
        country.currencyCode.toLowerCase().includes(q);

      const matchesRegion =
        selectedRegion === "All" || country.region === selectedRegion;

      const matchesCurrency =
        !currencyFilter || country.currencyCode === currencyFilter;

      return matchesSearch && matchesRegion && matchesCurrency;
    }).sort((a, b) => {
      if (sortOrder === "capital") {
        return a.capital.localeCompare(b.capital);
      }
      if (sortOrder === "desc") {
        return b.name.localeCompare(a.name);
      }
      return a.name.localeCompare(b.name);
    });
  }, [searchQuery, selectedRegion, sortOrder, currencyFilter]);

  const resetFilters = () => {
    setSearchQuery("");
    setSelectedRegion("All");
    setSortOrder("asc");
    setCurrencyFilter(null);
  };

  return (
    <div className="relative flex flex-col min-h-screen bg-white text-zinc-900 dark:bg-black dark:text-zinc-50 transition-colors duration-200">
      {/* Top Header */}
      <header className="sticky top-0 z-40 w-full border-b border-zinc-100 bg-white/90 backdrop-blur-md dark:border-zinc-900 dark:bg-black/90">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="flex size-9 items-center justify-center rounded-xl bg-zinc-900 text-white dark:bg-white dark:text-black shadow-xs">
              <Globe2 className="size-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg tracking-tight">Atlastic</span>
                <Badge variant="secondary" className="text-[11px] font-medium">
                  {COUNTRIES.length} Countries
                </Badge>
              </div>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400 hidden sm:block">
                World Countries, Capitals & Currencies
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <SearchTriggerButton />
            <Link
              href="/flags"
              className="hidden lg:inline-flex items-center gap-1.5 text-xs font-medium text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
            >
              <Flag className="size-3.5" />
              World Flags (287)
            </Link>
            <Link
              href="/currencies"
              className="hidden lg:inline-flex items-center gap-1.5 text-xs font-medium text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
            >
              <Coins className="size-3.5" />
              World Currencies
            </Link>
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="mx-auto flex-1 w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8 pb-32">
        {/* Search & Region Filter Bar */}
        <div className="mb-8 flex flex-col gap-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-zinc-400" />
              <Input
                type="text"
                placeholder="Search country, capital, or currency..."
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

            {/* Active Filter Badges */}
            <div className="flex items-center gap-2 flex-wrap text-xs text-zinc-500 dark:text-zinc-400">
              <span>
                Showing:{" "}
                <strong className="text-zinc-900 dark:text-zinc-100">
                  {filteredCountries.length}
                </strong>{" "}
                countries
              </span>
              {currencyFilter && (
                <Badge
                  variant="outline"
                  className="gap-1 border-primary/30 text-primary"
                >
                  Currency: {currencyFilter}
                  <X
                    className="size-3 cursor-pointer"
                    onClick={() => setCurrencyFilter(null)}
                  />
                </Badge>
              )}
              {sortOrder !== "asc" && (
                <Badge variant="outline" className="gap-1">
                  Sort: {sortOrder === "desc" ? "Z → A" : "By Capital"}
                  <X
                    className="size-3 cursor-pointer"
                    onClick={() => setSortOrder("asc")}
                  />
                </Badge>
              )}
            </div>
          </div>

          {/* Region Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {REGIONS.map((region) => {
              const isActive = selectedRegion === region;
              return (
                <button
                  key={region}
                  onClick={() => setSelectedRegion(region)}
                  className={`rounded-full px-3.5 py-1.5 text-xs font-medium transition-all whitespace-nowrap cursor-pointer ${
                    isActive
                      ? "bg-zinc-900 text-white shadow-xs dark:bg-white dark:text-black"
                      : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800"
                  }`}
                >
                  {region}
                </button>
              );
            })}
          </div>
        </div>

        {/* Countries Grid */}
        {filteredCountries.length > 0 ? (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {filteredCountries.map((country) => (
              <div
                key={country.code}
                className="group relative flex flex-col justify-between rounded-2xl border border-zinc-200/80 bg-white p-4 shadow-xs transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md hover:border-zinc-300 dark:border-zinc-800 dark:bg-zinc-950 dark:hover:border-zinc-700"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2.5">
                    <span
                      className="text-3xl select-none"
                      role="img"
                      aria-label={country.name}
                    >
                      {country.flag}
                    </span>
                    <Badge
                      variant="outline"
                      className="text-[10px] font-medium tracking-wider text-zinc-500 border-zinc-200 dark:border-zinc-800"
                    >
                      {country.code}
                    </Badge>
                  </div>

                  <h2 className="font-semibold text-base tracking-tight text-zinc-900 dark:text-zinc-100 line-clamp-1">
                    {country.name}
                  </h2>
                </div>

                <div className="mt-4 space-y-2 pt-3 border-t border-zinc-100 dark:border-zinc-900 text-xs">
                  <div className="flex items-center gap-1.5 text-zinc-600 dark:text-zinc-300">
                    <Building2 className="size-3.5 text-zinc-400 shrink-0" />
                    <span className="text-zinc-400">Capital:</span>
                    <span className="font-medium truncate">{country.capital}</span>
                  </div>

                  <div className="flex items-center gap-1.5 text-zinc-600 dark:text-zinc-300">
                    <Coins className="size-3.5 text-zinc-400 shrink-0" />
                    <span className="text-zinc-400">Currency:</span>
                    <Link
                      href={`/currencies?q=${country.currencyCode}`}
                      className="font-medium truncate hover:underline hover:text-primary transition-colors"
                      title={`View ${country.currencyCode} details`}
                    >
                      {country.currencyCode} ({country.currency})
                    </Link>
                  </div>

                  <div className="flex items-center gap-1.5 pt-1">
                    <span className="inline-flex items-center rounded-md bg-zinc-100 px-2 py-0.5 text-[10px] font-medium text-zinc-600 dark:bg-zinc-900 dark:text-zinc-400">
                      {country.region}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <Compass className="size-12 text-zinc-300 dark:text-zinc-700 mb-3" />
            <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
              No countries found
            </h3>
            <p className="mt-1 text-sm text-zinc-500 max-w-sm">
              We couldn&apos;t find any country matching &ldquo;{searchQuery}&rdquo;.
              Try another search or reset your filters.
            </p>
            <Button
              onClick={resetFilters}
              variant="outline"
              className="mt-4 rounded-xl cursor-pointer"
            >
              Reset Filters
            </Button>
          </div>
        )}
      </main>

      {/* Floating Bottom Menubar */}
      <BottomDock
        onSortChange={setSortOrder}
        onRegionChange={setSelectedRegion}
        onCurrencyFilter={setCurrencyFilter}
        currentSort={sortOrder}
        currentRegion={selectedRegion}
        currentCurrency={currencyFilter}
      />
    </div>
  );
}
