"use client";

import * as React from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ThemeToggle } from "@/components/theme-toggle";
import { SearchTriggerButton } from "@/components/search-trigger-button";
import { BottomDock } from "@/components/bottom-dock";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  getDenominationsForCurrency,
  getAllCurrencyOptions,
  DenominationItem,
} from "@/data/denominations";
import {
  Calculator,
  Coins,
  Banknote,
  RotateCcw,
  Copy,
  Check,
  ArrowLeft,
  Plus,
  Minus,
  Sparkles,
  Receipt,
  Search,
  Globe2,
} from "lucide-react";

const POPULAR_CURRENCIES = ["USD", "EUR", "INR", "GBP", "JPY", "CAD", "AUD", "AED", "CNY", "SAR"];

function CalculatorContent() {
  const searchParams = useSearchParams();
  const initialCurrency = searchParams.get("currency") || "USD";

  const [selectedCurrency, setSelectedCurrency] = React.useState<string>(
    initialCurrency.toUpperCase()
  );
  const [counts, setCounts] = React.useState<Record<string, number>>({});
  const [copied, setCopied] = React.useState(false);
  const [activeTab, setActiveTab] = React.useState<string>("cash");
  const [searchFilter, setSearchFilter] = React.useState("");

  const allCurrencyOptions = React.useMemo(() => getAllCurrencyOptions(), []);

  // Update currency when URL param changes
  React.useEffect(() => {
    const cur = searchParams.get("currency");
    if (cur) setSelectedCurrency(cur.toUpperCase());
  }, [searchParams]);

  // Get active currency profile with authentic cash and coin denominations
  const profile = React.useMemo(() => {
    return getDenominationsForCurrency(selectedCurrency);
  }, [selectedCurrency]);

  const updateCount = (id: string, delta: number) => {
    setCounts((prev) => {
      const current = prev[id] || 0;
      const next = Math.max(0, current + delta);
      return { ...prev, [id]: next };
    });
  };

  const setCountDirect = (id: string, value: string) => {
    const num = parseInt(value, 10);
    setCounts((prev) => ({
      ...prev,
      [id]: isNaN(num) ? 0 : Math.max(0, num),
    }));
  };

  const resetAll = () => {
    setCounts({});
  };

  const handleCurrencyChange = (newCode: string) => {
    setSelectedCurrency(newCode);
    setCounts({}); // Clear counts when switching currency denominations
  };

  // Calculations
  const cashSubtotal = React.useMemo(() => {
    return profile.cash.reduce((acc, item) => {
      const count = counts[item.id] || 0;
      return acc + count * item.value;
    }, 0);
  }, [profile, counts]);

  const cashPieces = React.useMemo(() => {
    return profile.cash.reduce((acc, item) => {
      return acc + (counts[item.id] || 0);
    }, 0);
  }, [profile, counts]);

  const coinsSubtotal = React.useMemo(() => {
    return profile.coins.reduce((acc, item) => {
      const count = counts[item.id] || 0;
      return acc + count * item.value;
    }, 0);
  }, [profile, counts]);

  const coinsPieces = React.useMemo(() => {
    return profile.coins.reduce((acc, item) => {
      return acc + (counts[item.id] || 0);
    }, 0);
  }, [profile, counts]);

  const grandTotal = cashSubtotal + coinsSubtotal;
  const totalPieces = cashPieces + coinsPieces;

  const formatCurrency = (val: number) => {
    return `${profile.symbol}${val.toLocaleString("en-US", {
      minimumFractionDigits: val % 1 === 0 ? 0 : 2,
      maximumFractionDigits: 2,
    })}`;
  };

  const copySummary = () => {
    let summary = `💰 ${profile.name} (${profile.code}) Cash & Coin Tally\n`;
    summary += `Country / Region: ${profile.countryName} ${profile.flag}\n`;
    summary += `------------------------------------\n`;
    summary += `Total Sum: ${formatCurrency(grandTotal)} (${totalPieces} pieces)\n`;
    summary += `💵 Cash Notes: ${formatCurrency(cashSubtotal)} (${cashPieces} notes)\n`;
    profile.cash.forEach((item) => {
      const count = counts[item.id] || 0;
      if (count > 0) {
        summary += `  ${item.label} × ${count} = ${formatCurrency(count * item.value)}\n`;
      }
    });
    summary += `🪙 Coins: ${formatCurrency(coinsSubtotal)} (${coinsPieces} coins)\n`;
    profile.coins.forEach((item) => {
      const count = counts[item.id] || 0;
      if (count > 0) {
        summary += `  ${item.label} × ${count} = ${formatCurrency(count * item.value)}\n`;
      }
    });
    summary += `------------------------------------\nCalculated via Atlastic`;

    navigator.clipboard.writeText(summary);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const renderRow = (item: DenominationItem) => {
    const count = counts[item.id] || 0;
    const rowTotal = count * item.value;
    const isCash = item.type === "cash";

    return (
      <div
        key={item.id}
        className={`group flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl border transition-all duration-200 ${
          count > 0
            ? "border-primary/40 bg-primary/[0.02] shadow-xs dark:border-primary/30 dark:bg-primary/[0.04]"
            : "border-zinc-200/80 bg-white hover:border-zinc-300 dark:border-zinc-800 dark:bg-zinc-950 dark:hover:border-zinc-700"
        }`}
      >
        {/* Left: Denomination Info */}
        <div className="flex items-center gap-3 min-w-[170px]">
          <div
            className={`flex size-11 items-center justify-center rounded-xl font-bold text-sm shadow-2xs select-none ${
              isCash
                ? "bg-emerald-500/10 text-emerald-600 dark:bg-emerald-400/15 dark:text-emerald-400 border border-emerald-500/20"
                : "bg-amber-500/10 text-amber-600 dark:bg-amber-400/15 dark:text-amber-400 border border-amber-500/20"
            }`}
          >
            {isCash ? <Banknote className="size-5" /> : <Coins className="size-5" />}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-base tracking-tight text-zinc-900 dark:text-zinc-50">
                {item.label}
              </span>
              <span className="text-[11px] text-zinc-400 font-mono">
                ({profile.symbol}{item.value})
              </span>
            </div>
            <span className="text-xs text-zinc-500 dark:text-zinc-400">
              {isCash ? `${profile.code} Banknote` : `${profile.code} Coin`}
            </span>
          </div>
        </div>

        {/* Center: Stepper Controls */}
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => updateCount(item.id, -1)}
            disabled={count === 0}
            className="size-8 rounded-lg cursor-pointer"
            aria-label="Decrease count"
          >
            <Minus className="size-3.5" />
          </Button>

          <Input
            type="number"
            min="0"
            value={count === 0 ? "" : count}
            placeholder="0"
            onChange={(e) => setCountDirect(item.id, e.target.value)}
            className="w-20 h-9 rounded-lg text-center font-bold text-base bg-white dark:bg-zinc-900"
          />

          <Button
            variant="outline"
            size="icon"
            onClick={() => updateCount(item.id, 1)}
            className="size-8 rounded-lg cursor-pointer"
            aria-label="Increase count"
          >
            <Plus className="size-3.5" />
          </Button>

          {/* Quick Increment Adders */}
          <div className="hidden md:flex items-center gap-1 ml-1">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => updateCount(item.id, 5)}
              className="h-8 px-2 text-xs rounded-lg cursor-pointer"
            >
              +5
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => updateCount(item.id, 10)}
              className="h-8 px-2 text-xs rounded-lg cursor-pointer"
            >
              +10
            </Button>
          </div>
        </div>

        {/* Right: Calculated Row Total */}
        <div className="flex items-center justify-between sm:justify-end gap-3 min-w-[150px] pt-2 sm:pt-0 border-t sm:border-t-0 border-zinc-100 dark:border-zinc-900">
          <span className="text-xs text-zinc-400 sm:hidden">Row Total:</span>
          <div className="text-right">
            <span
              className={`font-mono text-base font-bold tracking-tight block ${
                count > 0
                  ? "text-zinc-900 dark:text-zinc-50"
                  : "text-zinc-400 dark:text-zinc-600"
              }`}
            >
              {formatCurrency(rowTotal)}
            </span>
            <span className="text-[10px] text-zinc-400 font-mono block">
              {count} × {profile.symbol}{item.value}
            </span>
          </div>
        </div>
      </div>
    );
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
              <div className="flex size-9 items-center justify-center rounded-xl bg-primary/10 text-primary shadow-xs">
                <Calculator className="size-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-lg tracking-tight">Money Calculator</span>
                  <Badge variant="secondary" className="text-[11px] font-medium">
                    {profile.code} • {profile.countryName} {profile.flag}
                  </Badge>
                </div>
                <p className="text-[11px] text-zinc-500 dark:text-zinc-400 hidden sm:block">
                  Automatic cash notes & coins denomination counter
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/currencies"
              className="hidden sm:inline-flex items-center gap-1.5 text-xs font-medium text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
            >
              <Coins className="size-3.5" />
              World Currencies
            </Link>
            <SearchTriggerButton />
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="mx-auto flex-1 w-full max-w-4xl px-4 py-6 sm:px-6 pb-36">
        {/* CURRENCY & COUNTRY SELECTOR BAR */}
        <div className="mb-6 flex flex-col gap-3 rounded-2xl border border-zinc-200/80 bg-zinc-50/70 p-4 dark:border-zinc-800 dark:bg-zinc-900/50">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="text-2xl select-none">{profile.flag}</span>
              <div>
                <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 block">
                  Active Currency & Denominations
                </span>
                <span className="font-bold text-base text-zinc-900 dark:text-zinc-100">
                  {profile.name} ({profile.code}) — {profile.symbol}
                </span>
              </div>
            </div>

            {/* Dropdown to select any world currency / country */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-zinc-500 dark:text-zinc-400 whitespace-nowrap">
                Change Currency:
              </span>
              <select
                value={selectedCurrency}
                onChange={(e) => handleCurrencyChange(e.target.value)}
                aria-label="Select currency"
                className="h-10 rounded-xl border border-zinc-300 bg-white px-3 text-xs sm:text-sm font-medium text-zinc-900 shadow-xs focus:border-primary focus:outline-hidden dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100 cursor-pointer min-w-[180px]"
              >
                {allCurrencyOptions.map((opt) => (
                  <option key={opt.code} value={opt.code}>
                    {opt.flag} {opt.code} - {opt.name} ({opt.countryName})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Quick Popular Currency Selector Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pt-2 border-t border-zinc-200/50 dark:border-zinc-800/60 scrollbar-none">
            <span className="text-[11px] text-zinc-400 font-medium whitespace-nowrap mr-1">
              Popular:
            </span>
            {POPULAR_CURRENCIES.map((code) => {
              const opt = allCurrencyOptions.find((c) => c.code === code);
              const isActive = selectedCurrency === code;
              return (
                <button
                  key={code}
                  onClick={() => handleCurrencyChange(code)}
                  className={`flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
                    isActive
                      ? "bg-zinc-900 text-white shadow-xs dark:bg-white dark:text-black"
                      : "bg-white text-zinc-700 hover:bg-zinc-200/80 border border-zinc-200/80 dark:bg-zinc-950 dark:text-zinc-300 dark:border-zinc-800 dark:hover:bg-zinc-800"
                  }`}
                >
                  <span>{opt?.flag}</span>
                  <span>{code}</span>
                  <span className="text-[10px] opacity-70">({opt?.symbol})</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* TOP SUMMARY CARD (AUTOMATIC TOTAL SUM ACCUMULATION) */}
        <div className="relative overflow-hidden mb-8 rounded-3xl border border-zinc-200/80 bg-gradient-to-br from-zinc-50 via-white to-zinc-50 p-6 sm:p-8 shadow-sm dark:border-zinc-800 dark:from-zinc-900/80 dark:via-zinc-950 dark:to-zinc-900/60">
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-primary mb-1">
                <Sparkles className="size-3.5" />
                <span>Total Accumulated Sum ({profile.code})</span>
              </div>

              {/* Large Grand Total Display */}
              <div className="font-mono text-4xl sm:text-5xl font-extrabold tracking-tight text-zinc-950 dark:text-zinc-50">
                {formatCurrency(grandTotal)}
              </div>

              <p className="mt-1.5 text-xs text-zinc-500 dark:text-zinc-400">
                Total pieces tallied: <strong className="text-zinc-900 dark:text-zinc-100">{totalPieces}</strong> ({cashPieces} notes, {coinsPieces} coins)
              </p>
            </div>

            {/* Subtotal Mini Cards */}
            <div className="flex items-center gap-3 flex-wrap">
              <div className="flex-1 min-w-[130px] rounded-2xl bg-white/80 p-3.5 border border-zinc-200/60 shadow-xs dark:bg-zinc-900/80 dark:border-zinc-800">
                <div className="flex items-center gap-1.5 text-xs font-medium text-emerald-600 dark:text-emerald-400 mb-0.5">
                  <Banknote className="size-3.5" />
                  <span>Cash Notes Sum</span>
                </div>
                <div className="font-mono text-lg font-bold text-zinc-900 dark:text-zinc-50">
                  {formatCurrency(cashSubtotal)}
                </div>
                <span className="text-[10px] text-zinc-400 font-mono">
                  {cashPieces} notes
                </span>
              </div>

              <div className="flex-1 min-w-[130px] rounded-2xl bg-white/80 p-3.5 border border-zinc-200/60 shadow-xs dark:bg-zinc-900/80 dark:border-zinc-800">
                <div className="flex items-center gap-1.5 text-xs font-medium text-amber-600 dark:text-amber-400 mb-0.5">
                  <Coins className="size-3.5" />
                  <span>Coins Sum</span>
                </div>
                <div className="font-mono text-lg font-bold text-zinc-900 dark:text-zinc-50">
                  {formatCurrency(coinsSubtotal)}
                </div>
                <span className="text-[10px] text-zinc-400 font-mono">
                  {coinsPieces} coins
                </span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="relative z-10 flex items-center justify-between gap-3 mt-6 pt-5 border-t border-zinc-200/60 dark:border-zinc-800/80">
            <Button
              variant="outline"
              size="sm"
              onClick={resetAll}
              disabled={grandTotal === 0}
              className="gap-1.5 rounded-xl cursor-pointer text-xs"
            >
              <RotateCcw className="size-3.5" />
              Reset All Rows
            </Button>

            <Button
              variant="secondary"
              size="sm"
              onClick={copySummary}
              disabled={grandTotal === 0}
              className="gap-1.5 rounded-xl cursor-pointer text-xs"
            >
              {copied ? (
                <>
                  <Check className="size-3.5 text-emerald-500" />
                  Copied Breakdown!
                </>
              ) : (
                <>
                  <Copy className="size-3.5" />
                  Copy Breakdown
                </>
              )}
            </Button>
          </div>
        </div>

        {/* TABS FOR CASH AND COINS SECTION */}
        <Tabs
          value={activeTab}
          onValueChange={(val) => setActiveTab(val as string)}
          className="w-full"
        >
          <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
            <TabsList className="bg-zinc-100 p-1 rounded-2xl dark:bg-zinc-900 h-11">
              <TabsTrigger
                value="cash"
                className="gap-2 px-4 py-2 rounded-xl text-xs font-semibold cursor-pointer data-active:bg-white data-active:text-zinc-950 data-active:shadow-xs dark:data-active:bg-zinc-800 dark:data-active:text-zinc-50"
              >
                <Banknote className="size-4 text-emerald-500" />
                <span>Cash & Notes ({profile.cash.length})</span>
                {cashSubtotal > 0 && (
                  <Badge variant="secondary" className="ml-1 text-[10px] px-1.5 py-0 h-4">
                    {formatCurrency(cashSubtotal)}
                  </Badge>
                )}
              </TabsTrigger>

              <TabsTrigger
                value="coins"
                className="gap-2 px-4 py-2 rounded-xl text-xs font-semibold cursor-pointer data-active:bg-white data-active:text-zinc-950 data-active:shadow-xs dark:data-active:bg-zinc-800 dark:data-active:text-zinc-50"
              >
                <Coins className="size-4 text-amber-500" />
                <span>Coins ({profile.coins.length})</span>
                {coinsSubtotal > 0 && (
                  <Badge variant="secondary" className="ml-1 text-[10px] px-1.5 py-0 h-4">
                    {formatCurrency(coinsSubtotal)}
                  </Badge>
                )}
              </TabsTrigger>

              <TabsTrigger
                value="all"
                className="gap-2 px-4 py-2 rounded-xl text-xs font-semibold cursor-pointer data-active:bg-white data-active:text-zinc-950 data-active:shadow-xs dark:data-active:bg-zinc-800 dark:data-active:text-zinc-50"
              >
                <Receipt className="size-4" />
                <span>All Combined</span>
              </TabsTrigger>
            </TabsList>

            <span className="text-xs text-zinc-500 dark:text-zinc-400">
              Showing active denominations for: <strong className="text-zinc-900 dark:text-zinc-100">{profile.countryName}</strong>
            </span>
          </div>

          {/* Cash Tab Content */}
          <TabsContent value="cash" className="mt-0">
            <div className="space-y-3">
              {profile.cash.map(renderRow)}
            </div>
          </TabsContent>

          {/* Coins Tab Content */}
          <TabsContent value="coins" className="mt-0">
            <div className="space-y-3">
              {profile.coins.map(renderRow)}
            </div>
          </TabsContent>

          {/* All Combined Tab Content */}
          <TabsContent value="all" className="mt-0 space-y-6">
            <div>
              <h3 className="flex items-center gap-2 text-sm font-semibold text-zinc-500 dark:text-zinc-400 mb-3 uppercase tracking-wider">
                <Banknote className="size-4 text-emerald-500" />
                {profile.code} Banknotes
              </h3>
              <div className="space-y-3">
                {profile.cash.map(renderRow)}
              </div>
            </div>

            <div className="pt-4 border-t border-zinc-100 dark:border-zinc-900">
              <h3 className="flex items-center gap-2 text-sm font-semibold text-zinc-500 dark:text-zinc-400 mb-3 uppercase tracking-wider">
                <Coins className="size-4 text-amber-500" />
                {profile.code} Coins
              </h3>
              <div className="space-y-3">
                {profile.coins.map(renderRow)}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </main>

      {/* Floating Bottom Menubar */}
      <BottomDock />
    </div>
  );
}

export default function CalculatorPage() {
  return (
    <React.Suspense fallback={<div className="min-h-screen bg-white dark:bg-black" />}>
      <CalculatorContent />
    </React.Suspense>
  );
}
