"use client";

import { useState, useTransition, type FormEvent } from "react";
import { AlertTriangle, Check, Save, ShieldAlert, Target, Wallet } from "lucide-react";
import { saveBudgetAction } from "@/actions/budget";
import { useCurrency } from "@/components/providers/CurrencyProvider";
import { useNotification } from "@/components/providers/NotificationProvider";
import { ProgressBar } from "@/components/ui/ProgressBar";
import type { BudgetProgress } from "@/services/budget.service";

type BudgetManagerProps = {
  bulan: string;
  progress: BudgetProgress[];
  totalLimit: number;
  totalSpent: number;
};

export function BudgetManager({
  bulan,
  progress,
  totalLimit,
  totalSpent,
}: BudgetManagerProps) {
  const { formatMoney } = useCurrency();
  const { toast } = useNotification();
  const [limits, setLimits] = useState<Record<string, string>>(() =>
    Object.fromEntries(
      progress.map((item) => [item.categoryId, item.limit ? String(item.limit) : ""]),
    ),
  );
  const [feedback, setFeedback] = useState<Record<string, string>>({});
  const [savingCategory, setSavingCategory] = useState<string>();
  const [isPending, startTransition] = useTransition();
  const overBudgetCount = progress.filter(
    (item) => item.limit > 0 && item.spent > item.limit,
  ).length;

  function saveLimit(event: FormEvent<HTMLFormElement>, item: BudgetProgress) {
    event.preventDefault();
    const limitNominal = Number(limits[item.categoryId]);
    if (!Number.isSafeInteger(limitNominal) || limitNominal <= 0) {
      setFeedback((previous) => ({
        ...previous,
        [item.categoryId]: "Masukkan batas anggaran lebih dari 0.",
      }));
      return;
    }

    setFeedback((previous) => ({ ...previous, [item.categoryId]: "" }));
    setSavingCategory(item.categoryId);
    startTransition(async () => {
      const result = await saveBudgetAction({
        categoryId: item.categoryId,
        bulan,
        limitNominal,
      });
      setSavingCategory(undefined);
      if (result.success) {
        toast.success(`Batas anggaran "${item.categoryName}" berhasil disimpan.`);
      } else {
        toast.error(result.error ?? "Anggaran gagal disimpan.");
      }
      setFeedback((previous) => ({
        ...previous,
        [item.categoryId]: result.success
          ? "Anggaran tersimpan."
          : result.error ?? "Anggaran gagal disimpan.",
      }));
    });
  }

  return (
    <div className="space-y-6">
      {/* Summary Metrics */}
      <section className="grid gap-4 sm:grid-cols-3" aria-label="Ringkasan anggaran">
        <div className="rounded-3xl border border-border/80 bg-surface p-5 shadow-xs">
          <div className="flex items-center gap-3">
            <span className="grid size-10 place-items-center rounded-2xl bg-primary-soft text-primary">
              <Target size={19} strokeWidth={2.2} />
            </span>
            <p className="text-xs font-medium text-muted">Total Batas Anggaran</p>
          </div>
          <p className="mt-4 text-xl sm:text-2xl font-bold tabular-nums text-foreground">
            {formatMoney(totalLimit)}
          </p>
        </div>

        <div className="rounded-3xl border border-border/80 bg-surface p-5 shadow-xs">
          <div className="flex items-center gap-3">
            <span className="grid size-10 place-items-center rounded-2xl bg-rose-50 text-rose-500 border border-rose-100 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-800/40">
              <Wallet size={19} strokeWidth={2.2} />
            </span>
            <p className="text-xs font-medium text-muted">Total Pengeluaran</p>
          </div>
          <p className="mt-4 text-xl sm:text-2xl font-bold tabular-nums text-foreground">
            {formatMoney(totalSpent)}
          </p>
        </div>

        <div className="rounded-3xl border border-border/80 bg-surface p-5 shadow-xs">
          <div className="flex items-center gap-3">
            <span
              className={`grid size-10 place-items-center rounded-2xl border ${
                overBudgetCount > 0
                  ? "bg-rose-50 text-rose-500 border-rose-100 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-800/40"
                  : "bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800/40"
              }`}
            >
              <ShieldAlert size={19} strokeWidth={2.2} />
            </span>
            <p className="text-xs font-medium text-muted">Kategori Melewati Batas</p>
          </div>
          <p
            className={`mt-4 text-xl sm:text-2xl font-bold tabular-nums ${
              overBudgetCount ? "text-expense" : "text-income"
            }`}
          >
            {overBudgetCount} <span className="text-xs font-medium text-muted">kategori</span>
          </p>
        </div>
      </section>

      {/* Budget List Table */}
      <section
        className="overflow-hidden rounded-3xl border border-border/80 bg-surface shadow-xs"
        aria-label="Anggaran per kategori"
      >
        <div className="hidden md:grid md:grid-cols-[minmax(160px,1.1fr)_minmax(180px,1fr)_minmax(190px,1.3fr)_210px] gap-4 border-b border-border-soft bg-surface-alt/70 px-6 py-3.5 text-xs font-semibold uppercase tracking-wide text-muted">
          <span>Kategori</span>
          <span>Terpakai / Batas</span>
          <span>Progres Pemakaian</span>
          <span className="text-right">Atur Batas (Rp)</span>
        </div>

        {progress.length === 0 ? (
          <p className="px-6 py-14 text-center text-sm text-muted">
            Belum ada kategori pengeluaran. Tambahkan kategori terlebih dahulu.
          </p>
        ) : (
          <ul className="divide-y divide-border-soft">
            {progress.map((item) => {
              const overLimit = item.limit > 0 && item.spent > item.limit;
              const percentage =
                item.limit > 0 ? Math.round((item.spent / item.limit) * 100) : 0;

              return (
                <li
                  key={item.categoryId}
                  className="grid gap-4 px-5 py-4 sm:px-6 md:grid-cols-[minmax(160px,1.1fr)_minmax(180px,1fr)_minmax(190px,1.3fr)_210px] md:items-center transition-colors hover:bg-surface-alt/40"
                >
                  {/* Kategori */}
                  <div className="flex min-w-0 items-center gap-3">
                    <span
                      className="size-3 shrink-0 rounded-full ring-4 ring-surface-alt"
                      style={{ backgroundColor: item.categoryColor }}
                    />
                    <span className="truncate text-sm font-semibold text-foreground-soft">
                      {item.categoryName}
                    </span>
                  </div>

                  {/* Pengeluaran / Batas */}
                  <div className="text-sm tabular-nums">
                    <span className="font-semibold text-foreground">
                      {formatMoney(item.spent)}
                    </span>
                    <span className="block text-xs text-muted md:inline md:text-sm">
                      {" "}
                      / {item.limit ? formatMoney(item.limit) : "Belum diatur"}
                    </span>
                  </div>

                  {/* Progress Bar */}
                  <div>
                    {item.limit > 0 ? (
                      <>
                        <div className="mb-1.5 flex items-center justify-between text-xs">
                          <span
                            className={
                              overLimit ? "font-semibold text-expense" : "text-muted"
                            }
                          >
                            {overLimit ? "Melewati batas" : `${percentage}% terpakai`}
                          </span>
                          <span className="font-semibold tabular-nums text-foreground-soft">
                            {percentage}%
                          </span>
                        </div>
                        <ProgressBar
                          value={item.spent}
                          max={item.limit}
                          color={overLimit ? "var(--expense)" : "var(--primary)"}
                          label={`Progres anggaran ${item.categoryName}`}
                        />
                        {overLimit && (
                          <p className="mt-1.5 flex items-center gap-1 text-xs font-medium text-expense">
                            <AlertTriangle size={13} />
                            Lebih {formatMoney(item.spent - item.limit)} dari batas
                          </p>
                        )}
                      </>
                    ) : (
                      <span className="inline-flex rounded-full bg-surface-alt px-2.5 py-1 text-xs text-muted">
                        Belum ada batas anggaran
                      </span>
                    )}
                  </div>

                  {/* Form Input Batas Baru */}
                  <div className="space-y-1.5">
                    <form
                      onSubmit={(event) => saveLimit(event, item)}
                      className="flex items-center gap-2 md:justify-end"
                    >
                      <label className="sr-only" htmlFor={`budget-${item.categoryId}`}>
                        Batas anggaran {item.categoryName}
                      </label>
                      <input
                        id={`budget-${item.categoryId}`}
                        type="number"
                        min="1"
                        step="1"
                        inputMode="numeric"
                        value={limits[item.categoryId] ?? ""}
                        onChange={(event) =>
                          setLimits((previous) => ({
                            ...previous,
                            [item.categoryId]: event.target.value,
                          }))
                        }
                        placeholder="Nominal"
                        className="h-10 min-w-0 flex-1 rounded-xl border border-border bg-surface px-3 text-sm text-foreground-soft outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20 md:w-36 md:flex-none"
                      />
                      <button
                        type="submit"
                        aria-label={`Simpan batas ${item.categoryName}`}
                        title="Simpan batas"
                        disabled={isPending}
                        className="grid size-10 shrink-0 place-items-center rounded-xl bg-primary-soft text-primary-strong transition hover:bg-primary hover:text-white disabled:opacity-50"
                      >
                        {savingCategory === item.categoryId ? (
                          <span className="size-4 animate-spin rounded-full border-2 border-primary/25 border-t-primary" />
                        ) : (
                          <Save size={16} />
                        )}
                      </button>
                    </form>
                    {feedback[item.categoryId] && (
                      <p
                        className={`text-xs md:text-right ${
                          feedback[item.categoryId] === "Anggaran tersimpan."
                            ? "text-success"
                            : "text-danger"
                        }`}
                        role="status"
                      >
                        {feedback[item.categoryId] === "Anggaran tersimpan." && (
                          <Check size={12} className="mr-1 inline" />
                        )}
                        {feedback[item.categoryId]}
                      </p>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}
