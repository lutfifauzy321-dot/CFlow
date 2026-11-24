"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";

type DatePickerProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  id?: string;
  disabled?: boolean;
};

const WEEKDAYS = ["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"];

function parseIsoDate(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const [y, m, d] = value.split("-").map(Number);
  return { year: y, month: m - 1, day: d };
}

function toIsoDate(year: number, monthIndex: number, day: number) {
  return `${year}-${String(monthIndex + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

export function DatePicker({
  value,
  onChange,
  placeholder = "Pilih tanggal",
  id,
  disabled,
}: DatePickerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);

  const today = useMemo(() => {
    const now = new Date();
    return {
      year: now.getFullYear(),
      month: now.getMonth(),
      day: now.getDate(),
      iso: toIsoDate(now.getFullYear(), now.getMonth(), now.getDate()),
    };
  }, []);

  const parsed = parseIsoDate(value);
  const [viewYear, setViewYear] = useState(parsed?.year ?? today.year);
  const [viewMonth, setViewMonth] = useState(parsed?.month ?? today.month);

  useEffect(() => {
    if (open) {
      const p = parseIsoDate(value);
      setViewYear(p?.year ?? today.year);
      setViewMonth(p?.month ?? today.month);
    }
  }, [open, value, today.year, today.month]);

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

  const monthTitle = new Intl.DateTimeFormat("id-ID", {
    month: "long",
    year: "numeric",
  }).format(new Date(viewYear, viewMonth, 1));

  const displayLabel = parsed
    ? new Intl.DateTimeFormat("id-ID", {
        day: "numeric",
        month: "long",
        year: "numeric",
      }).format(new Date(parsed.year, parsed.month, parsed.day))
    : "";

  const firstDayOfMonth = new Date(viewYear, viewMonth, 1).getDay();
  // Convert Sunday=0..Saturday=6 into Monday=0..Sunday=6
  const leadingEmptyDays = (firstDayOfMonth + 6) % 7;
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();

  function shiftViewMonth(offset: number) {
    const next = new Date(viewYear, viewMonth + offset, 1);
    setViewYear(next.getFullYear());
    setViewMonth(next.getMonth());
  }

  function selectDay(day: number) {
    onChange(toIsoDate(viewYear, viewMonth, day));
    setOpen(false);
  }

  return (
    <div ref={containerRef} className="relative mt-1.5">
      <button
        id={id}
        type="button"
        disabled={disabled}
        onClick={() => setOpen((prev) => !prev)}
        className="flex h-11 w-full items-center justify-between gap-2 rounded-xl border border-border bg-surface px-3.5 text-left text-sm text-foreground outline-none transition hover:border-primary/50 focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:cursor-not-allowed disabled:opacity-60"
      >
        <span className={displayLabel ? "text-foreground" : "text-muted"}>
          {displayLabel || placeholder}
        </span>
        <CalendarDays size={16} className="shrink-0 text-primary" />
      </button>

      {open && (
        <div className="absolute left-0 z-70 mt-2 w-72 rounded-2xl border border-border bg-white dark:bg-[#191038] p-3.5 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
          {/* Month / Year Switcher */}
          <div className="mb-3 flex items-center justify-between">
            <button
              type="button"
              aria-label="Bulan sebelumnya"
              onClick={() => shiftViewMonth(-1)}
              className="grid size-8 place-items-center rounded-xl text-muted transition hover:bg-surface-alt hover:text-primary"
            >
              <ChevronLeft size={16} />
            </button>
            <span className="text-xs font-bold capitalize text-foreground">
              {monthTitle}
            </span>
            <button
              type="button"
              aria-label="Bulan berikutnya"
              onClick={() => shiftViewMonth(1)}
              className="grid size-8 place-items-center rounded-xl text-muted transition hover:bg-surface-alt hover:text-primary"
            >
              <ChevronRight size={16} />
            </button>
          </div>

          {/* Weekday Headers */}
          <div className="mb-1.5 grid grid-cols-7 gap-1 text-center text-[11px] font-semibold text-muted">
            {WEEKDAYS.map((day) => (
              <span key={day} className="py-1">
                {day}
              </span>
            ))}
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 gap-1">
            {Array.from({ length: leadingEmptyDays }).map((_, idx) => (
              <span key={`empty-${idx}`} />
            ))}
            {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((day) => {
              const iso = toIsoDate(viewYear, viewMonth, day);
              const isSelected = value === iso;
              const isToday = today.iso === iso;

              return (
                <button
                  key={day}
                  type="button"
                  onClick={() => selectDay(day)}
                  className={`grid size-8 place-items-center rounded-xl text-xs font-semibold tabular-nums transition ${
                    isSelected
                      ? "bg-primary text-white shadow-sm"
                      : isToday
                        ? "border border-primary/50 bg-primary-soft text-primary"
                        : "text-foreground-soft hover:bg-surface-alt hover:text-primary"
                  }`}
                >
                  {day}
                </button>
              );
            })}
          </div>

          {/* Footer Quick Action */}
          <div className="mt-3 flex items-center justify-between border-t border-border-soft pt-2.5">
            <button
              type="button"
              onClick={() => {
                onChange(today.iso);
                setOpen(false);
              }}
              className="rounded-lg px-2.5 py-1 text-xs font-semibold text-primary hover:bg-primary-soft transition"
            >
              Hari Ini
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
