"use client";

import { useEffect, useState, useTransition, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Check, Plus, Target, Trash2, X } from "lucide-react";
import {
  addSavingsContributionAction,
  createSavingsGoalAction,
  deleteSavingsGoalAction,
} from "@/actions/saving";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { formatRupiah } from "@/lib/utils/format";
import {
  savingsGoalSchema,
  type SavingsGoalInput,
} from "@/lib/validations/management";
import type { SavingsGoal } from "@/types";

const fieldClassName =
  "mt-1.5 h-11 w-full rounded-lg border border-border bg-surface px-3 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-focus/25";

function GoalForm({
  onCancel,
  onSaved,
}: {
  onCancel: () => void;
  onSaved: () => void;
}) {
  const [serverError, setServerError] = useState<string>();
  const [isPending, startTransition] = useTransition();
  const form = useForm<SavingsGoalInput>({
    resolver: zodResolver(savingsGoalSchema),
    defaultValues: {
      nama: "",
      targetNominal: undefined,
      deadline: "",
    },
  });

  function submit(values: SavingsGoalInput) {
    setServerError(undefined);
    startTransition(async () => {
      const result = await createSavingsGoalAction(values);
      if (result.success) onSaved();
      else setServerError(result.error ?? "Target gagal disimpan.");
    });
  }

  return (
    <form onSubmit={form.handleSubmit(submit)} className="space-y-4">
      <label className="block text-sm font-medium text-foreground-soft">
        Nama target
        <input {...form.register("nama")} className={fieldClassName} placeholder="Contoh: Dana liburan" />
        {form.formState.errors.nama && <span className="mt-1 block text-xs text-danger">{form.formState.errors.nama.message}</span>}
      </label>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block text-sm font-medium text-foreground-soft">
          Nominal target (Rp)
          <input
            {...form.register("targetNominal", { valueAsNumber: true })}
            type="number"
            min="1"
            step="1"
            inputMode="numeric"
            className={fieldClassName}
            placeholder="0"
          />
          {form.formState.errors.targetNominal && <span className="mt-1 block text-xs text-danger">{form.formState.errors.targetNominal.message}</span>}
        </label>
        <label className="block text-sm font-medium text-foreground-soft">
          Target tercapai pada
          <input {...form.register("deadline")} type="date" className={fieldClassName} />
          {form.formState.errors.deadline && <span className="mt-1 block text-xs text-danger">{form.formState.errors.deadline.message}</span>}
        </label>
      </div>
      {serverError && <p role="alert" className="rounded-lg bg-danger-soft px-3 py-2.5 text-sm text-danger">{serverError}</p>}
      <div className="flex justify-end gap-2 border-t border-border-soft pt-4">
        <button type="button" onClick={onCancel} className="h-11 rounded-lg px-4 text-sm font-medium text-muted hover:bg-surface-alt">Batal</button>
        <button type="submit" disabled={isPending} className="h-11 rounded-lg bg-primary px-4 text-sm font-semibold text-on-primary hover:bg-primary-hover disabled:opacity-60">
          {isPending ? "Menyimpan..." : "Buat target"}
        </button>
      </div>
    </form>
  );
}

function GoalCard({
  goal,
  onDeleted,
}: {
  goal: SavingsGoal;
  onDeleted: (message?: string) => void;
}) {
  const [amount, setAmount] = useState("");
  const [feedback, setFeedback] = useState<string>();
  const [isPending, startTransition] = useTransition();
  const remaining = Math.max(0, goal.target_nominal - goal.terkumpul);
  const percentage = Math.min(100, Math.round((goal.terkumpul / goal.target_nominal) * 100));
  const completed = goal.terkumpul >= goal.target_nominal;

  function addContribution(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const contribution = Number(amount);
    if (!Number.isSafeInteger(contribution) || contribution <= 0) {
      setFeedback("Masukkan nominal setoran lebih dari 0.");
      return;
    }
    setFeedback(undefined);
    startTransition(async () => {
      const result = await addSavingsContributionAction({ goalId: goal.id, amount: contribution });
      if (result.success) {
        setAmount("");
        setFeedback("Setoran ditambahkan.");
        onDeleted();
      } else {
        setFeedback(result.error ?? "Setoran gagal ditambahkan.");
      }
    });
  }

  function removeGoal() {
    if (!window.confirm(`Hapus target "${goal.nama}"?`)) return;
    startTransition(async () => {
      const result = await deleteSavingsGoalAction(goal.id);
      onDeleted(result.success ? undefined : result.error ?? "Target gagal dihapus.");
    });
  }

  return (
    <article className="rounded-xl border border-border bg-surface p-5">
      <div className="flex items-start gap-3">
        <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-primary-soft text-primary-strong">
          <Target size={19} />
        </span>
        <div className="min-w-0 flex-1">
          <h2 className="truncate text-base font-semibold text-foreground-soft">{goal.nama}</h2>
          <p className="mt-1 text-xs text-muted">
            Tenggat {new Intl.DateTimeFormat("id-ID", { dateStyle: "long", timeZone: "UTC" }).format(new Date(`${goal.deadline}T00:00:00Z`))}
          </p>
        </div>
        <button
          type="button"
          onClick={removeGoal}
          disabled={isPending}
          aria-label={`Hapus target ${goal.nama}`}
          title="Hapus target"
          className="grid size-11 shrink-0 place-items-center rounded-lg text-expense hover:bg-expense-soft hover:text-expense-text disabled:opacity-50"
        >
          <Trash2 size={16} />
        </button>
      </div>

      <div className="mt-6 flex items-end justify-between gap-3">
        <div>
          <p className="text-xs text-muted">Terkumpul</p>
          <p className="mt-1 text-lg font-semibold tabular-nums text-foreground">{formatRupiah(goal.terkumpul)}</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-muted">Target</p>
          <p className="mt-1 text-sm font-medium tabular-nums text-foreground-soft">{formatRupiah(goal.target_nominal)}</p>
        </div>
      </div>
      <div className="mt-3 flex items-center gap-3">
        <ProgressBar value={goal.terkumpul} max={goal.target_nominal} color={completed ? "var(--income)" : "var(--primary)"} label={`Progres target ${goal.nama}`} />
        <span className="w-10 shrink-0 text-right text-xs font-semibold tabular-nums text-foreground-soft">{percentage}%</span>
      </div>
      <p className={`mt-2 text-xs ${completed ? "font-medium text-income" : "text-muted"}`}>
        {completed ? "Target tercapai" : `Kurang ${formatRupiah(remaining)}`}
      </p>

      <form onSubmit={addContribution} className="mt-5 flex gap-2 border-t border-border-soft pt-4">
        <label className="sr-only" htmlFor={`contribution-${goal.id}`}>Tambah setoran untuk {goal.nama}</label>
        <input
          id={`contribution-${goal.id}`}
          type="number"
          min="1"
          step="1"
          inputMode="numeric"
          value={amount}
          onChange={(event) => setAmount(event.target.value)}
          placeholder="Nominal setoran"
          className="h-11 min-w-0 flex-1 rounded-lg border border-border bg-surface px-3 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-focus/25"
        />
        <button type="submit" disabled={isPending} className="flex h-11 shrink-0 items-center gap-1.5 rounded-lg bg-primary-soft px-3 text-sm font-semibold text-primary-strong hover:bg-primary-soft-hover disabled:opacity-50">
          <Plus size={16} /> Setor
        </button>
      </form>
      {feedback && (
        <p role="status" className={`mt-2 text-xs ${feedback === "Setoran ditambahkan." ? "text-success" : "text-danger"}`}>
          {feedback === "Setoran ditambahkan." && <Check size={13} className="mr-1 inline" />}{feedback}
        </p>
      )}
    </article>
  );
}

export function SavingsGoalsManager({ goals }: { goals: SavingsGoal[] }) {
  const router = useRouter();
  const [showForm, setShowForm] = useState(false);
  const [pageError, setPageError] = useState<string>();
  const totalTarget = goals.reduce((sum, goal) => sum + goal.target_nominal, 0);
  const totalSaved = goals.reduce((sum, goal) => sum + goal.terkumpul, 0);

  useEffect(() => {
    if (!showForm) return;
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setShowForm(false);
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [showForm]);

  return (
    <div className="space-y-5">
      <section className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-xl border border-border bg-surface p-4">
          <p className="text-xs font-medium text-muted">Total target</p>
          <p className="mt-2 text-xl font-semibold tabular-nums text-foreground">{formatRupiah(totalTarget)}</p>
        </div>
        <div className="rounded-xl border border-border bg-surface p-4">
          <p className="text-xs font-medium text-muted">Total terkumpul</p>
          <p className="mt-2 text-xl font-semibold tabular-nums text-income">{formatRupiah(totalSaved)}</p>
        </div>
      </section>

      {pageError && <p role="alert" className="rounded-lg border border-danger bg-danger-soft px-4 py-3 text-sm text-danger">{pageError}</p>}

      {goals.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border bg-surface px-5 py-14 text-center">
          <span className="mx-auto grid size-11 place-items-center rounded-lg bg-primary-soft text-primary"><Target size={20} /></span>
          <p className="mt-3 text-sm font-semibold text-foreground-soft">Belum ada target tabungan</p>
          <p className="mt-1 text-sm text-muted">Buat target untuk mulai mengumpulkan tabungan.</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 2xl:grid-cols-3">
          {goals.map((goal) => (
            <GoalCard
              key={goal.id}
              goal={goal}
              onDeleted={(message) => {
                setPageError(message);
                if (!message) router.refresh();
              }}
            />
          ))}
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 z-60 flex items-end justify-center bg-foreground/50 sm:items-center sm:p-5">
          <section role="dialog" aria-modal="true" aria-labelledby="goal-title" className="w-full max-w-140 rounded-t-xl border border-border bg-surface p-5 shadow-xl sm:rounded-xl sm:p-6">
            <div className="mb-5 flex items-start justify-between">
              <div>
                <h2 id="goal-title" className="text-lg font-semibold text-foreground">Buat target tabungan</h2>
                <p className="mt-1 text-sm text-muted">Tentukan nominal dan tenggat yang ingin dicapai.</p>
              </div>
              <button type="button" aria-label="Tutup" onClick={() => setShowForm(false)} className="grid size-11 place-items-center rounded-lg text-muted hover:bg-surface-alt"><X size={18} /></button>
            </div>
            <GoalForm onCancel={() => setShowForm(false)} onSaved={() => { setShowForm(false); router.refresh(); }} />
          </section>
        </div>
      )}

      {!showForm && (
        <button type="button" onClick={() => setShowForm(true)} className="flex h-11 items-center gap-2 rounded-lg bg-primary px-4 text-sm font-semibold text-on-primary hover:bg-primary-hover">
          <Plus size={17} /> Buat target
        </button>
      )}
    </div>
  );
}