"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ChevronLeft,
  ChevronRight,
  Pencil,
  Plus,
  Search,
  Trash2,
  X,
} from "lucide-react";
import { deleteTransactionAction } from "@/actions/transaction";
import { AddTransactionModal } from "@/components/transaksi/AddTransactionModal";
import { useCurrency } from "@/components/providers/CurrencyProvider";
import { useNotification } from "@/components/providers/NotificationProvider";
import { TransactionBadge } from "@/components/transaksi/TransactionBadge";
import type { Category, Transaction, TransactionType } from "@/types";

type TransactionFilters = {
  bulan: string;
  tipe: TransactionType | "";
  kategori: string;
  search: string;
};

type TransactionTableProps = {
  transactions: Transaction[];
  categories: Category[];
  total: number;
  page: number;
  pageSize: number;
  filters: TransactionFilters;
};

function pageHref(filters: TransactionFilters, page: number) {
  const params = new URLSearchParams({ bulan: filters.bulan });
  if (filters.tipe) params.set("tipe", filters.tipe);
  if (filters.kategori) params.set("kategori", filters.kategori);
  if (filters.search) params.set("search", filters.search);
  params.set("page", String(page));
  return `/transaksi?${params.toString()}`;
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(`${value}T00:00:00`));
}

export function TransactionTable({
  transactions,
  categories,
  total,
  page,
  pageSize,
  filters,
}: TransactionTableProps) {
  const router = useRouter();
  const { formatMoney } = useCurrency();
  const { confirm, toast } = useNotification();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [deletingId, setDeletingId] = useState<string>();
  const [deleteError, setDeleteError] = useState<string>();
  const [isPending, startTransition] = useTransition();
  const [previewBukti, setPreviewBukti] = useState<{
    url: string;
    keterangan: string;
  } | null>(null);

  const categoryNames = new Map(categories.map((category) => [category.id, category.nama]));
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const firstItem = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const lastItem = Math.min(page * pageSize, total);

  function openAddModal() {
    setEditingTransaction(null);
    setModalOpen(true);
  }

  function openEditModal(transaction: Transaction) {
    setEditingTransaction(transaction);
    setModalOpen(true);
  }

  async function removeTransaction(transaction: Transaction) {
    const ok = await confirm({
      title: "Hapus Transaksi",
      message: `Apakah Anda yakin ingin menghapus transaksi "${transaction.keterangan}"? Data yang dihapus tidak dapat dikembalikan.`,
      confirmLabel: "Ya, Hapus",
    });
    if (!ok) return;
    setDeleteError(undefined);
    setDeletingId(transaction.id);
    startTransition(async () => {
      const result = await deleteTransactionAction(transaction.id);
      setDeletingId(undefined);
      if (result.success) {
        toast.success(`Transaksi "${transaction.keterangan}" berhasil dihapus.`);
        router.refresh();
      } else {
        const msg = result.error ?? "Transaksi gagal dihapus.";
        setDeleteError(msg);
        toast.error(msg);
      }
    });
  }

  function closeModal() {
    setModalOpen(false);
    setEditingTransaction(null);
  }

  return (
    <section className="space-y-4" aria-label="Daftar transaksi">
      <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
        <form
          action="/transaksi"
          method="get"
          className="grid grid-cols-1 gap-2 sm:grid-cols-2 xl:flex xl:flex-1 xl:items-center"
        >
          <input type="hidden" name="bulan" value={filters.bulan} />
          <label className="relative block sm:col-span-2 xl:max-w-75 xl:flex-1">
            <span className="sr-only">Cari transaksi</span>
            <Search
              aria-hidden="true"
              size={17}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted"
            />
            <input
              type="search"
              name="search"
              defaultValue={filters.search}
              placeholder="Cari keterangan..."
              maxLength={100}
              className="h-11 w-full rounded-xl border border-border bg-surface pl-9 pr-3 text-sm text-foreground outline-none transition placeholder:text-muted focus:border-primary focus:ring-2 focus:ring-primary/25 shadow-xs"
            />
          </label>
          <label>
            <span className="sr-only">Filter jenis</span>
            <select
              name="tipe"
              defaultValue={filters.tipe}
              className="h-11 w-full rounded-xl border border-border bg-surface px-3 text-sm text-foreground-soft outline-none focus:border-primary focus:ring-2 focus:ring-primary/25 sm:min-w-35 shadow-xs"
            >
              <option value="">Semua jenis</option>
              <option value="masuk">Masuk (Pemasukan)</option>
              <option value="keluar">Keluar (Pengeluaran)</option>
            </select>
          </label>
          <label>
            <span className="sr-only">Filter kategori</span>
            <select
              name="kategori"
              defaultValue={filters.kategori}
              className="h-11 w-full rounded-xl border border-border bg-surface px-3 text-sm text-foreground-soft outline-none focus:border-primary focus:ring-2 focus:ring-primary/25 sm:min-w-41.25 shadow-xs"
            >
              <option value="">Semua kategori</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.nama}
                </option>
              ))}
            </select>
          </label>
          <div className="flex items-center gap-2">
            <button
              type="submit"
              className="h-11 rounded-xl bg-primary-soft px-4 text-sm font-semibold text-primary transition hover:bg-primary-soft/80"
            >
              Terapkan
            </button>
            {(filters.search || filters.tipe || filters.kategori) && (
              <Link
                href={`/transaksi?bulan=${encodeURIComponent(filters.bulan)}`}
                className="min-h-11 px-2 flex items-center text-sm font-medium text-muted hover:text-primary transition"
              >
                Reset
              </Link>
            )}
          </div>
        </form>

        <button
          type="button"
          onClick={openAddModal}
          className="flex h-11 shrink-0 items-center justify-center gap-2 rounded-xl bg-primary px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-primary-hover active:scale-95"
        >
          <Plus size={17} strokeWidth={2.4} />
          Tambah transaksi
        </button>
      </div>

      {deleteError && (
        <p
          role="alert"
          className="rounded-xl border border-danger bg-danger-soft px-4 py-3 text-sm text-danger"
        >
          {deleteError}
        </p>
      )}

      <div className="overflow-hidden rounded-3xl border border-border/80 bg-surface shadow-xs transition-colors">
        <div className="overflow-x-auto">
          <table className="w-full min-w-200 border-collapse text-left">
            <thead>
              <tr className="border-b border-border-soft bg-surface-alt/70 text-xs font-semibold uppercase tracking-wide text-muted">
                <th scope="col" className="px-5 py-3.5">Tanggal</th>
                <th scope="col" className="px-5 py-3.5">Keterangan</th>
                <th scope="col" className="px-5 py-3.5">Kategori</th>
                <th scope="col" className="px-5 py-3.5">Jenis</th>
                <th scope="col" className="px-5 py-3.5">Bukti</th>
                <th scope="col" className="px-5 py-3.5 text-right">Nominal</th>
                <th scope="col" className="px-5 py-3.5 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-soft">
              {transactions.map((transaction) => (
                <tr key={transaction.id} className="group transition-colors hover:bg-surface-alt/50">
                  <td className="whitespace-nowrap px-5 py-4 text-sm text-muted">
                    {formatDate(transaction.tanggal)}
                  </td>
                  <td className="max-w-65 px-5 py-4">
                    <span className="block truncate text-sm font-medium text-foreground-soft">
                      {transaction.keterangan}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-sm text-foreground-soft">
                    {categoryNames.get(transaction.category_id) ?? "Kategori dihapus"}
                  </td>
                  <td className="px-5 py-4">
                    <TransactionBadge tipe={transaction.tipe} />
                  </td>
                  <td className="px-5 py-4">
                    {transaction.bukti_url ? (
                      <button
                        type="button"
                        onClick={() =>
                          setPreviewBukti({
                            url: transaction.bukti_url!,
                            keterangan: transaction.keterangan,
                          })
                        }
                        className="group/img relative inline-flex items-center gap-2 rounded-xl border border-border bg-surface p-1 pr-2.5 text-xs font-medium text-foreground hover:border-primary hover:text-primary transition shadow-2xs"
                        title="Klik untuk memperbesar foto bukti transaksi"
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={transaction.bukti_url}
                          alt={`Bukti ${transaction.keterangan}`}
                          className="size-8 rounded-lg object-cover border border-border/60"
                        />
                        <span className="hidden sm:inline">Lihat</span>
                      </button>
                    ) : (
                      <span className="text-xs text-muted/60">-</span>
                    )}
                  </td>
                  <td
                    className={`whitespace-nowrap px-5 py-4 text-right text-sm font-semibold tabular-nums ${
                      transaction.tipe === "masuk" ? "text-income" : "text-expense"
                    }`}
                  >
                    {transaction.tipe === "masuk" ? "+ " : "- "}
                    {formatMoney(transaction.nominal)}
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex justify-end gap-1">
                      <button
                        type="button"
                        onClick={() => openEditModal(transaction)}
                        aria-label={`Ubah transaksi ${transaction.keterangan}`}
                        title="Ubah transaksi"
                        className="grid size-9 place-items-center rounded-lg text-muted transition hover:bg-primary-soft hover:text-primary"
                      >
                        <Pencil size={15} />
                      </button>
                      <button
                        type="button"
                        onClick={() => removeTransaction(transaction)}
                        disabled={isPending}
                        aria-label={`Hapus transaksi ${transaction.keterangan}`}
                        title="Hapus transaksi"
                        className="grid size-9 place-items-center rounded-lg text-danger transition hover:bg-danger-soft hover:text-danger disabled:opacity-50"
                      >
                        {deletingId === transaction.id ? (
                          <span className="size-3.5 animate-spin rounded-full border-2 border-danger/30 border-t-danger" />
                        ) : (
                          <Trash2 size={15} />
                        )}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {transactions.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-5 py-16 text-center">
                    <div className="mx-auto max-w-sm">
                      <span className="mx-auto grid size-11 place-items-center rounded-xl bg-primary-soft text-primary">
                        <Plus size={22} />
                      </span>
                      <p className="mt-3 text-sm font-medium text-foreground">
                        Belum ada transaksi ditemukan
                      </p>
                      <p className="mt-1 text-xs text-muted">
                        Sesuaikan filter pencarian atau buat transaksi baru.
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {total > 0 && (
          <div className="flex flex-col gap-3 border-t border-border-soft px-5 py-4 sm:flex-row sm:items-center sm:justify-between text-xs text-muted">
            <p>
              Menampilkan <span className="font-semibold text-foreground">{firstItem}</span>–
              <span className="font-semibold text-foreground">{lastItem}</span> dari{" "}
              <span className="font-semibold text-foreground">{total}</span> transaksi
            </p>
            <div className="flex items-center gap-2">
              <Link
                href={pageHref(filters, page - 1)}
                prefetch={false}
                aria-disabled={page <= 1}
                tabIndex={page <= 1 ? -1 : undefined}
                className={`grid size-8.5 place-items-center rounded-lg border border-border transition ${
                  page <= 1
                    ? "pointer-events-none opacity-40"
                    : "hover:bg-surface-alt hover:text-foreground"
                }`}
              >
                <ChevronLeft size={16} />
              </Link>
              <span className="px-2 font-medium">
                {page} / {totalPages}
              </span>
              <Link
                href={pageHref(filters, page + 1)}
                prefetch={false}
                aria-disabled={page >= totalPages}
                tabIndex={page >= totalPages ? -1 : undefined}
                className={`grid size-8.5 place-items-center rounded-lg border border-border transition ${
                  page >= totalPages
                    ? "pointer-events-none opacity-40"
                    : "hover:bg-surface-alt hover:text-foreground"
                }`}
              >
                <ChevronRight size={16} />
              </Link>
            </div>
          </div>
        )}
      </div>

      {modalOpen && (
        <AddTransactionModal
          isOpen={modalOpen}
          categories={categories}
          transaction={editingTransaction}
          onClose={closeModal}
          onSaved={() => {
            const wasEditing = Boolean(editingTransaction);
            closeModal();
            toast.success(
              wasEditing
                ? "Perubahan transaksi berhasil disimpan."
                : "Transaksi baru berhasil ditambahkan.",
            );
          }}
        />
      )}

      {/* Lightbox / Preview Bukti Modal */}
      {previewBukti && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 grid place-items-center bg-black/60 p-4 backdrop-blur-xs animate-in fade-in duration-150"
          onClick={() => setPreviewBukti(null)}
        >
          <div
            className="relative max-h-[90vh] max-w-lg w-full overflow-hidden rounded-3xl border border-border bg-surface p-4 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-border-soft">
              <div>
                <h3 className="text-sm font-bold text-foreground">Bukti Transaksi</h3>
                <p className="text-xs text-muted truncate max-w-xs">{previewBukti.keterangan}</p>
              </div>
              <button
                type="button"
                onClick={() => setPreviewBukti(null)}
                className="grid size-8 place-items-center rounded-full bg-surface-alt text-muted hover:text-foreground transition"
              >
                <X size={16} />
              </button>
            </div>
            <div className="mt-3 flex items-center justify-center overflow-hidden rounded-2xl bg-black/5 dark:bg-black/40 p-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={previewBukti.url}
                alt={`Bukti transaksi ${previewBukti.keterangan}`}
                className="max-h-[65vh] w-auto rounded-xl object-contain shadow-sm"
              />
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
