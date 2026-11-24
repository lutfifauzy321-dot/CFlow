"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { CalendarDays, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

const MONTH_SHORT_LABELS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "Mei",
  "Jun",
  "Jul",
  "Agt",
  "Sep",
  "Okt",
  "Nov",
  "Des",
];

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
  const containerRef = useRef<HTMLDivElement>(null);

  const searchMonth = searchParams.get("bulan");
  const actualMonth = isValidMonth(searchMonth) ? searchMonth : currentMonth();

  const [optimisticMonth, setOptimisticMonth] = useState<string | null>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setOptimisticMonth(null);
  }, [searchMonth]);

  const activeMonth = optimisticMonth ?? actualMonth;
  const [year, monthNumber] = activeMonth.split("-").map(Number);
  const [pickerYear, setPickerYear] = useState(year);

  useEffect(() => {
    if (open) setPickerYear(year);
  }, [open, year]);

  useEffect(() => {
    if (!open) return;
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  const monthLabel = new Intl.DateTimeFormat("id-ID", {
    month: "long",
    year: "numeric",
  }).format(new Date(year, monthNumber - 1, 1));

  const prevMonth = shiftMonth(activeMonth, -1);
  const nextMonth = shiftMonth(activeMonth, 1);
  const thisMonthIso = currentMonth();

  // Background prefetch adjacent months
  useEffect(() => {
    const prevParams = new URLSearchParams(searchParams.toString());
    prevParams.set("bulan", shiftMonth(actualMonth, -1));
    router.prefetch(`${pathname}?${prevParams.toString()}`);

    const nextParams = new URLSearchParams(searchParams.toString());
    nextParams.set("bulan", shiftMonth(actualMonth, 1));
    router.prefetch(`${pathname}?${nextParams.toString()}`);
  }, [pathname, searchParams, actualMonth, router]);

  function updateMonth(value: string) {
    setOpen(false);
    if (!isValidMonth(value) || value === activeMonth) return;

    setOptimisticMonth(value);

    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event("app:navigation-start"));
    }

    const params = new URLSearchParams(searchParams.toString());
    params.set("bulan", value);
    startTransition(() => {
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    });
  }

  return (
    <div ref={containerRef} className="relative">
      <div className="flex h-10.5 items-center rounded-full border border-border bg-white dark:bg-[#191038] px-0.5 shadow-xs transition-colors">
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
          aria-expanded={open}
          onClick={() => setOpen((prev) => !prev)}
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

      {/* Custom Sleek CFlow Month Picker Popover */}
      {open && (
        <div className="absolute right-0 top-12.5 z-50 w-72 rounded-3xl border border-border bg-white dark:bg-[#191038] p-4 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
          {/* Year Header */}
          <div className="mb-3.5 flex items-center justify-between">
            <button
              type="button"
              aria-label="Tahun sebelumnya"
              onClick={() => setPickerYear((y) => Math.max(2000, y - 1))}
              className="grid size-8 place-items-center rounded-xl text-muted transition hover:bg-surface-alt hover:text-primary"
            >
              <ChevronLeft size={16} />
            </button>
            <span className="text-sm font-bold tabular-nums text-foreground">
              {pickerYear}
            </span>
            <button
              type="button"
              aria-label="Tahun berikutnya"
              onClick={() => setPickerYear((y) => Math.min(2100, y + 1))}
              className="grid size-8 place-items-center rounded-xl text-muted transition hover:bg-surface-alt hover:text-primary"
            >
              <ChevronRight size={16} />
            </button>
          </div>

          {/* 4x3 Month Grid */}
          <div className="grid grid-cols-4 gap-1.5">
            {MONTH_SHORT_LABELS.map((label, index) => {
              const value = `${pickerYear}-${String(index + 1).padStart(2, "0")}`;
              const isSelected = value === activeMonth;
              const isCurrent = value === thisMonthIso;

              return (
                <button
                  key={value}
                  type="button"
                  onClick={() => updateMonth(value)}
                  className={`h-9 rounded-xl text-xs font-semibold transition ${
                    isSelected
                      ? "bg-primary text-white shadow-sm"
                      : isCurrent
                        ? "border border-primary/40 bg-primary-soft text-primary"
                        : "text-foreground-soft hover:bg-surface-alt hover:text-primary"
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>

          {/* Footer Quick Actions */}
          <div className="mt-3.5 flex items-center justify-between border-t border-border-soft pt-3">
            <button
              type="button"
              onClick={() => updateMonth(thisMonthIso)}
              className="rounded-lg px-2.5 py-1 text-xs font-semibold text-primary hover:bg-primary-soft transition"
            >
              Bulan Ini
            </button>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="rounded-lg px-2.5 py-1 text-xs font-medium text-muted hover:bg-surface-alt transition"
            >
              Tutup
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
