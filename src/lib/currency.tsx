"use client";

import { createContext, useContext, useState, useEffect, useCallback } from "react";

export type Currency = "PHP" | "USD";

const SYMBOLS: Record<Currency, string> = {
  PHP: "₱",
  USD: "$",
};

interface CurrencyContextValue {
  currency: Currency;
  setCurrency: (c: Currency) => void;
  symbol: string;
  fmt: (amount: number) => string;
}

const CurrencyContext = createContext<CurrencyContextValue>({
  currency: "PHP",
  setCurrency: () => {},
  symbol: "₱",
  fmt: (n) => `₱${n.toLocaleString()}`,
});

export function CurrencyProvider({ children }: { children: React.ReactNode }) {
  const [currency, setCurrencyState] = useState<Currency>(() => {
    if (typeof window === "undefined") return "PHP";
    return (localStorage.getItem("currency") as Currency) || "PHP";
  });

  useEffect(() => {
    localStorage.setItem("currency", currency);
  }, [currency]);

  const setCurrency = useCallback((c: Currency) => setCurrencyState(c), []);

  const symbol = SYMBOLS[currency];

  const fmt = useCallback(
    (amount: number) => `${SYMBOLS[currency]}${amount.toLocaleString()}`,
    [currency]
  );

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency, symbol, fmt }}>
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  return useContext(CurrencyContext);
}
