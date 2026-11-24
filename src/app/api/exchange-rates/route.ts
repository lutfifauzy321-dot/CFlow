import { NextResponse } from "next/server";
import {
  buildFallbackRates,
  CURRENCIES,
  FOREIGN_CURRENCIES,
  type CurrencyCode,
  type LiveRateEntry,
  type LiveRatesPayload,
  type RateTrend,
} from "@/lib/utils/currency";

function formatDateIso(date: Date) {
  return date.toISOString().slice(0, 10);
}

function computeEntry(
  code: CurrencyCode,
  currentRateFromIdr: number,
  previousRateFromIdr?: number,
): LiveRateEntry {
  if (code === "IDR") {
    return {
      code: "IDR",
      rateFromIdr: 1,
      idrPerUnit: 1,
      previousIdrPerUnit: 1,
      changePercent: 0,
      trend: "flat",
    };
  }

  const idrPerUnit = currentRateFromIdr > 0 ? 1 / currentRateFromIdr : 1 / CURRENCIES[code].rateFromIdr;
  const prevIdrPerUnit =
    previousRateFromIdr && previousRateFromIdr > 0
      ? 1 / previousRateFromIdr
      : 1 / CURRENCIES[code].rateFromIdr;

  const diffPercent =
    prevIdrPerUnit > 0
      ? Number((((idrPerUnit - prevIdrPerUnit) / prevIdrPerUnit) * 100).toFixed(2))
      : 0;

  let trend: RateTrend = "flat";
  if (diffPercent > 0.005) trend = "up";
  else if (diffPercent < -0.005) trend = "down";

  return {
    code,
    rateFromIdr: currentRateFromIdr,
    idrPerUnit: Math.round(idrPerUnit * 100) / 100,
    previousIdrPerUnit: Math.round(prevIdrPerUnit * 100) / 100,
    changePercent: diffPercent,
    trend,
  };
}

export async function GET() {
  const symbols = FOREIGN_CURRENCIES.join(",");

  // Primary: Frankfurter API (official ECB reference rates with historical range for real up/down trend)
  try {
    const end = new Date();
    const start = new Date(end.getTime() - 10 * 24 * 60 * 60 * 1000);
    const url = `https://api.frankfurter.app/${formatDateIso(start)}..${formatDateIso(end)}?from=IDR&to=${symbols}`;

    const res = await fetch(url, {
      next: { revalidate: 300 },
      signal: AbortSignal.timeout(6000),
    });

    if (res.ok) {
      const json = (await res.json()) as {
        rates?: Record<string, Record<string, number>>;
      };

      const dates = Object.keys(json.rates ?? {}).sort();
      if (dates.length > 0) {
        const latestDate = dates[dates.length - 1];
        const prevDate = dates.length > 1 ? dates[dates.length - 2] : latestDate;
        const latestRates = json.rates![latestDate] ?? {};
        const prevRates = json.rates![prevDate] ?? latestRates;

        const rates = {} as Record<CurrencyCode, LiveRateEntry>;
        rates.IDR = computeEntry("IDR", 1, 1);

        for (const code of FOREIGN_CURRENCIES) {
          const cur = latestRates[code] ?? CURRENCIES[code].rateFromIdr;
          const prev = prevRates[code] ?? cur;
          rates[code] = computeEntry(code, cur, prev);
        }

        const payload: LiveRatesPayload = {
          isLive: true,
          source: "ECB / Frankfurter Live",
          date: latestDate,
          updatedAt: new Date().toISOString(),
          rates,
        };

        return NextResponse.json(payload, {
          headers: { "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600" },
        });
      }
    }
  } catch {
    // Fallback to Open ExchangeRate-API below
  }

  // Secondary Fallback: Open ExchangeRate-API
  try {
    const res = await fetch("https://open.er-api.com/v6/latest/IDR", {
      next: { revalidate: 300 },
      signal: AbortSignal.timeout(6000),
    });

    if (res.ok) {
      const json = (await res.json()) as {
        result?: string;
        time_last_update_utc?: string;
        rates?: Record<string, number>;
      };

      if (json.result === "success" && json.rates) {
        const rates = {} as Record<CurrencyCode, LiveRateEntry>;
        rates.IDR = computeEntry("IDR", 1, 1);

        for (const code of FOREIGN_CURRENCIES) {
          const cur = json.rates[code] ?? CURRENCIES[code].rateFromIdr;
          rates[code] = computeEntry(code, cur, CURRENCIES[code].rateFromIdr);
        }

        const payload: LiveRatesPayload = {
          isLive: true,
          source: "ExchangeRate-API Live",
          date: new Date().toISOString().slice(0, 10),
          updatedAt: new Date().toISOString(),
          rates,
        };

        return NextResponse.json(payload, {
          headers: { "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600" },
        });
      }
    }
  } catch {
    // Fallback to static rates below
  }

  return NextResponse.json(buildFallbackRates(), {
    headers: { "Cache-Control": "no-store" },
  });
}
