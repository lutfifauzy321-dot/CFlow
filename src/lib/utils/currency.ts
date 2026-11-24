export type CurrencyCode =
  | "IDR"
  | "USD"
  | "SGD"
  | "MYR"
  | "EUR"
  | "JPY"
  | "AUD"
  | "GBP";

export type CurrencyInfo = {
  code: CurrencyCode;
  name: string;
  symbol: string;
  locale: string;
  rateFromIdr: number;
  decimals: number;
};

export type RateTrend = "up" | "down" | "flat";

export type LiveRateEntry = {
  code: CurrencyCode;
  rateFromIdr: number;
  idrPerUnit: number;
  previousIdrPerUnit: number;
  changePercent: number;
  trend: RateTrend;
};

export type LiveRatesPayload = {
  isLive: boolean;
  source: string;
  date: string;
  updatedAt: string;
  rates: Record<CurrencyCode, LiveRateEntry>;
};

export const CURRENCIES: Record<CurrencyCode, CurrencyInfo> = {
  IDR: {
    code: "IDR",
    name: "Rupiah Indonesia",
    symbol: "Rp",
    locale: "id-ID",
    rateFromIdr: 1,
    decimals: 0,
  },
  USD: {
    code: "USD",
    name: "Dolar Amerika Serikat",
    symbol: "$",
    locale: "en-US",
    rateFromIdr: 1 / 16000,
    decimals: 2,
  },
  SGD: {
    code: "SGD",
    name: "Dolar Singapura",
    symbol: "S$",
    locale: "en-SG",
    rateFromIdr: 1 / 12000,
    decimals: 2,
  },
  MYR: {
    code: "MYR",
    name: "Ringgit Malaysia",
    symbol: "RM",
    locale: "ms-MY",
    rateFromIdr: 1 / 3600,
    decimals: 2,
  },
  EUR: {
    code: "EUR",
    name: "Euro",
    symbol: "€",
    locale: "de-DE",
    rateFromIdr: 1 / 17200,
    decimals: 2,
  },
  JPY: {
    code: "JPY",
    name: "Yen Jepang",
    symbol: "¥",
    locale: "ja-JP",
    rateFromIdr: 1 / 105,
    decimals: 0,
  },
  AUD: {
    code: "AUD",
    name: "Dolar Australia",
    symbol: "A$",
    locale: "en-AU",
    rateFromIdr: 1 / 10400,
    decimals: 2,
  },
  GBP: {
    code: "GBP",
    name: "Pound Sterling",
    symbol: "£",
    locale: "en-GB",
    rateFromIdr: 1 / 20300,
    decimals: 2,
  },
};

export const FOREIGN_CURRENCIES: CurrencyCode[] = [
  "USD",
  "SGD",
  "MYR",
  "EUR",
  "JPY",
  "AUD",
  "GBP",
];

export const CURRENCY_COOKIE_NAME = "cflow_currency";

export function isValidCurrency(value: string | undefined | null): value is CurrencyCode {
  return Boolean(value && value in CURRENCIES);
}

const formatterCache = new Map<CurrencyCode, Intl.NumberFormat>();

function getFormatter(code: CurrencyCode) {
  let formatter = formatterCache.get(code);
  if (!formatter) {
    const info = CURRENCIES[code];
    formatter = new Intl.NumberFormat(info.locale, {
      style: "currency",
      currency: info.code,
      minimumFractionDigits: info.decimals,
      maximumFractionDigits: info.decimals,
    });
    formatterCache.set(code, formatter);
  }
  return formatter;
}

export function formatCurrencyValue(
  nominalIdr: number | bigint,
  currencyCode: CurrencyCode = "IDR",
  customRateFromIdr?: number,
): string {
  const info = CURRENCIES[currencyCode] ?? CURRENCIES.IDR;
  const rate =
    currencyCode === "IDR"
      ? 1
      : customRateFromIdr && customRateFromIdr > 0
        ? customRateFromIdr
        : info.rateFromIdr;
  const converted = Number(nominalIdr) * rate;
  return getFormatter(info.code).format(converted);
}

export function buildFallbackRates(): LiveRatesPayload {
  const rates = {} as Record<CurrencyCode, LiveRateEntry>;
  for (const code of Object.keys(CURRENCIES) as CurrencyCode[]) {
    const info = CURRENCIES[code];
    const idrPerUnit = code === "IDR" ? 1 : Math.round(1 / info.rateFromIdr);
    rates[code] = {
      code,
      rateFromIdr: info.rateFromIdr,
      idrPerUnit,
      previousIdrPerUnit: idrPerUnit,
      changePercent: 0,
      trend: "flat",
    };
  }
  return {
    isLive: false,
    source: "Estimasi Default",
    date: new Date().toISOString().slice(0, 10),
    updatedAt: new Date().toISOString(),
    rates,
  };
}
