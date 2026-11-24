"use client";

import { Suspense, useEffect, useState, useRef } from "react";
import Link from "next/link";
import {
  ArrowLeftRight,
  BarChart2,
  ChartNoAxesCombined,
  ChevronRight,
  Home,
  Menu,
  Moon,
  Plus,
  Search,
  Settings,
  Sun,
  Tag,
  Target,
  TrendingDown,
  TrendingUp,
  Trophy,
  X,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { MonthPicker } from "@/components/layout/MonthPicker";
import { useCurrency } from "@/components/providers/CurrencyProvider";

type HeaderProps = {
  onMenuClick: () => void;
};

const navigationMenus = [
  {
    label: "Dasbor",
    href: "/dashboard",
    group: "Ruang Kerja",
    icon: Home,
    keywords: ["home", "dasbor", "beranda", "dashboard", "utama"],
  },
  {
    label: "Ringkasan",
    href: "/ringkasan",
    group: "Ruang Kerja",
    icon: BarChart2,
    keywords: ["ringkasan", "summary", "arus uang", "pemasukan", "pengeluaran", "rekap bulanan", "rincian"],
  },
  {
    label: "Transaksi",
    href: "/transaksi",
    group: "Ruang Kerja",
    icon: ArrowLeftRight,
    keywords: ["transaksi", "mutasi", "catatan", "uang", "riwayat", "keluar", "masuk"],
  },
  {
    label: "Laporan",
    href: "/laporan",
    group: "Ruang Kerja",
    icon: ChartNoAxesCombined,
    keywords: ["laporan", "report", "analisis", "grafik", "unduh", "rekap", "tahunan"],
  },
  {
    label: "Anggaran",
    href: "/anggaran",
    group: "Perencanaan",
    icon: Target,
    keywords: ["anggaran", "budget", "limit", "rencana", "batas"],
  },
  {
    label: "Target Tabungan",
    href: "/target-tabungan",
    group: "Perencanaan",
    icon: Trophy,
    keywords: ["target", "tabungan", "savings", "goals", "impian", "rencana masa depan"],
  },
  {
    label: "Kategori",
    href: "/kategori",
    group: "Perencanaan",
    icon: Tag,
    keywords: ["kategori", "category", "label", "pos pengeluaran", "kelompok"],
  },
  {
    label: "Pengaturan & Profil",
    href: "/pengaturan",
    group: "Lainnya",
    icon: Settings,
    keywords: ["pengaturan", "profil", "profile", "password", "kata sandi", "username", "nama", "tema", "settings"],
  },
];

export function Header({ onMenuClick }: HeaderProps) {
  const router = useRouter();
  const { resolvedTheme, setTheme } = useTheme();
  const { currency, activeRate, ratesPayload } = useCurrency();
  const [mounted, setMounted] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [searchFocused, setSearchFocused] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => setMounted(true), []);
  const isDark = mounted && resolvedTheme === "dark";

  // Filter menu items based on input
  const query = searchValue.trim().toLowerCase();
  const matchedMenus = query
    ? navigationMenus.filter(
        (item) =>
          item.label.toLowerCase().includes(query) ||
          item.keywords.some((k) => k.includes(query)),
      )
    : [];

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(event.target as Node)
      ) {
        setSearchFocused(false);
      }
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setSearchFocused(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!searchValue.trim()) return;
    setSearchFocused(false);
    if (matchedMenus.length > 0 && query.length < 15) {
      router.push(matchedMenus[0].href);
    } else {
      router.push(`/transaksi?search=${encodeURIComponent(searchValue.trim())}`);
    }
  }

  function handleSelectMenu(href: string) {
    setSearchFocused(false);
    setSearchValue("");
    router.push(href);
  }

  return (
    <header className="sticky top-0 z-30 flex min-h-18 items-center justify-between gap-3 border-b border-border/70 bg-[#f4f0fe]/95 dark:bg-[#0d0622]/95 px-4 sm:px-6 lg:px-8">
      {/* Left side: Mobile Menu + Search Pill */}
      <div className="flex min-w-0 flex-1 items-center gap-3">
        <button
          type="button"
          aria-label="Buka menu"
          onClick={onMenuClick}
          className="grid size-10 shrink-0 place-items-center rounded-xl bg-white dark:bg-[#191038] border border-border text-foreground-soft transition hover:bg-surface-alt lg:hidden"
        >
          <Menu size={20} />
        </button>

        {/* Global Search Bar with Menu Search */}
        <div ref={searchContainerRef} className="relative hidden sm:block w-full max-w-md">
          <form onSubmit={handleSearchSubmit} className="relative flex items-center">
            <Search
              size={17}
              className="pointer-events-none absolute left-3.5 text-muted transition-colors"
            />
            <input
              type="text"
              value={searchValue}
              onFocus={() => setSearchFocused(true)}
              onChange={(e) => {
                setSearchValue(e.target.value);
                setSearchFocused(true);
              }}
              placeholder="Cari menu, laporan, atau transaksi..."
              className="h-10.5 w-full rounded-full border border-border bg-white dark:bg-[#191038] pl-10 pr-9 text-xs sm:text-sm text-foreground outline-none transition-all placeholder:text-muted focus:border-primary focus:ring-2 focus:ring-primary/20 shadow-xs"
            />
            {searchValue && (
              <button
                type="button"
                onClick={() => setSearchValue("")}
                className="absolute right-3 grid size-5 place-items-center rounded-full text-muted hover:text-foreground"
              >
                <X size={13} />
              </button>
            )}
          </form>

          {/* Quick Search Dropdown Panel */}
          {searchFocused && (
            <div className="absolute left-0 top-12 z-50 w-full overflow-hidden rounded-2xl border border-border bg-white dark:bg-[#191038] p-2 shadow-xl animate-in fade-in-50 zoom-in-95 duration-150">
              {query && matchedMenus.length > 0 && (
                <div className="space-y-1">
                  <p className="px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted">
                    Navigasi Menu
                  </p>
                  {matchedMenus.map((item) => {
                    const Icon = item.icon;
                    return (
                      <button
                        key={item.href}
                        type="button"
                        onClick={() => handleSelectMenu(item.href)}
                        className="flex w-full items-center justify-between gap-3 rounded-xl px-3 py-2 text-left text-sm text-foreground transition hover:bg-surface-alt"
                      >
                        <div className="flex items-center gap-2.5">
                          <span className="grid size-7 place-items-center rounded-lg bg-primary-soft text-primary">
                            <Icon size={15} />
                          </span>
                          <span className="font-medium">{item.label}</span>
                        </div>
                        <span className="text-xs text-muted flex items-center gap-1">
                          {item.group} <ChevronRight size={13} />
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}

              {query && (
                <div className="mt-1 border-t border-border-soft pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      setSearchFocused(false);
                      router.push(`/transaksi?search=${encodeURIComponent(searchValue.trim())}`);
                    }}
                    className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-left text-xs text-primary font-medium transition hover:bg-primary-soft"
                  >
                    <Search size={14} />
                    <span>Cari transaksi &quot;{searchValue}&quot; di Transaksi</span>
                  </button>
                </div>
              )}

              {!query && (
                <div className="space-y-1 p-1">
                  <p className="px-2 py-1 text-[11px] font-semibold uppercase tracking-wider text-muted">
                    Menu Pintasan
                  </p>
                  <div className="grid grid-cols-2 gap-1">
                    {navigationMenus.slice(0, 4).map((item) => {
                      const Icon = item.icon;
                      return (
                        <button
                          key={item.href}
                          type="button"
                          onClick={() => handleSelectMenu(item.href)}
                          className="flex items-center gap-2 rounded-xl p-2 text-xs font-medium text-foreground-soft hover:bg-surface-alt transition"
                        >
                          <Icon size={14} className="text-primary" />
                          <span>{item.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Right side: Live FX Pill (when foreign currency), MonthPicker, Theme Toggle, Tambah Transaksi */}
      <div className="flex shrink-0 items-center gap-2 sm:gap-3">
        {/* Live Currency Indicator Pill when using USD / SGD / etc. */}
        {currency !== "IDR" && activeRate && (
          <Link
            href="/pengaturan?tab=preferences"
            title={
              activeRate.trend === "up"
                ? `${currency} menguat terhadap IDR (${activeRate.changePercent > 0 ? "+" : ""}${activeRate.changePercent}%)`
                : activeRate.trend === "down"
                  ? `IDR menguat terhadap ${currency} (${activeRate.changePercent}%)`
                  : `Kurs ${currency} stabil terhadap IDR`
            }
            className="hidden xl:inline-flex h-10.5 items-center gap-2 rounded-full border border-border bg-white dark:bg-[#191038] px-3.5 text-xs font-semibold text-foreground shadow-xs transition hover:border-primary/50"
          >
            <span
              className={`size-2 rounded-full ${
                ratesPayload.isLive ? "bg-emerald-500 animate-pulse" : "bg-amber-400"
              }`}
            />
            <span className="tabular-nums text-foreground-soft">
              1 {currency} = Rp {Math.round(activeRate.idrPerUnit).toLocaleString("id-ID")}
            </span>
            {activeRate.trend === "up" && (
              <span className="inline-flex items-center gap-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/70 px-2 py-0.5 text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                <TrendingUp size={12} strokeWidth={2.5} />
                +{Math.abs(activeRate.changePercent)}%
              </span>
            )}
            {activeRate.trend === "down" && (
              <span className="inline-flex items-center gap-0.5 rounded-full bg-rose-50 dark:bg-rose-950/70 px-2 py-0.5 text-[11px] font-bold text-rose-600 dark:text-rose-400">
                <TrendingDown size={12} strokeWidth={2.5} />
                -{Math.abs(activeRate.changePercent)}%
              </span>
            )}
          </Link>
        )}

        {/* Month Picker */}
        <div className="hidden sm:block">
          <Suspense
            fallback={
              <div className="h-10.5 w-48 animate-pulse rounded-full bg-surface" />
            }
          >
            <MonthPicker />
          </Suspense>
        </div>

        {/* Theme Switcher Button */}
        <button
          type="button"
          aria-label={isDark ? "Beralih ke mode terang" : "Beralih ke mode gelap"}
          title={isDark ? "Beralih ke Mode Terang" : "Beralih ke Mode Gelap"}
          onClick={() => setTheme(isDark ? "light" : "dark")}
          className="relative grid size-10.5 place-items-center rounded-full border border-border bg-white dark:bg-[#191038] text-muted shadow-xs transition hover:text-primary hover:border-primary/40 active:scale-95"
        >
          {isDark ? (
            <Sun size={18} strokeWidth={2.2} className="text-amber-400" />
          ) : (
            <Moon size={18} strokeWidth={2.2} className="text-primary" />
          )}
        </button>

        {/* Tambah Transaksi Action Button */}
        <Link
          href="/transaksi"
          className="flex h-10.5 items-center gap-2 rounded-full bg-primary hover:bg-primary-hover px-4 text-xs sm:text-sm font-semibold text-white shadow-md shadow-primary/20 transition-all active:scale-95"
        >
          <Plus size={16} strokeWidth={2.4} />
          <span className="hidden sm:inline">Tambah Transaksi</span>
          <span className="sm:hidden">Tambah</span>
        </Link>
      </div>

      {/* Mobile MonthPicker */}
      <div className="absolute left-4 top-19 sm:hidden">
        <Suspense
          fallback={
            <div className="h-10 w-48 animate-pulse rounded-full bg-surface" />
          }
        >
          <MonthPicker />
        </Suspense>
      </div>
    </header>
  );
}
