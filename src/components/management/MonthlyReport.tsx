"use client";

import { useMemo, useState } from "react";
import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Download } from "lucide-react";
import { SummaryCard } from "@/components/dashboard/SummaryCard";
import { useCurrency } from "@/components/providers/CurrencyProvider";

type ReportSummary = {
  total_saldo: number;
  total_pemasukan: number;
  total_pengeluaran: number;
  saldo_perubahan_persen: number | null;
  pemasukan_perubahan_persen: number | null;
  pengeluaran_perubahan_persen: number | null;
};

type ReportTransaction = {
  id: string;
  category_id: string;
  tanggal: string;
  keterangan: string;
  tipe: "masuk" | "keluar";
  nominal: number;
};

type ReportCategory = {
  id: string;
  nama: string;
  tipe: "masuk" | "keluar";
  warna: string;
};

const chartCategoryColors = [
  "var(--category-1)",
  "var(--category-2)",
  "var(--category-3)",
  "var(--category-4)",
  "var(--category-5)",
  "var(--category-6)",
];

type MonthlyReportProps = {
  bulan: string;
  summary: ReportSummary;
  transactions: ReportTransaction[];
  categories: ReportCategory[];
};

function displayDate(value: string) {
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(`${value}T00:00:00`));
}

function csvCell(value: string | number) {
  let text = String(value);
  if (/^[=+\-@\t\r]/.test(text)) text = `'${text}`;
  return `"${text.replaceAll('"', '""')}"`;
}

export function MonthlyReport({
  bulan,
  summary,
  transactions,
  categories,
}: MonthlyReportProps) {
  const { formatMoney } = useCurrency();
  const [flowFilter, setFlowFilter] = useState<"all" | "masuk" | "keluar">("all");
  const [categoryType, setCategoryType] = useState<"keluar" | "masuk">("keluar");
  const showIncome = flowFilter === "all" || flowFilter === "masuk";
  const showExpense = flowFilter === "all" || flowFilter === "keluar";
  const monthLabel = new Intl.DateTimeFormat("id-ID", {
    month: "long",
    year: "numeric",
  }).format(new Date(`${bulan}-01T00:00:00`));
  const categoryNameById = new Map(categories.map((category) => [category.id, category.nama]));

  const dailyData = useMemo(() => {
    const [year, month] = bulan.split("-").map(Number);
    const daysInMonth = new Date(Date.UTC(year, month, 0)).getUTCDate();
    const totals = new Map<number, { hari: number; pemasukan: number; pengeluaran: number }>();
    for (let day = 1; day <= daysInMonth; day += 1) {
      totals.set(day, { hari: day, pemasukan: 0, pengeluaran: 0 });
    }
    for (const transaction of transactions) {
      const day = Number(transaction.tanggal.slice(-2));
      const point = totals.get(day);
      if (!point) continue;
      if (transaction.tipe === "masuk") point.pemasukan += transaction.nominal;
      else point.pengeluaran += transaction.nominal;
    }
    return [...totals.values()];
  }, [bulan, transactions]);

  const categoryBreakdown = useMemo(() => {
    const categoryNames = new Map(categories.map((category) => [category.id, category.nama]));
    const totals = new Map<string, number>();
    for (const transaction of transactions) {
      if (transaction.tipe !== categoryType) continue;
      totals.set(transaction.category_id, (totals.get(transaction.category_id) ?? 0) + transaction.nominal);
    }
    return [...totals.entries()]
      .map(([id, nominal]) => ({
        id,
        nama: categoryNames.get(id) ?? "Kategori dihapus",
        nominal,
      }))
      .sort((left, right) => right.nominal - left.nominal)
      .map((category, index) => ({
        ...category,
        warna: chartCategoryColors[index % chartCategoryColors.length],
      }));
  }, [categories, transactions, categoryType]);

  function exportCsv() {
    const rows = [
      ["Tanggal", "Keterangan", "Kategori", "Jenis", "Nominal (IDR)"],
      ...transactions.map((transaction) => [
        transaction.tanggal,
        transaction.keterangan,
        categoryNameById.get(transaction.category_id) ?? "Kategori dihapus",
        transaction.tipe === "masuk" ? "Pemasukan" : "Pengeluaran",
        transaction.nominal,
      ]),
    ];
    const csv = `\uFEFF${rows.map((row) => row.map(csvCell).join(",")).join("\r\n")}`;
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = `cflow-laporan-${bulan}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-primary">Laporan bulanan</p>
          <h1 className="mt-1 text-2xl font-semibold capitalize text-foreground">{monthLabel}</h1>
          <p className="mt-1 text-sm text-muted">Ringkasan dan rincian transaksi pada bulan terpilih.</p>
        </div>
        <button
          type="button"
          onClick={exportCsv}
          disabled={transactions.length === 0}
          className="flex h-11 items-center gap-2 rounded-lg border border-border bg-surface px-4 text-sm font-semibold text-primary-strong transition hover:bg-primary-soft disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Download size={17} /> Ekspor CSV
        </button>
      </div>

      <section className="grid gap-4 md:grid-cols-3" aria-label="Ringkasan laporan">
        <SummaryCard title="Total saldo" value={summary.total_saldo} change={summary.saldo_perubahan_persen} tone="balance" />
        <SummaryCard title="Pemasukan" value={summary.total_pemasukan} change={summary.pemasukan_perubahan_persen} tone="income" />
        <SummaryCard title="Pengeluaran" value={summary.total_pengeluaran} change={summary.pengeluaran_perubahan_persen} tone="expense" />
      </section>

      <section className="grid gap-5 xl:grid-cols-[1.4fr_0.8fr]">
        <div className="rounded-3xl border border-border/80 bg-surface p-5 sm:p-6 shadow-xs">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="text-base font-semibold text-foreground">Pemasukan dan pengeluaran harian</h2>
              <p className="mt-1 text-xs text-muted">Pergerakan nominal sepanjang {monthLabel}</p>
            </div>
            <div className="flex items-center rounded-full bg-surface-alt p-1 border border-border/60">
              {(
                [
                  { key: "all", label: "Semua" },
                  { key: "masuk", label: "Pemasukan" },
                  { key: "keluar", label: "Pengeluaran" },
                ] as const
              ).map((item) => (
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
                          : "bg-primary text-white shadow-xs"
                      : "text-muted hover:text-foreground"
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
          <div className="mt-5 h-70">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart key={flowFilter} data={dailyData} margin={{ top: 8, right: 4, left: 4, bottom: 0 }}>
                <CartesianGrid vertical={false} stroke="var(--chart-grid)" />
                <XAxis dataKey="hari" tick={{ fill: "var(--muted-soft)", fontSize: 11 }} axisLine={false} tickLine={false} minTickGap={20} />
                <YAxis
                  tickFormatter={(value: number) => value >= 1_000_000 ? `${Math.round(value / 1_000_000)} jt` : value >= 1_000 ? `${Math.round(value / 1_000)} rb` : String(value)}
                  tick={{ fill: "var(--muted-soft)", fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                  width={48}
                />
                <Tooltip
                  labelFormatter={(value) => `Tanggal ${value}`}
                  formatter={(value, name) => [formatMoney(Number(value)), name === "pemasukan" ? "Pemasukan" : "Pengeluaran"]}
                  contentStyle={{ border: "1px solid var(--border)", borderRadius: 8, backgroundColor: "var(--chart-tooltip)", color: "var(--foreground)", fontSize: 12 }}
                />
                {showIncome && <Bar dataKey="pemasukan" name="pemasukan" fill="var(--income)" radius={[3, 3, 0, 0]} isAnimationActive={false} />}
                {showExpense && <Bar dataKey="pengeluaran" name="pengeluaran" fill="var(--expense)" radius={[3, 3, 0, 0]} isAnimationActive={false} />}
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-3 flex gap-5 border-t border-border-soft pt-3 text-xs text-muted">
            {showIncome && <span className="inline-flex items-center gap-2"><span className="size-2 rounded-full bg-income" />Pemasukan</span>}
            {showExpense && <span className="inline-flex items-center gap-2"><span className="size-2 rounded-full bg-expense" />Pengeluaran</span>}
          </div>
        </div>

        <div className="rounded-3xl border border-border/80 bg-surface p-5 sm:p-6 shadow-xs">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div>
              <h2 className="text-base font-semibold text-foreground">
                {categoryType === "keluar" ? "Komposisi pengeluaran" : "Komposisi pemasukan"}
              </h2>
              <p className="mt-1 text-xs text-muted">Berdasarkan kategori</p>
            </div>
            <div className="flex items-center rounded-full bg-surface-alt p-1 border border-border/60">
              <button
                type="button"
                onClick={() => setCategoryType("keluar")}
                className={`rounded-full px-2.5 py-1 text-[11px] font-semibold transition-all ${
                  categoryType === "keluar" ? "bg-rose-500 text-white shadow-xs" : "text-muted hover:text-foreground"
                }`}
              >
                Keluar
              </button>
              <button
                type="button"
                onClick={() => setCategoryType("masuk")}
                className={`rounded-full px-2.5 py-1 text-[11px] font-semibold transition-all ${
                  categoryType === "masuk" ? "bg-emerald-600 text-white shadow-xs" : "text-muted hover:text-foreground"
                }`}
              >
                Masuk
              </button>
            </div>
          </div>
          {categoryBreakdown.length === 0 ? (
            <p className="grid min-h-70 place-items-center text-center text-sm text-muted">
              {categoryType === "keluar" ? "Belum ada pengeluaran bulan ini." : "Belum ada pemasukan bulan ini."}
            </p>
          ) : (
            <>
              <div className="mx-auto mt-2 h-55 max-w-70">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart key={categoryType}>
                    <Pie data={categoryBreakdown} dataKey="nominal" nameKey="nama" innerRadius="60%" outerRadius="84%" paddingAngle={2} stroke="none" isAnimationActive={false}>
                      {categoryBreakdown.map((category) => <Cell key={category.id} fill={category.warna} />)}
                    </Pie>
                    <Tooltip formatter={(value) => formatMoney(Number(value))} contentStyle={{ border: "1px solid var(--border)", borderRadius: 8, backgroundColor: "var(--chart-tooltip)", color: "var(--foreground)", fontSize: 12 }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <ul className="space-y-2.5">
                {categoryBreakdown.slice(0, 5).map((category) => (
                  <li key={category.id} className="flex items-center gap-2 text-sm">
                    <span className="size-2.5 shrink-0 rounded-sm" style={{ backgroundColor: category.warna }} />
                    <span className="min-w-0 flex-1 truncate text-foreground-soft">{category.nama}</span>
                    <span className="shrink-0 text-xs font-medium tabular-nums text-foreground-soft">{formatMoney(category.nominal)}</span>
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
      </section>

      <section className="overflow-hidden rounded-3xl border border-border/80 bg-surface shadow-xs">
        <div className="border-b border-border-soft px-4 py-4 sm:px-5">
          <h2 className="text-base font-semibold text-foreground">Rincian transaksi</h2>
          <p className="mt-1 text-xs text-muted">{transactions.length} transaksi pada bulan ini</p>
        </div>
        {transactions.length === 0 ? (
          <p className="px-5 py-10 text-center text-sm text-muted">Tidak ada transaksi untuk dilaporkan.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-150 text-left">
              <thead><tr className="border-b border-border-soft text-xs font-medium text-muted"><th className="px-5 py-3">Tanggal</th><th className="px-5 py-3">Keterangan</th><th className="px-5 py-3">Kategori</th><th className="px-5 py-3">Jenis</th><th className="px-5 py-3 text-right">Nominal</th></tr></thead>
              <tbody className="divide-y divide-border-soft">
                {transactions.map((transaction) => (
                  <tr key={transaction.id}>
                    <td className="whitespace-nowrap px-5 py-3 text-sm text-muted">{displayDate(transaction.tanggal)}</td>
                    <td className="max-w-60 truncate px-5 py-3 text-sm font-medium text-foreground-soft">{transaction.keterangan}</td>
                    <td className="px-5 py-3 text-sm text-muted">{categoryNameById.get(transaction.category_id) ?? "Kategori dihapus"}</td>
                    <td className="px-5 py-3 text-sm text-muted">{transaction.tipe === "masuk" ? "Pemasukan" : "Pengeluaran"}</td>
                    <td className={`whitespace-nowrap px-5 py-3 text-right text-sm font-semibold tabular-nums ${transaction.tipe === "masuk" ? "text-income" : "text-expense"}`}>
                      {transaction.tipe === "masuk" ? "+ " : "- "}{formatMoney(transaction.nominal)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}