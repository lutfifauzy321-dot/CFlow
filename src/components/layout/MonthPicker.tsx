"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { CalendarDays, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

function currentMonth() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

function isValidMonth(value: string | null): value is string {
  return value !== null && /^\d{4}-(0[1-9]|1[0-2])$/.test(value);
}

function shiftMonth(value: string, offset: number) {
  const [year, month] = value.split("-").map(Number);
  const date = new Date(year, month - 1 + offset, 1);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

export function MonthPicker() {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const inputRef = useRef<HTMLInputElement>(null);

  const searchMonth = searchParams.get("bulan");
  const actualMonth = isValidMonth(searchMonth) ? searchMonth : currentMonth();

  // Optimistic UI state so the label updates immediately in 0ms!
  const [optimisticMonth, setOptimisticMonth] = useState<string | null>(null);

  // Sync state back when server finishes and searchParams updates
  useEffect(() => {
    setOptimisticMonth(null);
  }, [searchMonth]);

  const activeMonth = optimisticMonth ?? actualMonth;
  const [year, monthNumber] = activeMonth.split("-").map(Number);
  const monthLabel = new Intl.DateTimeFormat("id-ID", {
    month: "long",
    year: "numeric",
  }).format(new Date(year, monthNumber - 1, 1));

  const prevMonth = shiftMonth(activeMonth, -1);
  const nextMonth = shiftMonth(activeMonth, 1);

  // Background prefetch adjacent months (previous & next) so clicking is instantaneous!
  useEffect(() => {
    const prevParams = new URLSearchParams(searchParams.toString());
    prevParams.set("bulan", shiftMonth(actualMonth, -1));
    router.prefetch(`${pathname}?${prevParams.toString()}`);

    const nextParams = new URLSearchParams(searchParams.toString());
    nextParams.set("bulan", shiftMonth(actualMonth, 1));
    router.prefetch(`${pathname}?${nextParams.toString()}`);
  }, [pathname, searchParams, actualMonth, router]);

  function updateMonth(value: string) {
    if (!isValidMonth(value) || value === activeMonth) return;

    // 1. Instant 0ms optimistic label update
    setOptimisticMonth(value);

    // 2. Trigger top progress bar
    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event("app:navigation-start"));
    }

    // 3. Perform server transition
    const params = new URLSearchParams(searchParams.toString());
    params.set("bulan", value);
    startTransition(() => {
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    });
  }

  function handleOpenCalendar(e: React.MouseEvent) {
    e.preventDefault();
    if (inputRef.current) {
      try {
        if ("showPicker" in HTMLInputElement.prototype) {
          inputRef.current.showPicker();
        } else {
          inputRef.current.focus();
        }
      } catch {
        inputRef.current.focus();
      }
    }
  }

  return (
    <div className="flex h-10.5 items-center rounded-full border border-border bg-surface px-0.5 shadow-xs transition-colors">
      <button
        type="button"
        aria-label="Bulan sebelumnya"
        disabled={isPending}
        onClick={() => updateMonth(prevMonth)}
        className="grid size-9 place-items-center rounded-full text-muted transition active:scale-90 hover:bg-surface-alt hover:text-primary disabled:opacity-40"
      >
        <ChevronLeft size={16} />
      </button>

      <button
        type="button"
        aria-label="Buka kalender pilih bulan"
        onClick={handleOpenCalendar}
        className="group relative flex h-full min-w-34 cursor-pointer select-none items-center justify-center gap-2 px-2.5 text-xs sm:text-sm font-medium capitalize text-foreground-soft transition hover:text-primary active:scale-[0.98]"
      >
        {isPending ? (
          <Loader2 size={15} className="shrink-0 animate-spin text-primary" />
        ) : (
          <CalendarDays size={15} className="shrink-0 text-primary transition-transform group-hover:scale-110" />
        )}
        <span className={isPending ? "opacity-75 transition-opacity" : ""}>
          {monthLabel}
        </span>
        <input
          ref={inputRef}
          type="month"
          aria-label="Pilih bulan"
          value={activeMonth}
          onChange={(event) => updateMonth(event.target.value)}
          onClick={(event) => event.stopPropagation()}
          className="absolute inset-0 h-full w-full opacity-0 pointer-events-none"
          tabIndex={-1}
        />
      </button>

      <button
        type="button"
        aria-label="Bulan berikutnya"
        disabled={isPending}
        onClick={() => updateMonth(nextMonth)}
        className="grid size-9 place-items-center rounded-full text-muted transition active:scale-90 hover:bg-surface-alt hover:text-primary disabled:opacity-40"
      >
        <ChevronRight size={16} />
      </button>
    </div>
  );
}
