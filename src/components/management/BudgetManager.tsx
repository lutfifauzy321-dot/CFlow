"use client";

import { useState, useTransition, type FormEvent } from "react";
import { AlertTriangle, Check, Save } from "lucide-react";
import { saveBudgetAction } from "@/actions/budget";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { formatRupiah } from "@/lib/utils/format";
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
  const [limits, setLimits] = useState<Record<string, string>>(() =>
    Object.fromEntries(progress.map((item) => [item.categoryId, item.limit ? String(item.limit) : ""])),
  );
  const [feedback, setFeedback] = useState<Record<string, string>>({});
  const [savingCategory, setSavingCategory] = useState<string>();
  const [isPending, startTransition] = useTransition();
  const overBudgetCount = progress.filter((item) => item.limit > 0 && item.spent > item.limit).length;

  function saveLimit(event: FormEvent<HTMLFormElement>, item: BudgetProgress) {
    event.preventDefault();
    const limitNominal = Number(limits[item.categoryId]);
    if (!Number.isSafeInteger(limitNominal) || limitNominal <= 0) {
      setFeedback((previous) => ({ ...previous, [item.categoryId]: "Masukkan batas anggaran lebih dari 0." }));
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
      setFeedback((previous) => ({
        ...previous,
        [item.categoryId]: result.success ? "Anggaran tersimpan." : result.error ?? "Anggaran gagal disimpan.",
      }));
    });
  }

  return (
    <div className="space-y-5">
      <section className="grid gap-3 sm:grid-cols-3" aria-label="Ringkasan anggaran">
        <div className="rounded-xl border border-border bg-surface p-4">
          <p className="text-xs font-medium text-muted">Total batas anggaran</p>
          <p className="mt-2 text-xl font-semibold tabular-nums text-foreground">{formatRupiah(totalLimit)}</p>
        </div>
        <div className="rounded-xl border border-border bg-surface p-4">
          <p className="text-xs font-medium text-muted">Total pengeluaran</p>
          <p className="mt-2 text-xl font-semibold tabular-nums text-foreground">{formatRupiah(totalSpent)}</p>
        </div>
        <div className="rounded-xl border border-border bg-surface p-4">
          <p className="text-xs font-medium text-muted">Kategori melewati batas</p>
          <p className={`mt-2 text-xl font-semibold tabular-nums ${overBudgetCount ? "text-expense" : "text-income"}`}>
            {overBudgetCount}
          </p>
        </div>
      </section>

      <section className="overflow-hidden rounded-xl border border-border bg-surface" aria-label="Anggaran per kategori">
        <div className="grid grid-cols-[minmax(150px,1fr)_minmax(170px,1fr)_minmax(180px,1.2fr)_120px] gap-4 border-b border-border-soft bg-surface-alt px-5 py-3 text-xs font-semibold uppercase text-muted max-md:hidden">
          <span>Kategori</span>
          <span>Pengeluaran / batas</span>
          <span>Progres</span>
          <span className="text-right">Batas baru</span>
        </div>

        {progress.length === 0 ? (
          <p className="px-5 py-14 text-center text-sm text-muted">
            Belum ada kategori pengeluaran. Tambahkan kategori terlebih dahulu.
          </p>
        ) : (
          <ul className="divide-y divide-border-soft">
            {progress.map((item) => {
              const overLimit = item.limit > 0 && item.spent > item.limit;
              const percentage = item.limit > 0 ? Math.round((item.spent / item.limit) * 100) : 0;
              return (
                <li key={item.categoryId} className="grid gap-4 px-4 py-4 sm:px-5 md:grid-cols-[minmax(150px,1fr)_minmax(170px,1fr)_minmax(180px,1.2fr)_120px] md:items-center">
                  <div className="flex min-w-0 items-center gap-2.5">
                    <span className="size-2.5 shrink-0 rounded-sm" style={{ backgroundColor: item.categoryColor }} />
                    <span className="truncate text-sm font-medium text-foreground-soft">{item.categoryName}</span>
                  </div>

                  <div className="text-sm tabular-nums">
                    <span className="font-semibold text-foreground-soft">{formatRupiah(item.spent)}</span>
                    <span className="text-muted-soft"> / {item.limit ? formatRupiah(item.limit) : "Belum diatur"}</span>
                  </div>

                  <div>
                    {item.limit > 0 ? (
                      <>
                        <div className="mb-1.5 flex items-center justify-between text-xs">
                          <span className={overLimit ? "font-semibold text-expense" : "text-muted"}>
                            {overLimit ? "Melewati batas" : `${percentage}% terpakai`}
                          </span>
                          <span className="tabular-nums text-muted-soft">{percentage}%</span>
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
                            Lebih {formatRupiah(item.spent - item.limit)} dari batas
                          </p>
                        )}
                      </>
                    ) : (
                      <span className="text-xs text-muted-soft">Atur batas untuk melihat progres</span>
                    )}
                  </div>

                  <form onSubmit={(event) => saveLimit(event, item)} className="flex items-center gap-2 md:justify-end">
                    <label className="sr-only" htmlFor={`budget-${item.categoryId}`}>Batas anggaran {item.categoryName}</label>
                    <input
                      id={`budget-${item.categoryId}`}
                      type="number"
                      min="1"
                      step="1"
                      inputMode="numeric"
                      value={limits[item.categoryId] ?? ""}
                      onChange={(event) => setLimits((previous) => ({ ...previous, [item.categoryId]: event.target.value }))}
                      placeholder="Nominal"
                      className="h-11 min-w-0 w-full rounded-lg border border-border bg-surface px-2.5 text-sm text-foreground-soft outline-none focus:border-primary focus:ring-2 focus:ring-focus/25 md:w-23"
                    />
                    <button
                      type="submit"
                      aria-label={`Simpan batas ${item.categoryName}`}
                      title="Simpan batas"
                      disabled={isPending}
                      className="grid size-11 shrink-0 place-items-center rounded-lg bg-primary-soft text-primary-strong transition hover:bg-primary-soft-hover disabled:opacity-50"
                    >
                      {savingCategory === item.categoryId ? <span className="size-4 animate-spin rounded-full border-2 border-primary/25 border-t-primary" /> : <Save size={16} />}
                    </button>
                  </form>
                  {feedback[item.categoryId] && (
                    <p className={`text-xs md:col-start-4 md:text-right ${feedback[item.categoryId] === "Anggaran tersimpan." ? "text-success" : "text-danger"}`} role="status">
                      {feedback[item.categoryId] === "Anggaran tersimpan." && <Check size={12} className="mr-1 inline" />}
                      {feedback[item.categoryId]}
                    </p>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}