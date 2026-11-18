import { redirect } from "next/navigation";
import { MonthlySummaryView } from "@/components/management/MonthlySummaryView";
import { createClient, getCurrentUser } from "@/lib/supabase/server";
import { getTransactionCategories } from "@/services/transaction.service";
import type { Transaction } from "@/types";

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

export default async function RingkasanPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const monthParam = firstValue(params.bulan);
  const bulan = isMonth(monthParam) ? monthParam : currentMonth();

  const [year, month] = bulan.split("-").map(Number);
  const startDate = `${bulan}-01`;
  const endDate = new Date(Date.UTC(year, month, 1)).toISOString().slice(0, 10);

  const supabase = await createClient();

  const [categories, transactionsResult] = await Promise.all([
    getTransactionCategories(user.id),
    supabase
      .from("transactions")
      .select("id, category_id, tanggal, keterangan, tipe, nominal, bukti_url")
      .eq("user_id", user.id)
      .gte("tanggal", startDate)
      .lt("tanggal", endDate)
      .order("tanggal", { ascending: false })
      .order("created_at", { ascending: false }),
  ]);

  const transactions = (transactionsResult.data ?? []) as Transaction[];

  return (
    <div className="mx-auto max-w-360">
      <MonthlySummaryView
        bulan={bulan}
        transactions={transactions}
        categories={categories}
      />
    </div>
  );
}
