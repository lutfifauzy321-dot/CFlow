"use client";

import {
  ArrowLeftRight,
  BarChart2,
  ChartNoAxesCombined,
  Home,
  Settings,
  Tag,
  Target,
  Trophy,
  ArrowRight,
} from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { BrandLogo } from "@/components/brand/BrandLogo";
import { SidebarItem } from "@/components/layout/SidebarItem";

type SidebarProps = {
  isOpen: boolean;
  onClose: () => void;
  userCard: ReactNode;
};

const navigationGroups = [
  {
    label: "RUANG KERJA",
    items: [
      { href: "/dashboard", label: "Dasbor", icon: Home },
      { href: "/ringkasan", label: "Ringkasan", icon: BarChart2 },
      { href: "/transaksi", label: "Transaksi", icon: ArrowLeftRight },
      { href: "/laporan", label: "Laporan", icon: ChartNoAxesCombined },
    ],
  },
  {
    label: "PERENCANAAN",
    items: [
      { href: "/anggaran", label: "Anggaran", icon: Target },
      { href: "/target-tabungan", label: "Target tabungan", icon: Trophy },
      { href: "/kategori", label: "Kategori", icon: Tag },
    ],
  },
  {
    label: "LAINNYA",
    items: [
      { href: "/pengaturan", label: "Pengaturan", icon: Settings },
    ],
  },
];

export function Sidebar({ isOpen, onClose, userCard }: SidebarProps) {
  const pathname = usePathname();
  const [pendingHref, setPendingHref] = useState<string | null>(null);

  useEffect(() => {
    setPendingHref(null);
  }, [pathname]);

  const activePath = pendingHref ?? pathname;

  function handleSelect(href: string) {
    if (href !== pathname) {
      setPendingHref(href);
    }
    onClose();
  }

  return (
    <>
      {isOpen && (
        <button
          type="button"
          aria-label="Tutup menu"
          onClick={onClose}
          className="fixed inset-0 z-40 bg-foreground/40 backdrop-blur-xs lg:hidden"
        />
      )}
      <aside
        aria-label="Navigasi utama"
        className={`fixed inset-y-0 left-0 z-40 flex w-66 flex-col overflow-hidden bg-gradient-to-b from-[#5024b3] via-[#341382] to-[#1d094d] dark:from-[#26105c] dark:via-[#140736] dark:to-[#090318] px-4 pb-4 pt-5 text-white shadow-2xl transition-transform duration-200 lg:fixed lg:inset-y-0 lg:left-0 lg:z-40 lg:h-screen lg:w-66 lg:shrink-0 lg:translate-x-0 lg:shadow-none ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Decorative organic fluid background waves matching reference mockup */}
        <div className="pointer-events-none absolute inset-0 select-none overflow-hidden">
          <svg
            viewBox="0 0 280 1000"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="absolute inset-0 h-full w-full object-cover"
            preserveAspectRatio="none"
          >
            <defs>
              <linearGradient id="sbGrad1" x1="280" y1="0" x2="0" y2="400" gradientUnits="userSpaceOnUse">
                <stop stopColor="#6e3cdb" stopOpacity="0.8" />
                <stop offset="1" stopColor="#481fa6" stopOpacity="0.15" />
              </linearGradient>
              <linearGradient id="sbGrad2" x1="0" y1="260" x2="280" y2="700" gradientUnits="userSpaceOnUse">
                <stop stopColor="#8149eb" stopOpacity="0.5" />
                <stop offset="0.6" stopColor="#5d2cb8" stopOpacity="0.25" />
                <stop offset="1" stopColor="#3b1487" stopOpacity="0.05" />
              </linearGradient>
              <linearGradient id="sbGrad3" x1="280" y1="650" x2="0" y2="1000" gradientUnits="userSpaceOnUse">
                <stop stopColor="#723dd6" stopOpacity="0.65" />
                <stop offset="1" stopColor="#250b59" stopOpacity="0.85" />
              </linearGradient>
            </defs>

            {/* Upper wave flowing in from top-right behind RUANG KERJA */}
            <path
              d="M280 0 V320 C230 350 165 320 135 250 C95 170 45 190 0 150 V0 H280 Z"
              fill="url(#sbGrad1)"
            />

            {/* Middle fluid contour billowing through PERENCANAAN */}
            <path
              d="M0 310 C60 360 115 340 165 395 C215 450 235 540 280 575 V405 C230 370 200 310 215 240 C235 180 275 155 280 105 C240 150 165 200 115 220 C45 250 0 310 0 310 Z"
              fill="url(#sbGrad2)"
            />

            {/* Lower organic wave behind promo card and user profile */}
            <path
              d="M0 660 C80 620 135 660 185 735 C235 810 250 850 280 860 V1000 H0 V660 Z"
              fill="url(#sbGrad3)"
            />
          </svg>
        </div>

        {/* Brand Header */}
        <div className="relative mb-5 flex h-10 items-center px-2">
          <BrandLogo />
        </div>

        {/* Navigation Menus */}
        <nav className="relative min-h-0 flex-1 space-y-4 overflow-y-auto pr-1" aria-label="Menu">
          {navigationGroups.map((group) => (
            <div key={group.label}>
              <p className="mb-2 px-3 text-[11px] font-semibold tracking-[0.14em] text-purple-200/60 uppercase">
                {group.label}
              </p>
              <ul className="space-y-1">
                {group.items.map((item) => (
                  <li key={item.href}>
                    <SidebarItem
                      {...item}
                      activePath={activePath}
                      isNavigatingToThis={pendingHref === item.href && pathname !== item.href}
                      onSelect={handleSelect}
                    />
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* Promotional / Feature Callout Card - navigates to Anggaran */}
          <div className="hidden min-[820px]:block pt-1">
            <Link
              href="/anggaran"
              prefetch={false}
              onClick={onClose}
              className="group block relative overflow-hidden rounded-2xl bg-white/14 p-3.5 border border-white/20 shadow-sm transition hover:bg-white/20 active:scale-[0.98]"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="space-y-2">
                  <p className="text-xs font-semibold leading-snug text-white transition-opacity group-hover:opacity-90">
                    Kelola keuangan lebih cerdas bersama CFlow!
                  </p>
                  <span className="inline-flex items-center gap-1 rounded-lg bg-white/20 group-hover:bg-white/30 px-2.5 py-1 text-[10px] font-semibold text-white transition-all shadow-xs">
                    Pelajari lebih lanjut <ArrowRight size={11} />
                  </span>
                </div>
                {/* Decorative plant in pot illustration matching screenshot */}
                <div className="relative size-9 shrink-0 select-none transition-transform group-hover:scale-105">
                  <svg viewBox="0 0 36 36" fill="none" className="size-full">
                    {/* Plant pot */}
                    <path d="M11 20H25L23 31H13L11 20Z" fill="#7e22ce" opacity="0.9" />
                    <rect x="9" y="17" width="18" height="4" rx="2" fill="#a855f7" />
                    {/* Plant stem & leaves */}
                    <path d="M18 17V8" stroke="#34d399" strokeWidth="2.5" strokeLinecap="round" />
                    <path d="M18 13C14 11 12 7 13 4C16 5 18 9 18 13Z" fill="#10b981" />
                    <path d="M18 9C22 7 24 3 23 0C20 1 18 5 18 9Z" fill="#34d399" />
                  </svg>
                </div>
              </div>
            </Link>
          </div>
        </nav>

        {/* User Card at bottom */}
        <div className="relative mt-4 border-t border-white/15 pt-3">
          {userCard}
        </div>
      </aside>
    </>
  );
}
