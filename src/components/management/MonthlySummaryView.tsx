"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowDown,
  ArrowDownLeft,
  ArrowUpRight,
  ChevronDown,
  Download,
  Eye,
  FileImage,
  Filter,
  PieChart as PieIcon,
  Plus,
  Receipt,
  Search,
  SlidersHorizontal,
  Wallet,
  X,
} from "lucide-react";
import { useCurrency } from "@/components/providers/CurrencyProvider";
import type { Category, Transaction } from "@/types";
import { TransactionBadge } from "@/components/transaksi/TransactionBadge";

type MonthlySummaryViewProps = {
  bulan: string;
  transactions: Transaction[];
  categories: Category[];
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(`${value}T00:00:00`));
}

export function MonthlySummaryView({
  bulan,
  transactions,
  categories,
}: MonthlySummaryViewProps) {
  const { formatMoney } = useCurrency();
  const [filterType, setFilterType] = useState<"all" | "keluar" | "masuk">("keluar");
  const [breakdownType, setBreakdownType] = useState<"keluar" | "masuk">("keluar");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"date_desc" | "date_asc" | "amount_desc" | "amount_asc">("date_desc");
  const [previewBukti, setPreviewBukti] = useState<{ url: string; keterangan: string } | null>(null);

  const [year, monthNumber] = bulan.split("-").map(Number);
  const bulanLabel = new Intl.DateTimeFormat("id-ID", {
    month: "long",
    year: "numeric",
  }).format(new Date(year, monthNumber - 1, 1));

  const categoryMap = new Map(categories.map((c) => [c.id, c]));

  // Calculations
  const incomeTransactions = transactions.filter((t) => t.tipe === "masuk");
  const expenseTransactions = transactions.filter((t) => t.tipe === "keluar");

  const totalPemasukan = incomeTransactions.reduce((acc, t) => acc + t.nominal, 0);
  const totalPengeluaran = expenseTransactions.reduce((acc, t) => acc + t.nominal, 0);
  const netSavings = totalPemasukan - totalPengeluaran;
  const savingsRate =
    totalPemasukan > 0 ? Math.round((netSavings / totalPemasukan) * 100) : 0;

  // Breakdown by category (pengeluaran or pemasukan)
  const activeBreakdownSource = breakdownType === "keluar" ? expenseTransactions : incomeTransactions;
  const activeBreakdownTotal = breakdownType === "keluar" ? totalPengeluaran : totalPemasukan;
  const categoryBreakdownMap = new Map<string, { category: Category; nominal: number; count: number }>();
  for (const t of activeBreakdownSource) {
    const cat = categoryMap.get(t.category_id) ?? {
      id: t.category_id,
      nama: "Lainnya",
      tipe: breakdownType,
      ikon: "tag",
      warna: "#64748b",
    };
    const current = categoryBreakdownMap.get(cat.id) ?? { category: cat, nominal: 0, count: 0 };
    current.nominal += t.nominal;
    current.count += 1;
    categoryBreakdownMap.set(cat.id, current);
  }
  const categoryBreakdown = Array.from(categoryBreakdownMap.values()).sort(
    (a, b) => b.nominal - a.nominal,
  );

  // Filtered transactions for the detailed list
  const filteredTransactions = transactions
    .filter((t) => {
      if (filterType !== "all" && t.tipe !== filterType) return false;
      if (selectedCategory !== "all" && t.category_id !== selectedCategory) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const catName = categoryMap.get(t.category_id)?.nama.toLowerCase() ?? "";
        return t.keterangan.toLowerCase().includes(q) || catName.includes(q);
      }
      return true;
    })
    .sort((a, b) => {
      if (sortBy === "date_desc") return b.tanggal.localeCompare(a.tanggal);
      if (sortBy === "date_asc") return a.tanggal.localeCompare(b.tanggal);
      if (sortBy === "amount_desc") return b.nominal - a.nominal;
      if (sortBy === "amount_asc") return a.nominal - b.nominal;
      return 0;
    });

  const biggestExpense = expenseTransactions.reduce(
    (max, t) => (t.nominal > (max?.nominal ?? 0) ? t : max),
    null as Transaction | null,
  );

  function handlePrint() {
    window.print();
  }

  return (
    <div className="space-y-6">
      {/* Top Banner / Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-primary">
            Ringkasan Keuangan Bulanan
          </span>
          <h1 className="mt-1 text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
            Rincian Arus Uang {bulanLabel}
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-muted">
            Tinjauan lengkap seluruh pemasukan dan pengeluaran pada bulan terpilih.
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          <button
            type="button"
            onClick={handlePrint}
            className="flex h-10.5 items-center gap-2 rounded-xl border border-border bg-surface px-4 text-xs sm:text-sm font-semibold text-foreground-soft hover:bg-surface-alt transition shadow-xs"
          >
            <Download size={16} />
            <span>Cetak / Ekspor</span>
          </button>
          <Link
            href="/transaksi"
            className="flex h-10.5 items-center gap-2 rounded-xl bg-primary px-4 text-xs sm:text-sm font-semibold text-white hover:bg-primary-hover transition shadow-sm active:scale-95"
          >
            <Plus size={16} strokeWidth={2.4} />
            <span>Tambah Catatan</span>
          </Link>
        </div>
      </div>

      {/* 4 Overview Metrics */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Total Pemasukan */}
        <div className="rounded-3xl border border-border/80 bg-surface p-5 shadow-xs transition hover:shadow-md">
          <div className="flex items-center gap-3">
            <span className="grid size-10 place-items-center rounded-2xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-100 dark:border-emerald-900/50">
              <ArrowDown size={19} strokeWidth={2.2} />
            </span>
            <p className="text-xs font-medium text-muted">Total Pemasukan</p>
          </div>
          <p className="mt-4 text-xl sm:text-2xl font-bold tracking-tight text-emerald-600 dark:text-emerald-400 tabular-nums">
            {formatMoney(totalPemasukan)}
          </p>
          <p className="mt-1 text-[11px] text-muted">
            {incomeTransactions.length} kali pemasukan tercatat
          </p>
        </div>

        {/* Total Pengeluaran */}
        <div className="rounded-3xl border border-border/80 bg-surface p-5 shadow-xs transition hover:shadow-md">
          <div className="flex items-center gap-3">
            <span className="grid size-10 place-items-center rounded-2xl bg-rose-50 text-rose-500 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-100 dark:border-rose-900/50">
              <ArrowUpRight size={19} strokeWidth={2.2} />
            </span>
            <p className="text-xs font-medium text-muted">Total Pengeluaran</p>
          </div>
          <p className="mt-4 text-xl sm:text-2xl font-bold tracking-tight text-rose-500 dark:text-rose-400 tabular-nums">
            {formatMoney(totalPengeluaran)}
          </p>
          <p className="mt-1 text-[11px] text-muted">
            {expenseTransactions.length} kali pengeluaran tercatat
          </p>
        </div>

        {/* Arus Uang Bersih (Sisa Saldo Bulan Ini) */}
        <div className="rounded-3xl border border-border/80 bg-surface p-5 shadow-xs transition hover:shadow-md">
          <div className="flex items-center gap-3">
            <span className="grid size-10 place-items-center rounded-2xl bg-violet-50 text-violet-600 border border-violet-100">
              <Wallet size={19} strokeWidth={2.2} />
            </span>
            <p className="text-xs font-medium text-muted">Sisa Arus Uang Bulan Ini</p>
          </div>
          <p
            className={`mt-4 text-xl sm:text-2xl font-bold tracking-tight tabular-nums ${
              netSavings >= 0 ? "text-foreground" : "text-danger"
            }`}
          >
            {formatMoney(netSavings)}
          </p>
          <p className="mt-1 text-[11px] text-muted">
            {netSavings >= 0 ? "Surplus / Sisa tabungan" : "Defisit pengeluaran"}
          </p>
        </div>

        {/* Rasio Tabungan / Pengeluaran Terbesar */}
        <div className="rounded-3xl border border-border/80 bg-surface p-5 shadow-xs transition hover:shadow-md">
          <div className="flex items-center gap-3">
            <span className="grid size-10 place-items-center rounded-2xl bg-amber-50 text-amber-600 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-100 dark:border-amber-900/50">
              <Receipt size={19} strokeWidth={2.2} />
            </span>
            <p className="text-xs font-medium text-muted">Pengeluaran Terbesar</p>
          </div>
          <p className="mt-4 text-lg sm:text-xl font-bold tracking-tight text-foreground truncate">
            {biggestExpense ? formatMoney(biggestExpense.nominal) : "Rp 0"}
          </p>
          <p className="mt-1 text-[11px] text-muted truncate">
            {biggestExpense ? biggestExpense.keterangan : "Belum ada transaksi"}
          </p>
        </div>
      </div>

      {/* Category Breakdown & Progress */}
      <div className="rounded-3xl border border-border/80 bg-surface p-5 sm:p-6 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border-soft pb-4">
          <div className="flex items-center gap-3">
            <span className="grid size-9 place-items-center rounded-xl bg-primary-soft text-primary">
              <PieIcon size={18} strokeWidth={2.2} />
            </span>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-foreground">
                {breakdownType === "keluar"
                  ? "Distribusi Kategori Pengeluaran"
                  : "Distribusi Kategori Pemasukan"}
              </h2>
              <p className="text-xs text-muted">
                Persentase dan total pemakaian per pos keuangan ({categoryBreakdown.length} Pos Aktif)
              </p>
            </div>
          </div>

          <div className="flex items-center rounded-full bg-surface-alt p-1 border border-border/60">
            <button
              type="button"
              onClick={() => setBreakdownType("keluar")}
              className={`rounded-full px-3 py-1 text-xs font-semibold transition-all ${
                breakdownType === "keluar"
                  ? "bg-rose-500 text-white shadow-xs"
                  : "text-muted hover:text-foreground"
              }`}
            >
              Pengeluaran
            </button>
            <button
              type="button"
              onClick={() => setBreakdownType("masuk")}
              className={`rounded-full px-3 py-1 text-xs font-semibold transition-all ${
                breakdownType === "masuk"
                  ? "bg-emerald-600 text-white shadow-xs"
                  : "text-muted hover:text-foreground"
              }`}
            >
              Pemasukan
            </button>
          </div>
        </div>

        {categoryBreakdown.length === 0 ? (
          <p className="py-8 text-center text-xs text-muted">
            {breakdownType === "keluar"
              ? `Belum ada data pengeluaran pada bulan ${bulanLabel}.`
              : `Belum ada data pemasukan pada bulan ${bulanLabel}.`}
          </p>
        ) : (
          <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {categoryBreakdown.map((item) => {
              const percentage =
                activeBreakdownTotal > 0 ? Math.round((item.nominal / activeBreakdownTotal) * 100) : 0;
              return (
                <div
                  key={item.category.id}
                  className="rounded-2xl border border-border/70 bg-surface-alt/50 p-4 space-y-2 transition hover:border-primary/40"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-bold text-foreground truncate">
                      {item.category.nama}
                    </span>
                    <span className="text-xs font-bold text-primary tabular-nums">
                      {percentage}%
                    </span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-border/60">
                    <div
                      className="h-full rounded-full bg-primary transition-all duration-500"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-muted">
                    <span>{item.count} transaksi</span>
                    <span className="font-semibold text-foreground-soft tabular-nums">
                      {formatMoney(item.nominal)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* FULL DETAILED LIST OF TRANSACTIONS (Rincian Pengeluaran Lengkap) */}
      <div className="rounded-3xl border border-border/80 bg-surface p-5 sm:p-6 shadow-xs space-y-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-foreground">
              Rincian Transaksi Lengkap
            </h2>
            <p className="text-xs text-muted">
              Semua catatan arus uang untuk bulan {bulanLabel}
            </p>
          </div>

          {/* Filter Controls */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Filter Jenis: Semua / Pengeluaran / Pemasukan */}
            <div className="flex items-center rounded-xl bg-surface-alt p-1 border border-border">
              <button
                type="button"
                onClick={() => setFilterType("keluar")}
                className={`rounded-lg px-3 py-1 text-xs font-semibold transition ${
                  filterType === "keluar"
                    ? "bg-rose-500 text-white shadow-2xs"
                    : "text-muted hover:text-foreground"
                }`}
              >
                Pengeluaran
              </button>
              <button
                type="button"
                onClick={() => setFilterType("masuk")}
                className={`rounded-lg px-3 py-1 text-xs font-semibold transition ${
                  filterType === "masuk"
                    ? "bg-emerald-600 text-white shadow-2xs"
                    : "text-muted hover:text-foreground"
                }`}
              >
                Pemasukan
              </button>
              <button
                type="button"
                onClick={() => setFilterType("all")}
                className={`rounded-lg px-3 py-1 text-xs font-semibold transition ${
                  filterType === "all"
                    ? "bg-primary text-white shadow-2xs"
                    : "text-muted hover:text-foreground"
                }`}
              >
                Semua
              </button>
            </div>

            {/* Filter Kategori */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="h-9 rounded-xl border border-border bg-surface px-3 text-xs text-foreground outline-none focus:border-primary"
            >
              <option value="all">Semua Kategori</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nama} ({c.tipe})
                </option>
              ))}
            </select>

            {/* Sort by */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as "date_desc" | "date_asc" | "amount_desc" | "amount_asc")}
              className="h-9 rounded-xl border border-border bg-surface px-3 text-xs text-foreground outline-none focus:border-primary"
            >
              <option value="date_desc">Tanggal: Terbaru</option>
              <option value="date_asc">Tanggal: Terlama</option>
              <option value="amount_desc">Nominal: Terbesar</option>
              <option value="amount_asc">Nominal: Terkecil</option>
            </select>
          </div>
        </div>

        {/* Search inside Ringkasan */}
        <div className="relative">
          <Search
            size={16}
            className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted"
          />
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari dalam rincian bulan ini..."
            className="h-10 w-full rounded-xl border border-border bg-surface pl-10 pr-4 text-xs text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
          />
        </div>

        {/* Transactions Table */}
        <div className="overflow-x-auto rounded-2xl border border-border">
          <table className="w-full min-w-160 border-collapse text-left">
            <thead>
              <tr className="border-b border-border bg-surface-alt/70 text-[11px] font-semibold uppercase tracking-wider text-muted">
                <th className="px-4 py-3">Tanggal</th>
                <th className="px-4 py-3">Keterangan</th>
                <th className="px-4 py-3">Kategori</th>
                <th className="px-4 py-3">Jenis</th>
                <th className="px-4 py-3">Bukti</th>
                <th className="px-4 py-3 text-right">Nominal</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredTransactions.map((t) => (
                <tr key={t.id} className="transition-colors hover:bg-surface-alt/50">
                  <td className="whitespace-nowrap px-4 py-3.5 text-xs text-muted">
                    {formatDate(t.tanggal)}
                  </td>
                  <td className="px-4 py-3.5">
                    <span className="block max-w-64 truncate text-xs font-semibold text-foreground">
                      {t.keterangan}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-xs text-foreground-soft">
                    {categoryMap.get(t.category_id)?.nama ?? "Kategori dihapus"}
                  </td>
                  <td className="px-4 py-3.5">
                    <TransactionBadge tipe={t.tipe} />
                  </td>
                  <td className="px-4 py-3.5">
                    {t.bukti_url ? (
                      <button
                        type="button"
                        onClick={() =>
                          setPreviewBukti({
                            url: t.bukti_url!,
                            keterangan: t.keterangan,
                          })
                        }
                        className="inline-flex items-center gap-1 rounded-md border border-border bg-surface px-2 py-0.5 text-[11px] font-medium text-primary hover:border-primary"
                        title="Lihat bukti"
                      >
                        <FileImage size={12} />
                        <span>Lihat</span>
                      </button>
                    ) : (
                      <span className="text-[11px] text-muted/60">-</span>
                    )}
                  </td>
                  <td
                    className={`whitespace-nowrap px-4 py-3.5 text-right text-xs font-bold tabular-nums ${
                      t.tipe === "masuk" ? "text-income" : "text-expense"
                    }`}
                  >
                    {t.tipe === "masuk" ? "+ " : "- "}
                    {formatMoney(t.nominal)}
                  </td>
                </tr>
              ))}

              {filteredTransactions.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-xs text-muted">
                    Tidak ada transaksi yang cocok dengan filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Lightbox / Preview Bukti Modal */}
      {previewBukti && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 grid place-items-center bg-black/60 p-4 backdrop-blur-xs animate-in fade-in duration-150"
          onClick={() => setPreviewBukti(null)}
        >
          <div
            className="relative max-h-[90vh] max-w-lg w-full overflow-hidden rounded-3xl border border-border bg-surface p-4 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-border-soft">
              <div>
                <h3 className="text-sm font-bold text-foreground">Bukti Transaksi</h3>
                <p className="text-xs text-muted truncate max-w-xs">{previewBukti.keterangan}</p>
              </div>
              <button
                type="button"
                onClick={() => setPreviewBukti(null)}
                className="grid size-8 place-items-center rounded-full bg-surface-alt text-muted hover:text-foreground transition"
              >
                <X size={16} />
              </button>
            </div>
            <div className="mt-3 flex items-center justify-center overflow-hidden rounded-2xl bg-black/5 dark:bg-black/40 p-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={previewBukti.url}
                alt={`Bukti transaksi ${previewBukti.keterangan}`}
                className="max-h-[65vh] w-auto rounded-xl object-contain shadow-sm"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

