import { redirect } from "next/navigation";
import { TransactionTable } from "@/components/transaksi/TransactionTable";
import { getCurrentUser } from "@/lib/supabase/server";
import {
  getTransactionCategories,
  getTransactions,
} from "@/services/transaction.service";
import type { TransactionType } from "@/types";

const PAGE_SIZE = 10;

type SearchParams = Record<string, string | string[] | undefined>;

function firstValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function isMonth(value: string | undefined): value is string {
  if (!value || !/^\d{4}-(0[1-9]|1[0-2])$/.test(value)) return false;
  return Number(value.slice(0, 4)) >= 1900;
}

function currentMonth() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

export default async function TransaksiPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const monthParam = firstValue(params.bulan);
  const bulan = isMonth(monthParam) ? monthParam : currentMonth();
  const typeParam = firstValue(params.tipe);
  const tipe: TransactionType | undefined =
    typeParam === "masuk" || typeParam === "keluar" ? typeParam : undefined;
  const categoryParam = firstValue(params.kategori);
  const search = firstValue(params.search)?.trim().slice(0, 100) ?? "";
  const pageParam = Number(firstValue(params.page) ?? 1);
  let page = Number.isSafeInteger(pageParam) && pageParam > 0 ? pageParam : 1;

  const [categories, initialResult] = await Promise.all([
    getTransactionCategories(user.id),
    getTransactions({
      userId: user.id,
      bulan,
      tipe,
      categoryId: categoryParam,
      search,
      page,
      pageSize: PAGE_SIZE,
    }),
  ]);
  let result = initialResult;

  const totalPages = Math.max(1, Math.ceil(result.total / PAGE_SIZE));

  if (page > totalPages) {
    page = totalPages;
    result = await getTransactions({
      userId: user.id,
      bulan,
      tipe,
      categoryId: categoryParam,
      search,
      page,
      pageSize: PAGE_SIZE,
    });
  }

  return (
    <div className="mx-auto max-w-360 space-y-6">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-primary">
            Pencatatan Arus Uang
          </span>
          <h1 className="mt-1 text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
            Transaksi
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-muted">
            Lihat, cari, dan kelola seluruh catatan pemasukan serta pengeluaranmu.
          </p>
        </div>
        <span className="inline-flex w-fit items-center rounded-full border border-border bg-surface px-3.5 py-1.5 text-xs font-semibold text-foreground-soft shadow-2xs">
          {result.total} transaksi bulan ini
        </span>
      </div>

      <TransactionTable
        transactions={result.transactions}
        categories={categories}
        total={result.total}
        page={page}
        pageSize={PAGE_SIZE}
        filters={{
          bulan,
          tipe: tipe ?? "",
          kategori: categoryParam ?? "",
          search,
        }}
      />
    </div>
  );
}
