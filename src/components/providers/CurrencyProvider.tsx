"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import {
  buildFallbackRates,
  formatCurrencyValue,
  type CurrencyCode,
  type LiveRateEntry,
  type LiveRatesPayload,
} from "@/lib/utils/currency";

type CurrencyContextValue = {
  currency: CurrencyCode;
  setCurrency: (code: CurrencyCode) => void;
  formatMoney: (nominalIdr: number | bigint) => string;
  ratesPayload: LiveRatesPayload;
  activeRate: LiveRateEntry;
  isRefreshing: boolean;
  refreshRates: () => Promise<void>;
};

const defaultPayload = buildFallbackRates();

const CurrencyContext = createContext<CurrencyContextValue>({
  currency: "IDR",
  setCurrency: () => {},
  formatMoney: (nominalIdr) => formatCurrencyValue(nominalIdr, "IDR"),
  ratesPayload: defaultPayload,
  activeRate: defaultPayload.rates.IDR,
  isRefreshing: false,
  refreshRates: async () => {},
});

export function CurrencyProvider({
  initialCurrency,
  children,
}: {
  initialCurrency: CurrencyCode;
  children: ReactNode;
}) {
  const [currency, setCurrencyState] = useState<CurrencyCode>(initialCurrency);
  const [ratesPayload, setRatesPayload] = useState<LiveRatesPayload>(defaultPayload);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const refreshRates = useCallback(async () => {
    setIsRefreshing(true);
    try {
      const res = await fetch("/api/exchange-rates", { cache: "no-store" });
      if (res.ok) {
        const data = (await res.json()) as LiveRatesPayload;
        if (data?.rates) {
          setRatesPayload(data);
        }
      }
    } catch {
      // Keep existing rates if offline
    } finally {
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    refreshRates();
    const interval = setInterval(refreshRates, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [refreshRates]);

  const setCurrency = useCallback((code: CurrencyCode) => {
    setCurrencyState(code);
  }, []);

  const activeRate = ratesPayload.rates[currency] ?? defaultPayload.rates[currency];

  const formatMoney = useCallback(
    (nominalIdr: number | bigint) =>
      formatCurrencyValue(nominalIdr, currency, activeRate?.rateFromIdr),
    [currency, activeRate],
  );

  return (
    <CurrencyContext.Provider
      value={{
        currency,
        setCurrency,
        formatMoney,
        ratesPayload,
        activeRate,
        isRefreshing,
        refreshRates,
      }}
    >
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  return useContext(CurrencyContext);
}
