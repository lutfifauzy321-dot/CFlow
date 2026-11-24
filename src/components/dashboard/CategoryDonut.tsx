"use client";

import { useState } from "react";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { PieChart as PieIcon } from "lucide-react";
import { useCurrency } from "@/components/providers/CurrencyProvider";
import type { CategorySpending } from "@/services/dashboard.service";

// Palette matching the screenshot's vibrant colorful donut: Purple, Coral, Amber, Cyan, Lavender
const modernPalette = [
  "#6366f1", // Indigo/Purple
  "#f43f5e", // Rose/Coral
  "#f59e0b", // Amber/Gold
  "#06b6d4", // Cyan
  "#a855f7", // Lavender/Purple
  "#10b981", // Emerald
  "#64748b", // Slate
];

export function CategoryDonut({
  categories,
  total,
  incomeCategories = [],
  incomeTotal = 0,
  bulanLabel,
}: {
  categories: CategorySpending[];
  total: number;
  incomeCategories?: CategorySpending[];
  incomeTotal?: number;
  bulanLabel?: string;
}) {
  const { formatMoney } = useCurrency();
  const [selectedType, setSelectedType] = useState<"keluar" | "masuk">("keluar");
  const activeCategories = selectedType === "keluar" ? categories : incomeCategories;
  const activeTotal = selectedType === "keluar" ? total : incomeTotal;

  return (
    <section
      className="rounded-3xl border border-border/80 bg-surface p-5 sm:p-6 shadow-xs flex flex-col justify-between"
      aria-label="Distribusi per kategori"
    >
      {/* Header matching screenshot */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <span className="grid size-10 shrink-0 place-items-center rounded-2xl bg-purple-100 text-[#5b3fc8] dark:bg-purple-950/60 dark:text-purple-300 shadow-xs">
            <PieIcon size={20} strokeWidth={2.2} />
          </span>
          <div>
            <h2 className="text-base sm:text-lg font-bold text-foreground font-sans">
              {selectedType === "keluar" ? "Pengeluaran per Kategori" : "Pemasukan per Kategori"}
            </h2>
            <p className="text-xs text-muted">
              {selectedType === "keluar"
                ? "Distribusi pengeluaranmu berdasarkan kategori"
                : "Distribusi pemasukanmu berdasarkan kategori"}
              {bulanLabel ? ` (${bulanLabel})` : ""}
            </p>
          </div>
        </div>

        {/* Toggle Pengeluaran / Pemasukan */}
        <div className="flex items-center rounded-full bg-surface-alt p-1 border border-border/60">
          <button
            type="button"
            onClick={() => setSelectedType("keluar")}
            className={`rounded-full px-3 py-1 text-xs font-semibold transition-all ${
              selectedType === "keluar"
                ? "bg-rose-500 text-white shadow-xs"
                : "text-muted hover:text-foreground"
            }`}
          >
            Pengeluaran
          </button>
          <button
            type="button"
            onClick={() => setSelectedType("masuk")}
            className={`rounded-full px-3 py-1 text-xs font-semibold transition-all ${
              selectedType === "masuk"
                ? "bg-emerald-600 text-white shadow-xs"
                : "text-muted hover:text-foreground"
            }`}
          >
            Pemasukan
          </button>
        </div>
      </div>

      {activeCategories.length === 0 ? (
        <div className="grid min-h-60 place-items-center text-center">
          <p className="max-w-60 text-xs sm:text-sm leading-6 text-muted">
            {selectedType === "keluar"
              ? "Belum ada pengeluaran yang tercatat pada bulan ini."
              : "Belum ada pemasukan yang tercatat pada bulan ini."}
          </p>
        </div>
      ) : (
        <div className="mt-4 grid items-center gap-4 sm:grid-cols-[1.1fr_1.2fr]">
          {/* Donut Chart Canvas */}
          <div className="relative mx-auto h-52 sm:h-56 w-full max-w-56">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart key={selectedType}>
                <Pie
                  data={activeCategories}
                  dataKey="nominal"
                  nameKey="nama"
                  innerRadius="65%"
                  outerRadius="90%"
                  paddingAngle={3}
                  stroke="none"
                  cornerRadius={6}
                  isAnimationActive={false}
                >
                  {activeCategories.map((category, index) => (
                    <Cell
                      key={category.id}
                      fill={modernPalette[index % modernPalette.length]}
                    />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value) => [
                    formatMoney(Number(value)),
                    selectedType === "keluar" ? "Pengeluaran" : "Pemasukan",
                  ]}
                  contentStyle={{
                    border: "1px solid var(--color-border)",
                    backgroundColor: "var(--color-surface)",
                    color: "var(--color-foreground)",
                    borderRadius: 12,
                    boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.2)",
                    fontSize: 12,
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Legend with percentages matching screenshot */}
          <div className="space-y-2.5">
            {activeCategories.slice(0, 5).map((category, index) => {
              const color = modernPalette[index % modernPalette.length];
              const percentage = activeTotal > 0 ? Math.round((category.nominal / activeTotal) * 100) : 0;

              return (
                <div
                  key={category.id}
                  className="flex items-center justify-between gap-2 text-xs"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span
                      className="size-2.5 shrink-0 rounded-full"
                      style={{ backgroundColor: color }}
                    />
                    <span className="truncate font-medium text-foreground-soft">
                      {category.nama}
                    </span>
                  </div>
                  <span className="font-semibold text-foreground tabular-nums">
                    {percentage}%
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </section>
  );
}
