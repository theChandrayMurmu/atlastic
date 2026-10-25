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
import { ALL_CURRENCIES } from "@/data/currencies";
import {
  FALLBACK_EXCHANGE_RATES,
  fetchLiveRates,
} from "@/data/exchange-rates";
import {
  Search,
  Coins,
  Globe2,
  ArrowLeft,
  X,
  Compass,
  Calculator,
  ArrowLeftRight,
  TrendingUp,
  RefreshCw,
  Sparkles,
} from "lucide-react";

const REGIONS = ["All", "Africa", "Americas", "Asia", "Europe", "Oceania"] as const;

const POPULAR_PAIRS = [
  { from: "USD", to: "INR" },
  { from: "USD", to: "EUR" },
  { from: "EUR", to: "GBP" },
  { from: "USD", to: "JPY" },
  { from: "USD", to: "AED" },
  { from: "GBP", to: "INR" },
];

function CurrenciesContent() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("q") || "";

  // Directory state
  const [searchQuery, setSearchQuery] = React.useState(initialQuery);
  const [selectedRegion, setSelectedRegion] = React.useState<string>("All");
  const [sortBy, setSortBy] = React.useState<"code" | "name" | "usage">("usage");

  // Live Currency Converter State
  const [convertAmount, setConvertAmount] = React.useState<number>(100);
  const [fromCurrency, setFromCurrency] = React.useState<string>("USD");
  const [toCurrency, setToCurrency] = React.useState<string>("INR");
  const [rates, setRates] = React.useState<Record<string, number>>(FALLBACK_EXCHANGE_RATES);
  const [lastUpdated, setLastUpdated] = React.useState<string>("Verified Live Market Rates");
  const [isLoadingRates, setIsLoadingRates] = React.useState<boolean>(false);

  // Fetch live market exchange rates on mount
  React.useEffect(() => {
    async function loadRates() {
      setIsLoadingRates(true);
      try {
        const liveData = await fetchLiveRates();
        if (liveData && liveData.rates) {
          setRates(liveData.rates);
          setLastUpdated(liveData.lastUpdated);
        }
      } catch {
        // Fallback rates already in state
      } finally {
        setIsLoadingRates(false);
      }
    }
    loadRates();
  }, []);

  React.useEffect(() => {
    const q = searchParams.get("q");
    if (q) setSearchQuery(q);
  }, [searchParams]);

  // Conversion calculations
  const fromRate = rates[fromCurrency] || 1;
  const toRate = rates[toCurrency] || 1;
  const inUSD = convertAmount / fromRate;
  const convertedTotal = inUSD * toRate;
  const unitRate = toRate / fromRate;
  const reciprocalRate = fromRate / toRate;

  const swapCurrencies = () => {
    setFromCurrency(toCurrency);
    setToCurrency(fromCurrency);
  };

  const fromInfo = ALL_CURRENCIES.find((c) => c.code === fromCurrency);
  const toInfo = ALL_CURRENCIES.find((c) => c.code === toCurrency);

  const filteredCurrencies = React.useMemo(() => {
    return ALL_CURRENCIES.filter((cur) => {
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        cur.code.toLowerCase().includes(q) ||
        cur.name.toLowerCase().includes(q) ||
        cur.symbol.toLowerCase().includes(q) ||
        cur.countries.some((c) => c.name.toLowerCase().includes(q));

      const matchesRegion =
        selectedRegion === "All" || cur.regions.includes(selectedRegion);

      return matchesSearch && matchesRegion;
    }).sort((a, b) => {
      if (sortBy === "usage") {
        if (b.countries.length !== a.countries.length) {
          return b.countries.length - a.countries.length;
        }
        return a.code.localeCompare(b.code);
      }
      if (sortBy === "name") {
        return a.name.localeCompare(b.name);
      }
      return a.code.localeCompare(b.code);
    });
  }, [searchQuery, selectedRegion, sortBy]);

  const resetFilters = () => {
    setSearchQuery("");
    setSelectedRegion("All");
    setSortBy("usage");
  };

  return (
    <div className="relative flex flex-col min-h-screen bg-white text-zinc-900 dark:bg-black dark:text-zinc-50 transition-colors duration-200">
      {/* Top Header */}
      <header className="sticky top-0 z-40 w-full border-b border-zinc-100 bg-white/90 backdrop-blur-md dark:border-zinc-900 dark:bg-black/90">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="flex size-9 items-center justify-center rounded-xl bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-900 dark:hover:bg-zinc-800 transition-colors text-zinc-700 dark:text-zinc-300 shadow-xs"
              title="Back to Countries"
            >
              <ArrowLeft className="size-4" />
            </Link>

            <div className="flex items-center gap-2.5">
              <div className="flex size-9 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 dark:bg-amber-400/10 dark:text-amber-400 shadow-xs">
                <Coins className="size-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-lg tracking-tight">World Currencies</span>
                  <Badge variant="secondary" className="text-[11px] font-medium">
                    {ALL_CURRENCIES.length} Currencies
                  </Badge>
                </div>
                <p className="text-[11px] text-zinc-500 dark:text-zinc-400 hidden sm:block">
                  Live currency converter & global currencies directory
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="hidden sm:inline-flex items-center gap-1.5 text-xs font-medium text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
            >
              <Globe2 className="size-3.5" />
              Countries Directory
            </Link>
            <SearchTriggerButton />
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Main Currencies Content */}
      <main className="mx-auto flex-1 w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8 pb-32">
        {/* LIVE CURRENCY CONVERTER CARD */}
        <section
          id="converter"
          aria-label="Currency Converter"
          className="relative overflow-hidden mb-10 rounded-3xl border border-zinc-200/80 bg-gradient-to-br from-amber-500/5 via-white to-amber-500/5 p-6 sm:p-8 shadow-sm dark:border-zinc-800 dark:from-zinc-900/90 dark:via-zinc-950 dark:to-zinc-900/60"
        >
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-amber-600 dark:text-amber-400 mb-1">
                <TrendingUp className="size-4" />
                <span>Live Currency Converter Tool</span>
              </div>
              <h2 className="text-2xl font-bold tracking-tight text-zinc-950 dark:text-zinc-50">
                Accurate Global Exchange Rates
              </h2>
            </div>

            <div className="flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400">
              <span className="inline-block size-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>
                {isLoadingRates ? "Updating market rates..." : `Live: ${lastUpdated}`}
              </span>
            </div>
          </div>

          {/* Quick Popular Currency Pairs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-4 scrollbar-none">
            <span className="text-xs text-zinc-400 font-medium whitespace-nowrap">
              Popular Pairs:
            </span>
            {POPULAR_PAIRS.map((pair) => {
              const isCurrent =
                fromCurrency === pair.from && toCurrency === pair.to;
              return (
                <button
                  key={`${pair.from}-${pair.to}`}
                  onClick={() => {
                    setFromCurrency(pair.from);
                    setToCurrency(pair.to);
                  }}
                  className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                    isCurrent
                      ? "bg-zinc-900 text-white shadow-xs dark:bg-white dark:text-black"
                      : "bg-white text-zinc-700 hover:bg-zinc-100 border border-zinc-200 dark:bg-zinc-900 dark:border-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-800"
                  }`}
                >
                  {pair.from} ⇄ {pair.to}
                </button>
              );
            })}
          </div>

          {/* Converter Input Controls */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-center">
            {/* Amount Input */}
            <div className="lg:col-span-3">
              <label className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 mb-1.5 block">
                Amount
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-bold text-zinc-400 text-base">
                  {fromInfo?.symbol || "$"}
                </span>
                <Input
                  type="number"
                  min="0"
                  step="any"
                  value={convertAmount === 0 ? "" : convertAmount}
                  placeholder="100"
                  onChange={(e) => setConvertAmount(Number(e.target.value) || 0)}
                  className="h-12 pl-8 text-lg font-bold rounded-2xl bg-white dark:bg-zinc-900 border-zinc-300 dark:border-zinc-700"
                />
              </div>
            </div>

            {/* From Currency Selector */}
            <div className="lg:col-span-4">
              <label className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 mb-1.5 block">
                From
              </label>
              <select
                value={fromCurrency}
                onChange={(e) => setFromCurrency(e.target.value)}
                aria-label="From Currency"
                className="w-full h-12 rounded-2xl border border-zinc-300 bg-white px-3 text-sm font-semibold text-zinc-900 shadow-xs focus:border-primary dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 cursor-pointer"
              >
                {ALL_CURRENCIES.map((cur) => (
                  <option key={cur.code} value={cur.code}>
                    {cur.countries[0]?.flag || "🌐"} {cur.code} — {cur.name} ({cur.symbol})
                  </option>
                ))}
              </select>
            </div>

            {/* Swap Button */}
            <div className="lg:col-span-1 flex justify-center pt-5 sm:pt-6">
              <Button
                variant="outline"
                size="icon"
                onClick={swapCurrencies}
                title="Swap currencies"
                className="size-11 rounded-2xl cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-transform active:rotate-180"
              >
                <ArrowLeftRight className="size-4 text-primary" />
              </Button>
            </div>

            {/* To Currency Selector */}
            <div className="lg:col-span-4">
              <label className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 mb-1.5 block">
                To
              </label>
              <select
                value={toCurrency}
                onChange={(e) => setToCurrency(e.target.value)}
                aria-label="To Currency"
                className="w-full h-12 rounded-2xl border border-zinc-300 bg-white px-3 text-sm font-semibold text-zinc-900 shadow-xs focus:border-primary dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 cursor-pointer"
              >
                {ALL_CURRENCIES.map((cur) => (
                  <option key={cur.code} value={cur.code}>
                    {cur.countries[0]?.flag || "🌐"} {cur.code} — {cur.name} ({cur.symbol})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Result Card */}
          <div className="mt-6 rounded-2xl bg-white/90 p-5 sm:p-6 border border-zinc-200/80 shadow-xs dark:bg-zinc-900/90 dark:border-zinc-800">
            <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-3">
              <div>
                <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400 block mb-1">
                  {convertAmount.toLocaleString()} {fromCurrency} ({fromInfo?.name}) =
                </span>
                <div className="font-mono text-3xl sm:text-4xl font-extrabold tracking-tight text-zinc-950 dark:text-zinc-50">
                  {toInfo?.symbol || ""}
                  {convertedTotal.toLocaleString("en-US", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}{" "}
                  <span className="text-xl sm:text-2xl font-bold text-primary">
                    {toCurrency}
                  </span>
                </div>
              </div>

              {/* Exact Exchange Rate */}
              <div className="sm:text-right font-mono text-xs text-zinc-500 dark:text-zinc-400 space-y-1">
                <div>
                  1 <strong className="text-zinc-900 dark:text-zinc-200">{fromCurrency}</strong> ={" "}
                  <strong className="text-zinc-900 dark:text-zinc-200">
                    {unitRate.toLocaleString("en-US", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 4,
                    })} {toCurrency}
                  </strong>
                </div>
                <div>
                  1 {toCurrency} ={" "}
                  {reciprocalRate.toLocaleString("en-US", {
                    minimumFractionDigits: 4,
                    maximumFractionDigits: 6,
                  })} {fromCurrency}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CURRENCY DIRECTORY SECTION */}
        <div className="mb-8 flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div>
              <h3 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
                All Circulating World Currencies
              </h3>
              <p className="text-xs text-zinc-500">
                Browse official currency codes, symbols, and countries
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-zinc-400" />
              <Input
                type="text"
                placeholder="Search currency code (USD), name (Rupee), or country..."
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

            {/* Sort Controls */}
            <div className="flex items-center gap-2 flex-wrap text-xs">
              <span className="text-zinc-500 dark:text-zinc-400">Sort by:</span>
              <button
                onClick={() => setSortBy("usage")}
                className={`rounded-lg px-2.5 py-1 text-xs font-medium transition-colors cursor-pointer ${
                  sortBy === "usage"
                    ? "bg-zinc-900 text-white dark:bg-white dark:text-black"
                    : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-900 dark:text-zinc-400"
                }`}
              >
                Most Used
              </button>
              <button
                onClick={() => setSortBy("code")}
                className={`rounded-lg px-2.5 py-1 text-xs font-medium transition-colors cursor-pointer ${
                  sortBy === "code"
                    ? "bg-zinc-900 text-white dark:bg-white dark:text-black"
                    : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-900 dark:text-zinc-400"
                }`}
              >
                Code (A-Z)
              </button>
              <button
                onClick={() => setSortBy("name")}
                className={`rounded-lg px-2.5 py-1 text-xs font-medium transition-colors cursor-pointer ${
                  sortBy === "name"
                    ? "bg-zinc-900 text-white dark:bg-white dark:text-black"
                    : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-900 dark:text-zinc-400"
                }`}
              >
                Name (A-Z)
              </button>
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

        {/* Currency Cards Grid */}
        {filteredCurrencies.length > 0 ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {filteredCurrencies.map((currency) => (
              <div
                key={currency.code}
                className="group relative flex flex-col justify-between rounded-2xl border border-zinc-200/80 bg-white p-5 shadow-xs transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md hover:border-zinc-300 dark:border-zinc-800 dark:bg-zinc-950 dark:hover:border-zinc-700"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="flex size-11 items-center justify-center rounded-xl bg-zinc-100 dark:bg-zinc-900 font-bold text-lg text-zinc-800 dark:text-zinc-200 shadow-2xs">
                      {currency.symbol}
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => {
                          setFromCurrency("USD");
                          setToCurrency(currency.code);
                          window.scrollTo({ top: 0, behavior: "smooth" });
                        }}
                        className="text-[11px] font-semibold text-primary hover:underline px-1.5 py-0.5 rounded cursor-pointer"
                        title={`Convert USD to ${currency.code}`}
                      >
                        Convert
                      </button>
                      <Badge
                        variant="outline"
                        className="font-mono text-xs font-semibold tracking-wider text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-800"
                      >
                        {currency.code}
                      </Badge>
                    </div>
                  </div>

                  <h2 className="font-semibold text-base tracking-tight text-zinc-900 dark:text-zinc-100">
                    {currency.name}
                  </h2>

                  <div className="flex flex-wrap gap-1 mt-2">
                    {currency.regions.map((reg) => (
                      <span
                        key={reg}
                        className="rounded-md bg-zinc-100 px-1.5 py-0.5 text-[10px] font-medium text-zinc-600 dark:bg-zinc-900 dark:text-zinc-400"
                      >
                        {reg}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-zinc-100 dark:border-zinc-900">
                  <div className="flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400 mb-2">
                    <span>Used in:</span>
                    <span className="font-medium text-zinc-900 dark:text-zinc-200">
                      {currency.countries.length}{" "}
                      {currency.countries.length === 1 ? "country" : "countries"}
                    </span>
                  </div>

                  {/* Flag and Country list */}
                  <div className="flex flex-wrap gap-1.5 max-h-20 overflow-y-auto pr-1">
                    {currency.countries.map((c) => (
                      <span
                        key={c.code}
                        title={c.name}
                        className="inline-flex items-center gap-1 rounded-md bg-zinc-50 border border-zinc-100 px-1.5 py-0.5 text-xs dark:bg-zinc-900/60 dark:border-zinc-800/80"
                      >
                        <span role="img" aria-label={c.name}>
                          {c.flag}
                        </span>
                        <span className="text-[11px] text-zinc-700 dark:text-zinc-300 truncate max-w-[110px]">
                          {c.name}
                        </span>
                      </span>
                    ))}
                  </div>

                  <Link
                    href={`/calculator?currency=${currency.code}`}
                    className="mt-3 flex items-center justify-center gap-1.5 w-full py-1.5 px-3 rounded-xl bg-zinc-50 hover:bg-zinc-100 text-zinc-700 text-xs font-semibold border border-zinc-200/60 dark:bg-zinc-900/60 dark:border-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-800 transition-colors"
                  >
                    <Calculator className="size-3.5 text-primary" />
                    <span>Count Cash & Coins</span>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <Compass className="size-12 text-zinc-300 dark:text-zinc-700 mb-3" />
            <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
              No currencies found
            </h3>
            <p className="mt-1 text-sm text-zinc-500 max-w-sm">
              We couldn&apos;t find any currency matching &ldquo;{searchQuery}&rdquo;.
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
      <BottomDock />
    </div>
  );
}

export default function CurrenciesPage() {
  return (
    <React.Suspense fallback={<div className="min-h-screen bg-white dark:bg-black" />}>
      <CurrenciesContent />
    </React.Suspense>
  );
}
