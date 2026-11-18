import type { TransactionType } from "@/types";

export function TransactionBadge({ tipe }: { tipe: TransactionType }) {
  const isIncome = tipe === "masuk";

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${
        isIncome
          ? "bg-income-soft text-income-text"
          : "bg-expense-soft text-expense-text"
      }`}
    >
      <span
        aria-hidden="true"
        className={`size-1.5 rounded-full ${isIncome ? "bg-income" : "bg-expense"}`}
      />
      {isIncome ? "Masuk" : "Keluar"}
    </span>
  );
}
