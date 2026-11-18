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

  let [categories, result] = await Promise.all([
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
          <p className="text-sm font-medium text-primary">Pencatatan</p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-foreground">
            Transaksi
          </h1>
          <p className="mt-1.5 text-sm text-muted">
            Lihat dan kelola semua arus uangmu.
          </p>
        </div>
        <p className="text-sm text-muted">
          {result.total} transaksi pada bulan ini
        </p>
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
