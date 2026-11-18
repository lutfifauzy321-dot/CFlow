"use client";

import { useEffect } from "react";
import { Pencil, Plus, X } from "lucide-react";
import type { Category, Transaction } from "@/types";
import { TransactionForm } from "@/components/transaksi/TransactionForm";
import { saveTransactionAction } from "@/actions/transaction";
import type { TransactionInput } from "@/lib/validations/transaction";

type AddTransactionModalProps = {
  isOpen: boolean;
  categories: Category[];
  transaction?: Transaction | null;
  onClose: () => void;
  onSaved?: () => void;
};

export function AddTransactionModal({
  isOpen,
  categories,
  transaction,
  onClose,
  onSaved,
}: AddTransactionModalProps) {
  useEffect(() => {
    if (!isOpen) return;
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  async function save(values: TransactionInput) {
    return saveTransactionAction(values);
  }

  return (
    <div className="fixed inset-0 z-60 flex items-end justify-center sm:items-center sm:p-5">
      <button
        type="button"
        aria-label="Tutup dialog"
        onClick={onClose}
        className="absolute inset-0 bg-foreground/50"
      />
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="transaction-modal-title"
        className="relative max-h-[92vh] w-full max-w-140 overflow-y-auto rounded-t-xl border border-border bg-surface p-5 shadow-xl sm:rounded-xl sm:p-6"
      >
        <div className="mb-5 flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-primary-soft text-primary-strong">
              {transaction ? <Pencil size={18} /> : <Plus size={19} />}
            </span>
            <div>
              <h2
                id="transaction-modal-title"
                className="text-lg font-semibold text-foreground"
              >
                {transaction ? "Ubah transaksi" : "Tambah transaksi"}
              </h2>
              <p className="mt-1 text-sm text-muted">
                Lengkapi detail transaksi di bawah ini.
              </p>
            </div>
          </div>
          <button
            type="button"
            aria-label="Tutup"
            onClick={onClose}
            className="grid size-11 place-items-center rounded-lg text-muted transition hover:bg-surface-alt hover:text-foreground"
          >
            <X size={18} />
          </button>
        </div>
        <TransactionForm
          categories={categories}
          transaction={transaction}
          onSave={save}
          onCancel={onClose}
          onSuccess={onSaved ?? onClose}
        />
      </section>
    </div>
  );
}
