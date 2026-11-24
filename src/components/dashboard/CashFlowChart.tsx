"use client";

import { useState } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { BarChart2, Download } from "lucide-react";
import { useCurrency } from "@/components/providers/CurrencyProvider";
import type { CashFlowPoint } from "@/services/dashboard.service";

type Period = "7H" | "30H" | "3B" | "1T";
type FlowFilter = "all" | "masuk" | "keluar";

const periods: { key: Period; label: string }[] = [
  { key: "7H", label: "7H" },
  { key: "30H", label: "30H" },
  { key: "3B", label: "3B" },
  { key: "1T", label: "1T" },
];

const flowFilters: { key: FlowFilter; label: string }[] = [
  { key: "all", label: "Semua" },
  { key: "masuk", label: "Pemasukan" },
  { key: "keluar", label: "Pengeluaran" },
];

function dateRange(bulan: string, period: Period) {
  const [year, month] = bulan.split("-").map(Number);
  const end = new Date(Date.UTC(year, month, 0));
  let start: Date;

  if (period === "7H") {
    start = new Date(Date.UTC(year, month - 1, end.getUTCDate() - 6));
  } else if (period === "30H") {
    start = new Date(Date.UTC(year, month - 1, end.getUTCDate() - 29));
  } else if (period === "3B") {
    start = new Date(Date.UTC(year, month - 3, 1));
  } else {
    start = new Date(Date.UTC(year, month - 12, 1));
  }

  return {
    start: start.toISOString().slice(0, 10),
    end: end.toISOString().slice(0, 10),
  };
}

function shortDate(value: string) {
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "short",
    timeZone: "UTC",
  }).format(new Date(`${value}T00:00:00Z`));
}

function formatShortNominal(value: number) {
  if (value === 0) return "0";
  if (value >= 1_000_000) {
    const formatted = (value / 1_000_000).toFixed(0);
    return `${formatted}jt`;
  }
  if (value >= 1_000) {
    return `${(value / 1_000).toFixed(0)}rb`;
  }
  return String(value);
}

export function CashFlowChart({
  data,
  bulan,
}: {
  data: CashFlowPoint[];
  bulan: string;
}) {
  const { formatMoney } = useCurrency();
  const [period, setPeriod] = useState<Period>("30H");
  const [flowFilter, setFlowFilter] = useState<FlowFilter>("all");
  const range = dateRange(bulan, period);
  const chartData = data.filter(
    (point) => point.tanggal >= range.start && point.tanggal <= range.end,
  );
  const showIncome = flowFilter === "all" || flowFilter === "masuk";
  const showExpense = flowFilter === "all" || flowFilter === "keluar";
  const hasActivity = chartData.some(
    (point) => (showIncome && point.pemasukan > 0) || (showExpense && point.pengeluaran > 0),
  );

  function handleExport() {
    window.print();
  }

  return (
    <section
      className="rounded-3xl border border-border/80 bg-surface p-5 sm:p-6 shadow-xs"
      aria-label="Grafik arus uang"
    >
      {/* Header matching screenshot */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <span className="grid size-10 shrink-0 place-items-center rounded-2xl bg-purple-100 text-[#5b3fc8] shadow-xs">
            <BarChart2 size={20} strokeWidth={2.2} />
          </span>
          <div>
            <h2 className="text-base sm:text-lg font-bold text-foreground font-sans">
              Arus Uang
            </h2>
            <p className="text-xs text-muted">
              Perbandingan pemasukan dan pengeluaran dalam satu periode
            </p>
          </div>
        </div>

        {/* Right Controls: Flow Type Filter, Period Pills & Download Button */}
        <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
          <div className="flex items-center rounded-full bg-surface-alt p-1 border border-border/60">
            {flowFilters.map((item) => (
              <button
                key={item.key}
                type="button"
                onClick={() => setFlowFilter(item.key)}
                className={`rounded-full px-3 py-1 text-xs font-semibold transition-all ${
                  flowFilter === item.key
                    ? item.key === "masuk"
                      ? "bg-emerald-600 text-white shadow-xs"
                      : item.key === "keluar"
                        ? "bg-rose-500 text-white shadow-xs"
                        : "bg-[#5b3fc8] text-white shadow-xs"
                    : "text-muted hover:text-foreground"
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>

          <div className="flex items-center rounded-full bg-surface-alt p-1 border border-border/60">
            {periods.map((item) => (
              <button
                key={item.key}
                type="button"
                onClick={() => setPeriod(item.key)}
                className={`rounded-full px-3 py-1 text-xs font-semibold transition-all ${
                  period === item.key
                    ? "bg-[#5b3fc8] text-white shadow-xs"
                    : "text-muted hover:text-foreground"
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={handleExport}
            aria-label="Unduh data arus uang"
            title="Unduh laporan"
            className="grid size-8.5 place-items-center rounded-full border border-border bg-surface text-muted hover:text-primary hover:border-primary transition shadow-xs"
          >
            <Download size={15} />
          </button>
        </div>
      </div>

      {/* Legend Dots */}
      <div className="mt-3.5 flex items-center gap-5 text-xs">
        {showIncome && (
          <div className="flex items-center gap-2">
            <span className="size-2.5 rounded-full bg-[#6366f1]" />
            <span className="font-medium text-foreground-soft">Pemasukan</span>
          </div>
        )}
        {showExpense && (
          <div className="flex items-center gap-2">
            <span className="size-2.5 rounded-full bg-[#f43f5e]" />
            <span className="font-medium text-foreground-soft">Pengeluaran</span>
          </div>
        )}
      </div>

      {/* Chart Canvas */}
      <div className="mt-6 h-64 sm:h-72 w-full">
        {!hasActivity ? (
          <div className="grid h-full place-items-center text-xs sm:text-sm text-muted">
            Belum ada aktivitas arus uang pada periode ini.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              key={`${flowFilter}-${period}`}
              data={chartData}
              margin={{ top: 10, right: 10, left: -15, bottom: 0 }}
            >
              <defs>
                {/* Purple gradient for Pemasukan */}
                <linearGradient id="pemasukanGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0.0} />
                </linearGradient>
                {/* Pink/Coral gradient for Pengeluaran */}
                <linearGradient id="pengeluaranGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#f43f5e" stopOpacity={0.0} />
                </linearGradient>
              </defs>

              <CartesianGrid
                strokeDasharray="4 4"
                stroke="var(--color-chart-grid)"
                vertical={false}
              />

              <XAxis
                dataKey="tanggal"
                tickFormatter={shortDate}
                tickLine={false}
                axisLine={false}
                stroke="var(--color-muted)"
                fontSize={11}
                dy={8}
              />

              <YAxis
                tickFormatter={formatShortNominal}
                tickLine={false}
                axisLine={false}
                stroke="var(--color-muted)"
                fontSize={11}
                dx={-4}
              />

              <Tooltip
                content={({ active, payload, label }) => {
                  if (!active || !payload?.length || !label) return null;
                  const point = payload[0]?.payload as CashFlowPoint | undefined;
                  const pemasukan = Number(point?.pemasukan ?? 0);
                  const pengeluaran = Number(point?.pengeluaran ?? 0);

                  return (
                    <div className="rounded-2xl border border-border/80 bg-surface p-3.5 shadow-xl font-sans">
                      <p className="text-xs font-semibold text-foreground mb-2">
                        {shortDate(String(label))}
                      </p>
                      <div className="space-y-1.5 text-xs">
                        {showIncome && (
                          <div className="flex items-center gap-2">
                            <span className="size-2 rounded-full bg-[#6366f1]" />
                            <span className="text-muted">Pemasukan:</span>
                            <span className="font-semibold text-foreground">
                              {formatMoney(pemasukan)}
                            </span>
                          </div>
                        )}
                        {showExpense && (
                          <div className="flex items-center gap-2">
                            <span className="size-2 rounded-full bg-[#f43f5e]" />
                            <span className="text-muted">Pengeluaran:</span>
                            <span className="font-semibold text-foreground">
                              {formatMoney(pengeluaran)}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                }}
              />

              {/* Pemasukan Spline Area */}
              {showIncome && (
                <Area
                  type="monotone"
                  dataKey="pemasukan"
                  stroke="#6366f1"
                  strokeWidth={3}
                  fill="url(#pemasukanGrad)"
                  isAnimationActive={false}
                  activeDot={{ r: 5, fill: "#6366f1", stroke: "#ffffff", strokeWidth: 2 }}
                />
              )}

              {/* Pengeluaran Spline Area */}
              {showExpense && (
                <Area
                  type="monotone"
                  dataKey="pengeluaran"
                  stroke="#f43f5e"
                  strokeWidth={3}
                  fill="url(#pengeluaranGrad)"
                  isAnimationActive={false}
                  activeDot={{ r: 5, fill: "#f43f5e", stroke: "#ffffff", strokeWidth: 2 }}
                />
              )}
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </section>
  );
}
