"use client";

import { useEffect, useState, useTransition, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Check, PiggyBank, Plus, Target, Trash2, Trophy, X } from "lucide-react";
import { addSavingsContributionAction, createSavingsGoalAction, deleteSavingsGoalAction } from "@/actions/saving";
import { useCurrency } from "@/components/providers/CurrencyProvider";
import { useNotification } from "@/components/providers/NotificationProvider";
import { DatePicker } from "@/components/ui/DatePicker";
import { ProgressBar } from "@/components/ui/ProgressBar";
import {
  savingsGoalSchema,
  type SavingsGoalInput,
} from "@/lib/validations/management";
import type { SavingsGoal } from "@/types";

const fieldClassName =
  "mt-1.5 h-11 w-full rounded-xl border border-border bg-surface px-3.5 text-sm text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20";

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
        <input
          {...form.register("nama")}
          className={fieldClassName}
          placeholder="Contoh: Dana darurat / Liburan"
        />
        {form.formState.errors.nama && (
          <span className="mt-1 block text-xs text-danger">
            {form.formState.errors.nama.message}
          </span>
        )}
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
          {form.formState.errors.targetNominal && (
            <span className="mt-1 block text-xs text-danger">
              {form.formState.errors.targetNominal.message}
            </span>
          )}
        </label>
        <div className="block text-sm font-medium text-foreground-soft">
          <span>Target tercapai pada</span>
          <DatePicker
            value={form.watch("deadline")}
            onChange={(val) => form.setValue("deadline", val, { shouldValidate: true })}
            placeholder="Pilih tanggal tenggat"
          />
          {form.formState.errors.deadline && (
            <span className="mt-1 block text-xs text-danger">
              {form.formState.errors.deadline.message}
            </span>
          )}
        </div>
      </div>
      {serverError && (
        <p role="alert" className="rounded-xl bg-danger-soft px-3.5 py-2.5 text-sm text-danger">
          {serverError}
        </p>
      )}
      <div className="flex justify-end gap-2 border-t border-border-soft pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="h-10.5 rounded-xl px-4 text-sm font-medium text-muted hover:bg-surface-alt transition"
        >
          Batal
        </button>
        <button
          type="submit"
          disabled={isPending}
          className="h-10.5 rounded-xl bg-primary px-5 text-sm font-semibold text-on-primary shadow-sm hover:bg-primary-hover transition disabled:opacity-60"
        >
          {isPending ? "Menyimpan..." : "Buat target"}
        </button>
      </div>
    </form>
  );
}

function GoalCard({
  goal,
  onUpdated,
}: {
  goal: SavingsGoal;
  onUpdated: (message?: string) => void;
}) {
  const { formatMoney } = useCurrency();
  const { confirm, toast } = useNotification();
  const [amount, setAmount] = useState("");
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; text: string }>();
  const [isPending, startTransition] = useTransition();
  const remaining = Math.max(0, goal.target_nominal - goal.terkumpul);
  const percentage = Math.min(100, Math.round((goal.terkumpul / goal.target_nominal) * 100));
  const completed = goal.terkumpul >= goal.target_nominal;

  function submitContribution(contribution: number) {
    if (!Number.isSafeInteger(contribution) || contribution <= 0) {
      setFeedback({ type: "error", text: "Masukkan nominal setoran lebih dari 0." });
      return;
    }
    setFeedback(undefined);
    startTransition(async () => {
      const result = await addSavingsContributionAction({
        goalId: goal.id,
        amount: contribution,
      });
      if (result.success) {
        setAmount("");
        setFeedback({ type: "success", text: "Setoran berhasil ditambahkan." });
        toast.success(`Setoran untuk "${goal.nama}" berhasil ditambahkan.`);
        onUpdated();
      } else {
        const msg = result.error ?? "Setoran gagal ditambahkan.";
        setFeedback({ type: "error", text: msg });
        toast.error(msg);
      }
    });
  }

  function addContribution(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    submitContribution(Number(amount));
  }

  async function removeGoal() {
    const ok = await confirm({
      title: "Hapus Target Tabungan",
      message: `Apakah Anda yakin ingin menghapus target "${goal.nama}"? Progres tabungan pada target ini akan ikut terhapus.`,
      confirmLabel: "Ya, Hapus",
    });
    if (!ok) return;
    startTransition(async () => {
      const result = await deleteSavingsGoalAction(goal.id);
      if (result.success) {
        toast.success(`Target "${goal.nama}" berhasil dihapus.`);
        onUpdated();
      } else {
        const msg = result.error ?? "Target gagal dihapus.";
        toast.error(msg);
        onUpdated(msg);
      }
    });
  }

  return (
    <article className="flex flex-col justify-between rounded-3xl border border-border/80 bg-surface p-5 shadow-xs transition hover:shadow-md">
      <div>
        <div className="flex items-start gap-3">
          <span
            className={`grid size-10 shrink-0 place-items-center rounded-2xl ${
              completed
                ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-300"
                : "bg-primary-soft text-primary-strong"
            }`}
          >
            {completed ? <Trophy size={19} /> : <Target size={19} />}
          </span>
          <div className="min-w-0 flex-1">
            <h2 className="truncate text-base font-bold text-foreground">{goal.nama}</h2>
            <p className="mt-0.5 text-xs text-muted">
              Tenggat{" "}
              {new Intl.DateTimeFormat("id-ID", {
                dateStyle: "long",
                timeZone: "UTC",
              }).format(new Date(`${goal.deadline}T00:00:00Z`))}
            </p>
          </div>
          <button
            type="button"
            onClick={removeGoal}
            disabled={isPending}
            aria-label={`Hapus target ${goal.nama}`}
            title="Hapus target"
            className="grid size-9 shrink-0 place-items-center rounded-xl text-danger hover:bg-danger-soft disabled:opacity-50 transition"
          >
            <Trash2 size={16} />
          </button>
        </div>

        <div className="mt-5 flex items-end justify-between gap-3">
          <div>
            <p className="text-xs text-muted">Terkumpul</p>
            <p className="mt-1 text-lg font-bold tabular-nums text-foreground">
              {formatMoney(goal.terkumpul)}
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs text-muted">Target</p>
            <p className="mt-1 text-sm font-semibold tabular-nums text-foreground-soft">
              {formatMoney(goal.target_nominal)}
            </p>
          </div>
        </div>

        <div className="mt-3 flex items-center gap-3">
          <ProgressBar
            value={goal.terkumpul}
            max={goal.target_nominal}
            color={completed ? "var(--income)" : "var(--primary)"}
            label={`Progres target ${goal.nama}`}
          />
          <span className="w-10 shrink-0 text-right text-xs font-bold tabular-nums text-foreground-soft">
            {percentage}%
          </span>
        </div>

        <p className={`mt-2 text-xs ${completed ? "font-semibold text-income" : "text-muted"}`}>
          {completed ? "Target tabungan tercapai!" : `Kurang ${formatMoney(remaining)} lagi`}
        </p>
      </div>

      <div className="mt-5 border-t border-border-soft pt-4 space-y-2.5">
        <div className="flex flex-wrap gap-1.5">
          {[50000, 100000, 500000].map((quick) => (
            <button
              key={quick}
              type="button"
              disabled={isPending}
              onClick={() => setAmount(String(quick))}
              className="rounded-lg border border-border bg-surface-alt/70 px-2.5 py-1 text-[11px] font-semibold text-foreground-soft hover:border-primary/40 hover:text-primary transition"
            >
              +Rp {(quick / 1000).toLocaleString("id-ID")}rb
            </button>
          ))}
        </div>

        <form onSubmit={addContribution} className="flex gap-2">
          <label className="sr-only" htmlFor={`contribution-${goal.id}`}>
            Tambah setoran untuk {goal.nama}
          </label>
          <input
            id={`contribution-${goal.id}`}
            type="number"
            min="1"
            step="1"
            inputMode="numeric"
            value={amount}
            onChange={(event) => setAmount(event.target.value)}
            placeholder="Nominal setoran (Rp)"
            className="h-10.5 min-w-0 flex-1 rounded-xl border border-border bg-surface px-3 text-sm text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
          />
          <button
            type="submit"
            disabled={isPending}
            className="flex h-10.5 shrink-0 items-center gap-1.5 rounded-xl bg-primary px-3.5 text-xs sm:text-sm font-semibold text-white shadow-xs hover:bg-primary-hover transition disabled:opacity-50"
          >
            <Plus size={15} /> Setor
          </button>
        </form>

        {feedback && (
          <p
            role="status"
            className={`text-xs ${
              feedback.type === "success" ? "text-success font-medium" : "text-danger"
            }`}
          >
            {feedback.type === "success" && <Check size={13} className="mr-1 inline" />}
            {feedback.text}
          </p>
        )}
      </div>
    </article>
  );
}

export function SavingsGoalsManager({ goals }: { goals: SavingsGoal[] }) {
  const router = useRouter();
  const { formatMoney } = useCurrency();
  const { toast } = useNotification();
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
    <div className="space-y-6">
      {/* Summary + Action Bar */}
      <section className="grid gap-4 sm:grid-cols-[1fr_1fr_auto] sm:items-stretch">
        <div className="rounded-3xl border border-border/80 bg-surface p-5 shadow-xs">
          <div className="flex items-center gap-3">
            <span className="grid size-10 place-items-center rounded-2xl bg-primary-soft text-primary">
              <Target size={19} strokeWidth={2.2} />
            </span>
            <p className="text-xs font-medium text-muted">Total Target Tabungan</p>
          </div>
          <p className="mt-4 text-xl sm:text-2xl font-bold tabular-nums text-foreground">
            {formatMoney(totalTarget)}
          </p>
        </div>

        <div className="rounded-3xl border border-border/80 bg-surface p-5 shadow-xs">
          <div className="flex items-center gap-3">
            <span className="grid size-10 place-items-center rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-100 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800/40">
              <PiggyBank size={19} strokeWidth={2.2} />
            </span>
            <p className="text-xs font-medium text-muted">Total Terkumpul</p>
          </div>
          <p className="mt-4 text-xl sm:text-2xl font-bold tabular-nums text-income">
            {formatMoney(totalSaved)}
          </p>
        </div>

        <div className="flex items-center">
          <button
            type="button"
            onClick={() => setShowForm(true)}
            className="flex h-12 w-full sm:w-auto items-center justify-center gap-2 rounded-2xl bg-primary px-5 text-sm font-semibold text-white shadow-sm hover:bg-primary-hover transition active:scale-95"
          >
            <Plus size={18} strokeWidth={2.4} />
            <span>Buat Target</span>
          </button>
        </div>
      </section>

      {pageError && (
        <p role="alert" className="rounded-2xl border border-danger bg-danger-soft px-4 py-3 text-sm text-danger">
          {pageError}
        </p>
      )}

      {goals.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-border bg-surface px-5 py-16 text-center">
          <span className="mx-auto grid size-12 place-items-center rounded-2xl bg-primary-soft text-primary">
            <Target size={22} />
          </span>
          <p className="mt-3 text-sm font-semibold text-foreground-soft">
            Belum ada target tabungan
          </p>
          <p className="mt-1 text-sm text-muted">
            Buat target pertamamu untuk mulai mengumpulkan tabungan secara terarah.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 2xl:grid-cols-3">
          {goals.map((goal) => (
            <GoalCard
              key={goal.id}
              goal={goal}
              onUpdated={(message) => {
                setPageError(message);
                if (!message) router.refresh();
              }}
            />
          ))}
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 z-60 flex items-end justify-center bg-foreground/50 backdrop-blur-xs sm:items-center sm:p-5">
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="goal-title"
            className="w-full max-w-140 rounded-t-3xl border border-border bg-white/95 dark:bg-[#161032]/95 p-5 shadow-2xl sm:rounded-3xl sm:p-6"
          >
            <div className="mb-5 flex items-start justify-between">
              <div>
                <h2 id="goal-title" className="text-lg font-bold text-foreground">
                  Buat target tabungan
                </h2>
                <p className="mt-1 text-sm text-muted">
                  Tentukan nominal dan tenggat yang ingin dicapai.
                </p>
              </div>
              <button
                type="button"
                aria-label="Tutup"
                onClick={() => setShowForm(false)}
                className="grid size-10 place-items-center rounded-xl text-muted hover:bg-surface-alt transition"
              >
                <X size={18} />
              </button>
            </div>
            <GoalForm
              onCancel={() => setShowForm(false)}
              onSaved={() => {
                setShowForm(false);
                toast.success("Target tabungan baru berhasil dibuat.");
                router.refresh();
              }}
            />
          </section>
        </div>
      )}
    </div>
  );
}
