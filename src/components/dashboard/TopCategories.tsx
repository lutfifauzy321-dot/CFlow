import {
  Car,
  ChevronDown,
  ShoppingBag,
  Trophy,
  Utensils,
  Wallet,
  Zap,
} from "lucide-react";
import { formatRupiah } from "@/lib/utils/format";
import type { CategorySpending } from "@/services/dashboard.service";

const itemThemes = [
  {
    icon: Utensils,
    iconBg: "bg-purple-100 text-[#5b3fc8] dark:bg-purple-950/60 dark:text-purple-300",
    barColor: "bg-[#6366f1]",
  },
  {
    icon: Car,
    iconBg: "bg-rose-100 text-[#f43f5e] dark:bg-rose-950/60 dark:text-rose-300",
    barColor: "bg-[#f43f5e]",
  },
  {
    icon: ShoppingBag,
    iconBg: "bg-emerald-100 text-[#10b981] dark:bg-emerald-950/60 dark:text-emerald-300",
    barColor: "bg-[#10b981]",
  },
  {
    icon: Zap,
    iconBg: "bg-cyan-100 text-[#06b6d4] dark:bg-cyan-950/60 dark:text-cyan-300",
    barColor: "bg-[#06b6d4]",
  },
  {
    icon: Wallet,
    iconBg: "bg-amber-100 text-[#f59e0b] dark:bg-amber-950/60 dark:text-amber-300",
    barColor: "bg-[#f59e0b]",
  },
];

export function TopCategories({
  categories,
  total,
  bulanLabel,
}: {
  categories: CategorySpending[];
  total?: number;
  bulanLabel?: string;
}) {
  const maxAmount = categories[0]?.nominal ?? 1;
  const overallTotal = total && total > 0 ? total : categories.reduce((acc, c) => acc + c.nominal, 0);

  return (
    <section
      className="rounded-3xl border border-border/80 bg-surface p-5 sm:p-6 shadow-xs flex flex-col justify-between"
      aria-label="Kategori teratas"
    >
      {/* Header matching screenshot */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <span className="grid size-10 shrink-0 place-items-center rounded-2xl bg-purple-100 text-[#5b3fc8] dark:bg-purple-950/60 dark:text-purple-300 shadow-xs">
            <Trophy size={20} strokeWidth={2.2} />
          </span>
          <div>
            <h2 className="text-base sm:text-lg font-bold text-foreground font-sans">
              Kategori Teratas
            </h2>
            <p className="text-xs text-muted">
              Kategori dengan pengeluaran terbesar
            </p>
          </div>
        </div>

        {/* Month Pill Badge */}
        {bulanLabel && (
          <div className="hidden sm:flex items-center gap-1.5 rounded-full border border-border/80 bg-surface-alt px-3 py-1 text-xs font-medium text-foreground-soft">
            <span>{bulanLabel}</span>
            <ChevronDown size={14} className="text-muted" />
          </div>
        )}
      </div>

      {categories.length === 0 ? (
        <div className="grid min-h-60 place-items-center text-center">
          <p className="max-w-60 text-xs sm:text-sm leading-6 text-muted">
            Kategori akan muncul setelah transaksi keluar dicatat.
          </p>
        </div>
      ) : (
        <ul className="mt-5 space-y-4">
          {categories.slice(0, 5).map((category, index) => {
            const theme = itemThemes[index % itemThemes.length];
            const Icon = theme.icon;
            const percentage = overallTotal > 0 ? Math.round((category.nominal / overallTotal) * 100) : 0;
            const progressRatio = maxAmount > 0 ? Math.min(100, Math.round((category.nominal / maxAmount) * 100)) : 0;

            return (
              <li key={category.id} className="flex items-center gap-3">
                {/* Category Icon */}
                <span
                  className={`grid size-9 shrink-0 place-items-center rounded-xl ${theme.iconBg} shadow-xs`}
                >
                  <Icon size={16} strokeWidth={2.2} />
                </span>

                {/* Name + Progress Bar */}
                <div className="min-w-0 flex-1 space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-medium text-foreground-soft">
                    <span className="truncate">{category.nama}</span>
                  </div>
                  {/* Smooth Progress Bar */}
                  <div className="h-2 w-full overflow-hidden rounded-full bg-surface-alt">
                    <div
                      className={`h-full rounded-full ${theme.barColor} transition-all duration-500`}
                      style={{ width: `${progressRatio}%` }}
                    />
                  </div>
                </div>

                {/* Nominal & Percentage Badge */}
                <div className="flex shrink-0 items-center gap-3 text-right">
                  <span className="text-xs sm:text-sm font-semibold tabular-nums text-foreground">
                    {formatRupiah(category.nominal)}
                  </span>
                  <span className="min-w-8 text-right text-xs font-bold text-muted tabular-nums">
                    {percentage}%
                  </span>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
