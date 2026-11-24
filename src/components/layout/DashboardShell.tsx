"use client";

import { Suspense, useEffect, useState, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { NavigationProgressBar } from "@/components/layout/NavigationProgressBar";
import { Sidebar } from "@/components/layout/Sidebar";

type DashboardShellProps = {
  children: ReactNode;
  userCard: ReactNode;
};

export function DashboardShell({ children, userCard }: DashboardShellProps) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setDrawerOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!drawerOpen) return;
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setDrawerOpen(false);
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [drawerOpen]);

  return (
    <div className="relative min-h-screen bg-page text-foreground overflow-x-clip selection:bg-primary-soft selection:text-primary">
      {/* Organic Fluid Waves Page Background matching the Sidebar aesthetic across all menus (pure SVG, zero blur lag) */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-0 select-none overflow-hidden"
      >
        {/* Base gradient matching sidebar tone in dark mode and soft lavender in light mode */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#f3effe] via-[#f7f5fe] to-[#ede5ff] dark:from-[#160a38] dark:via-[#0d0622] dark:to-[#070312]" />

        <svg
          viewBox="0 0 1440 1000"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="absolute inset-0 h-full w-full object-cover opacity-90 dark:opacity-100"
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient
              id="pageWaveTop"
              x1="1440"
              y1="0"
              x2="200"
              y2="460"
              gradientUnits="userSpaceOnUse"
            >
              <stop stopColor="#6e3cdb" stopOpacity="0.28" />
              <stop offset="1" stopColor="#481fa6" stopOpacity="0.06" />
            </linearGradient>
            <linearGradient
              id="pageWaveMid"
              x1="150"
              y1="260"
              x2="1440"
              y2="760"
              gradientUnits="userSpaceOnUse"
            >
              <stop stopColor="#8149eb" stopOpacity="0.24" />
              <stop offset="0.6" stopColor="#5d2cb8" stopOpacity="0.14" />
              <stop offset="1" stopColor="#3b1487" stopOpacity="0.04" />
            </linearGradient>
            <linearGradient
              id="pageWaveBot"
              x1="1440"
              y1="620"
              x2="0"
              y2="1000"
              gradientUnits="userSpaceOnUse"
            >
              <stop stopColor="#723dd6" stopOpacity="0.3" />
              <stop offset="1" stopColor="#250b59" stopOpacity="0.16" />
            </linearGradient>
          </defs>

          {/* Upper organic wave flowing from top-right */}
          <path
            d="M1440 0 V360 C1180 410 890 340 720 240 C510 120 260 190 0 130 V0 H1440 Z"
            fill="url(#pageWaveTop)"
          />

          {/* Middle fluid contour billowing across the workspace */}
          <path
            d="M0 340 C310 410 590 350 860 430 C1120 510 1240 610 1440 650 V420 C1210 370 1040 290 1110 210 C1190 130 1380 120 1440 70 C1220 130 850 200 590 230 C240 270 0 340 0 340 Z"
            fill="url(#pageWaveMid)"
          />

          {/* Lower organic wave */}
          <path
            d="M0 690 C420 630 710 690 980 780 C1230 865 1310 895 1440 910 V1000 H0 V690 Z"
            fill="url(#pageWaveBot)"
          />
        </svg>
      </div>

      <Suspense fallback={null}>
        <NavigationProgressBar />
      </Suspense>
      <Sidebar
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        userCard={userCard}
      />
      <div className="relative z-10 min-w-0 flex-1 lg:pl-66">
        <Header onMenuClick={() => setDrawerOpen(true)} />
        <main className="min-w-0 px-4 pb-8 pt-16 sm:px-6 lg:px-8 lg:pt-8">
          {children}
        </main>
      </div>
    </div>
  );
}
