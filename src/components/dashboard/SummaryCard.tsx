import Link from "next/link";
import { ArrowDown, ArrowUpRight, ChevronRight, Target, Wallet } from "lucide-react";
import { Money } from "@/components/ui/Money";

type Tone = "balance" | "income" | "expense" | "budget";

type SummaryCardProps = {
  title: string;
  value: number;
  change: number | null;
  tone: Tone;
  href?: string;
};

const toneConfig = {
  balance: {
    icon: Wallet,
    iconBg: "bg-purple-50 text-[#5b3fc8] border border-purple-100 dark:bg-purple-950/60 dark:text-purple-300 dark:border-purple-800/40",
    sparklineColor: "#6366f1",
    sparklineGradient: "balanceGrad",
    href: "/ringkasan",
  },
  income: {
    icon: ArrowDown,
    iconBg: "bg-emerald-50 text-emerald-700 border border-emerald-100 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800/40",
    sparklineColor: "#10b981",
    sparklineGradient: "incomeGrad",
    href: "/transaksi?tipe=masuk",
  },
  expense: {
    icon: ArrowUpRight,
    iconBg: "bg-rose-50 text-rose-600 border border-rose-100 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-800/40",
    sparklineColor: "#f43f5e",
    sparklineGradient: "expenseGrad",
    href: "/transaksi?tipe=keluar",
  },
  budget: {
    icon: Target,
    iconBg: "bg-amber-50 text-amber-700 border border-amber-100 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800/40",
    sparklineColor: "#f59e0b",
    sparklineGradient: "budgetGrad",
    href: "/anggaran",
  },
} as const;

export function SummaryCard({ title, value, change, tone, href }: SummaryCardProps) {
  const config = toneConfig[tone];
  const Icon = config.icon;
  const linkHref = href ?? config.href;

  const isPositive =
    change !== null && (tone === "expense" ? change <= 0 : change >= 0);

  return (
    <Link
      href={linkHref}
      className="group relative flex flex-col justify-between overflow-hidden rounded-3xl border border-border bg-surface p-5 shadow-xs transition-all duration-200 hover:-translate-y-1 hover:shadow-md hover:border-primary/30"
    >
      {/* Top row: Icon + Title + Chevron */}
      <div>
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span
              className={`grid size-10 shrink-0 place-items-center rounded-2xl ${config.iconBg} shadow-2xs transition-transform group-hover:scale-105`}
            >
              <Icon size={19} strokeWidth={2.2} />
            </span>
            <p className="text-xs sm:text-sm font-medium text-muted">{title}</p>
          </div>
          <span className="grid size-6 place-items-center rounded-full text-muted transition group-hover:translate-x-0.5 group-hover:text-primary">
            <ChevronRight size={16} />
          </span>
        </div>

        {/* Nominal Value */}
        <div className="mt-4">
          <p className="text-xl sm:text-2xl font-bold tracking-tight text-foreground tabular-nums font-sans">
            <Money amount={value} />
          </p>
        </div>

        {/* Trend Indicator */}
        <div className="mt-2 flex items-center gap-1.5 text-[11px] sm:text-xs">
          {change === null ? (
            <span className="text-muted">Belum ada pembanding bulan lalu</span>
          ) : (
            <>
              <span
                className={`font-semibold ${
                  isPositive ? "text-emerald-600 dark:text-emerald-400" : "text-rose-500 dark:text-rose-400"
                }`}
              >
                {change >= 0 ? "↑" : "↓"} {Math.abs(change)}%
              </span>
              <span className="text-muted">dari bulan lalu</span>
            </>
          )}
        </div>
      </div>

      {/* Decorative Wave Sparkline at the bottom of the card matching screenshot */}
      <div className="relative -mb-5 -mx-5 mt-4 h-11 overflow-hidden opacity-80 transition-opacity group-hover:opacity-100">
        <svg viewBox="0 0 200 40" preserveAspectRatio="none" className="size-full">
          <defs>
            <linearGradient id={config.sparklineGradient} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={config.sparklineColor} stopOpacity={0.25} />
              <stop offset="100%" stopColor={config.sparklineColor} stopOpacity={0.0} />
            </linearGradient>
          </defs>
          {/* Filled Area Gradient */}
          <path
            d="M0 25 C40 10, 80 35, 120 18 C160 5, 180 20, 200 12 L200 40 L0 40 Z"
            fill={`url(#${config.sparklineGradient})`}
          />
          {/* Top Line Stroke */}
          <path
            d="M0 25 C40 10, 80 35, 120 18 C160 5, 180 20, 200 12"
            fill="none"
            stroke={config.sparklineColor}
            strokeWidth="2.5"
            strokeLinecap="round"
          />
        </svg>
      </div>
    </Link>
  );
}
