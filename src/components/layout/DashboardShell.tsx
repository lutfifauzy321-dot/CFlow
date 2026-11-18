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
    <div className="relative min-h-screen bg-page text-foreground overflow-x-clip selection:bg-primary-soft selection:text-primary transition-colors">
      {/* Ambient background soft glow for the page matching reference mockup */}
      <div className="pointer-events-none fixed inset-0 -z-0 select-none overflow-hidden">
        {/* Top-right soft lavender ambient glow */}
        <div className="absolute -top-32 right-0 h-[480px] w-[480px] rounded-full bg-purple-200/30 dark:bg-purple-950/20 blur-3xl" />
        <div className="absolute bottom-10 left-1/3 h-96 w-96 rounded-full bg-purple-100/20 dark:bg-purple-950/10 blur-3xl" />
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
