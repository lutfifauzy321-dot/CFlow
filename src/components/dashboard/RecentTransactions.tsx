import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { TransactionBadge } from "@/components/transaksi/TransactionBadge";
import { Money } from "@/components/ui/Money";
import type { Transaction } from "@/types";

type RecentTransaction = Transaction & { nama_kategori: string };

function formatDate(value: string) {
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(`${value}T00:00:00`));
}

export function RecentTransactions({
  transactions,
}: {
  transactions: RecentTransaction[];
}) {
  return (
    <section className="overflow-hidden rounded-3xl border border-border/80 bg-surface shadow-xs transition-colors" aria-label="Transaksi terbaru">
      <div className="flex items-center justify-between gap-4 border-b border-border-soft px-4 py-4 sm:px-5">
        <div>
          <h2 className="text-base font-semibold text-foreground">Transaksi terbaru</h2>
          <p className="mt-1 text-xs text-muted">Aktivitas keuangan terakhir</p>
        </div>
        <Link
          href="/transaksi"
          className="inline-flex shrink-0 items-center gap-1.5 text-sm font-semibold text-primary hover:text-primary-hover"
        >
          Lihat semua <ArrowRight size={16} />
        </Link>
      </div>

      {transactions.length === 0 ? (
        <p className="px-5 py-12 text-center text-sm text-muted">
          Belum ada transaksi yang tercatat.
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-140 border-collapse text-left">
            <thead>
              <tr className="border-b border-border-soft text-xs font-medium text-muted">
                <th scope="col" className="px-5 py-3">Keterangan</th>
                <th scope="col" className="px-5 py-3">Kategori</th>
                <th scope="col" className="px-5 py-3">Tanggal</th>
                <th scope="col" className="px-5 py-3 text-right">Nominal</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-soft">
              {transactions.map((transaction) => (
                <tr key={transaction.id} className="hover:bg-surface-alt">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-2.5">
                      <TransactionBadge tipe={transaction.tipe} />
                      <span className="max-w-52.5 truncate text-sm font-medium text-foreground-soft">
                        {transaction.keterangan}
                      </span>
                      {transaction.bukti_url && (
                        /* eslint-disable-next-line @next/next/no-img-element */
                        <img
                          src={transaction.bukti_url}
                          alt={`Bukti ${transaction.keterangan}`}
                          className="size-7 shrink-0 rounded-md object-cover border border-border shadow-2xs"
                        />
                      )}
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-sm text-muted">
                    {transaction.nama_kategori}
                  </td>
                  <td className="px-5 py-3.5 text-sm text-muted">
                    {formatDate(transaction.tanggal)}
                  </td>
                  <td
                    className={`px-5 py-3.5 text-right text-sm font-semibold tabular-nums ${
                      transaction.tipe === "masuk"
                        ? "text-income"
                        : "text-foreground"
                    }`}
                  >
                    {transaction.tipe === "masuk" ? "+" : "-"}
                    <Money amount={transaction.nominal} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
