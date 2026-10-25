import { COUNTRIES, Country } from "./countries";
import { ALL_CURRENCIES } from "./currencies";

export interface DenominationItem {
  id: string;
  label: string;
  value: number;
  type: "cash" | "coin";
}

export interface CurrencyDenominationProfile {
  code: string;
  name: string;
  symbol: string;
  countryName?: string;
  flag?: string;
  cash: DenominationItem[];
  coins: DenominationItem[];
}

// Detailed authentic denominations for major/frequently used currencies
const CURRENCY_SPECIFIC_DENOMINATIONS: Record<
  string,
  {
    cashValues: number[];
    coinValues: number[];
    customCoinLabels?: Record<number, string>;
  }
> = {
  USD: {
    cashValues: [100, 50, 20, 10, 5, 2, 1],
    coinValues: [1, 0.5, 0.25, 0.1, 0.05, 0.01],
    customCoinLabels: {
      1: "$1 Dollar Coin",
      0.5: "50¢ Half Dollar",
      0.25: "25¢ Quarter",
      0.1: "10¢ Dime",
      0.05: "5¢ Nickel",
      0.01: "1¢ Penny",
    },
  },
  EUR: {
    cashValues: [200, 100, 50, 20, 10, 5],
    coinValues: [2, 1, 0.5, 0.2, 0.1, 0.05, 0.02, 0.01],
    customCoinLabels: {
      2: "€2 Coin",
      1: "€1 Coin",
      0.5: "50c",
      0.2: "20c",
      0.1: "10c",
      0.05: "5c",
      0.02: "2c",
      0.01: "1c",
    },
  },
  INR: {
    cashValues: [500, 200, 100, 50, 20, 10],
    coinValues: [20, 10, 5, 2, 1],
    customCoinLabels: {
      20: "₹20 Coin",
      10: "₹10 Coin",
      5: "₹5 Coin",
      2: "₹2 Coin",
      1: "₹1 Coin",
    },
  },
  GBP: {
    cashValues: [50, 20, 10, 5],
    coinValues: [2, 1, 0.5, 0.2, 0.1, 0.05, 0.02, 0.01],
    customCoinLabels: {
      2: "£2 Coin",
      1: "£1 Coin",
      0.5: "50p",
      0.2: "20p",
      0.1: "10p",
      0.05: "5p",
      0.02: "2p",
      0.01: "1p",
    },
  },
  JPY: {
    cashValues: [10000, 5000, 2000, 1000],
    coinValues: [500, 100, 50, 10, 5, 1],
  },
  CAD: {
    cashValues: [100, 50, 20, 10, 5],
    coinValues: [2, 1, 0.25, 0.1, 0.05],
    customCoinLabels: {
      2: "$2 Toonie",
      1: "$1 Loonie",
      0.25: "25¢ Quarter",
      0.1: "10¢ Dime",
      0.05: "5¢ Nickel",
    },
  },
  AUD: {
    cashValues: [100, 50, 20, 10, 5],
    coinValues: [2, 1, 0.5, 0.2, 0.1, 0.05],
    customCoinLabels: {
      2: "$2 Coin",
      1: "$1 Coin",
      0.5: "50¢ Coin",
      0.2: "20¢ Coin",
      0.1: "10¢ Coin",
      0.05: "5¢ Coin",
    },
  },
  CNY: {
    cashValues: [100, 50, 20, 10, 5, 1],
    coinValues: [1, 0.5, 0.1],
    customCoinLabels: {
      1: "¥1 Coin",
      0.5: "5 Jiao (0.50)",
      0.1: "1 Jiao (0.10)",
    },
  },
  CHF: {
    cashValues: [1000, 200, 100, 50, 20, 10],
    coinValues: [5, 2, 1, 0.5, 0.2, 0.1, 0.05],
  },
  BRL: {
    cashValues: [200, 100, 50, 20, 10, 5, 2],
    coinValues: [1, 0.5, 0.25, 0.1, 0.05],
  },
  RUB: {
    cashValues: [5000, 2000, 1000, 500, 200, 100, 50],
    coinValues: [10, 5, 2, 1],
  },
  KRW: {
    cashValues: [50000, 10000, 5000, 1000],
    coinValues: [500, 100, 50, 10],
  },
  MXN: {
    cashValues: [1000, 500, 200, 100, 50, 20],
    coinValues: [20, 10, 5, 2, 1, 0.5],
  },
  SGD: {
    cashValues: [1000, 100, 50, 10, 5, 2],
    coinValues: [1, 0.5, 0.2, 0.1, 0.05],
  },
  AED: {
    cashValues: [1000, 500, 200, 100, 50, 20, 10, 5],
    coinValues: [1, 0.5, 0.25],
  },
  SAR: {
    cashValues: [500, 200, 100, 50, 20, 10, 5],
    coinValues: [2, 1, 0.5, 0.25],
  },
  THB: {
    cashValues: [1000, 500, 100, 50, 20],
    coinValues: [10, 5, 2, 1, 0.5, 0.25],
  },
  IDR: {
    cashValues: [100000, 50000, 20000, 10000, 5000, 2000, 1000],
    coinValues: [1000, 500, 200, 100],
  },
  VND: {
    cashValues: [500000, 200000, 100000, 50000, 20000, 10000, 5000, 2000, 1000],
    coinValues: [5000, 2000, 1000, 500],
  },
  PKR: {
    cashValues: [5000, 1000, 500, 100, 50, 20, 10],
    coinValues: [10, 5, 2, 1],
  },
  BDT: {
    cashValues: [1000, 500, 200, 100, 50, 20, 10, 5, 2],
    coinValues: [5, 2, 1],
  },
  NGN: {
    cashValues: [1000, 500, 200, 100, 50, 20, 10, 5],
    coinValues: [2, 1, 0.5],
  },
  ZAR: {
    cashValues: [200, 100, 50, 20, 10],
    coinValues: [5, 2, 1, 0.5, 0.2, 0.1],
  },
  TRY: {
    cashValues: [200, 100, 50, 20, 10, 5],
    coinValues: [5, 1, 0.5, 0.25, 0.1, 0.05],
  },
  EGP: {
    cashValues: [200, 100, 50, 20, 10, 5],
    coinValues: [1, 0.5, 0.25],
  },
  PHP: {
    cashValues: [1000, 500, 200, 100, 50, 20],
    coinValues: [20, 10, 5, 1, 0.25],
  },
  SEK: {
    cashValues: [1000, 500, 200, 100, 50, 20],
    coinValues: [10, 5, 2, 1],
  },
  NOK: {
    cashValues: [1000, 500, 200, 100, 50],
    coinValues: [20, 10, 5, 1],
  },
  DKK: {
    cashValues: [1000, 500, 200, 100, 50],
    coinValues: [20, 10, 5, 2, 1, 0.5],
  },
  PLN: {
    cashValues: [500, 200, 100, 50, 20, 10],
    coinValues: [5, 2, 1, 0.5, 0.2, 0.1, 0.05, 0.02, 0.01],
  },
  NZD: {
    cashValues: [100, 50, 20, 10, 5],
    coinValues: [2, 1, 0.5, 0.2, 0.1],
  },
  XOF: {
    cashValues: [10000, 5000, 2000, 1000, 500],
    coinValues: [500, 250, 200, 100, 50, 25, 10, 5, 1],
  },
  XAF: {
    cashValues: [10000, 5000, 2000, 1000, 500],
    coinValues: [500, 100, 50, 25, 10, 5, 2, 1],
  },
};

/**
 * Automatically builds cash and coins denomination profiles for any currency or country.
 */
export function getDenominationsForCurrency(currencyCode: string): CurrencyDenominationProfile {
  const currencyInfo = ALL_CURRENCIES.find((c) => c.code === currencyCode);
  const country = COUNTRIES.find((c) => c.currencyCode === currencyCode);

  const code = currencyCode.toUpperCase();
  const name = currencyInfo ? currencyInfo.name : country?.currency || code;
  const symbol = currencyInfo ? currencyInfo.symbol : code;
  const flag = country?.flag || "🌐";
  const countryName = country?.name || currencyInfo?.countries[0]?.name || code;

  // 1. Check if we have an explicit profile defined
  const explicit = CURRENCY_SPECIFIC_DENOMINATIONS[code];
  if (explicit) {
    const cash: DenominationItem[] = explicit.cashValues.map((val) => ({
      id: `${code}-cash-${val}`,
      label: `${symbol}${val.toLocaleString()}`,
      value: val,
      type: "cash",
    }));

    const coins: DenominationItem[] = explicit.coinValues.map((val) => {
      const customLabel = explicit.customCoinLabels?.[val];
      return {
        id: `${code}-coin-${val}`,
        label: customLabel || `${symbol}${val}`,
        value: val,
        type: "coin",
      };
    });

    return {
      code,
      name,
      symbol,
      flag,
      countryName,
      cash,
      coins,
    };
  }

  // 2. Default high-precision 1-2-5 series for all other world currencies
  const defaultCash = [100, 50, 20, 10, 5].map((val) => ({
    id: `${code}-cash-${val}`,
    label: `${symbol}${val}`,
    value: val,
    type: "cash" as const,
  }));

  const defaultCoins = [2, 1, 0.5, 0.2, 0.1].map((val) => ({
    id: `${code}-coin-${val}`,
    label: `${symbol}${val}`,
    value: val,
    type: "coin" as const,
  }));

  return {
    code,
    name,
    symbol,
    flag,
    countryName,
    cash: defaultCash,
    coins: defaultCoins,
  };
}

export interface CurrencyOption {
  code: string;
  name: string;
  symbol: string;
  flag: string;
  countryName: string;
}

export function getAllCurrencyOptions(): CurrencyOption[] {
  // Combine all currencies with their primary country flag
  return ALL_CURRENCIES.map((cur) => {
    const primaryCountry = cur.countries[0];
    return {
      code: cur.code,
      name: cur.name,
      symbol: cur.symbol,
      flag: primaryCountry ? primaryCountry.flag : "🌐",
      countryName: primaryCountry ? primaryCountry.name : cur.name,
    };
  }).sort((a, b) => a.code.localeCompare(b.code));
}
