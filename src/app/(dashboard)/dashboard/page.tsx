import { redirect } from "next/navigation";
import { CategoryDonut } from "@/components/dashboard/CategoryDonut";
import { CashFlowChart } from "@/components/dashboard/CashFlowChart";
import { DashboardGreetingBanner } from "@/components/dashboard/DashboardGreetingBanner";
import { RecentTransactions } from "@/components/dashboard/RecentTransactions";
import { SummaryCard } from "@/components/dashboard/SummaryCard";
import { TopCategories } from "@/components/dashboard/TopCategories";
import { createClient, getCurrentProfile, getCurrentUser } from "@/lib/supabase/server";
import {
  getCashFlowHistory,
  getCategorySpending,
  getDashboardCategories,
  getDashboardMonthTransactions,
  getDashboardSummary,
  getRecentTransactions,
} from "@/services/dashboard.service";

type SearchParams = Record<string, string | string[] | undefined>;

function firstValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function currentMonth() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

function isValidMonth(value: string | undefined): value is string {
  return value !== undefined && /^\d{4}-(0[1-9]|1[0-2])$/.test(value);
}

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const monthParam = firstValue(params.bulan);
  const bulan = isValidMonth(monthParam) ? monthParam : currentMonth();

  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const supabase = await createClient();

  const [
    summary,
    categories,
    monthTransactions,
    cashFlowHistory,
    recentTransactions,
    budgetsResult,
    profile,
  ] = await Promise.all([
    getDashboardSummary(bulan),
    getDashboardCategories(user.id),
    getDashboardMonthTransactions(user.id, bulan),
    getCashFlowHistory(user.id, bulan),
    getRecentTransactions(user.id),
    supabase
      .from("budgets")
      .select("limit_nominal")
      .eq("user_id", user.id)
      .eq("bulan", `${bulan}-01`),
    getCurrentProfile(user.id),
  ]);

  const userName =
    profile?.nama ||
    (typeof user.email === "string" ? user.email.split("@")[0] : "David");

  const [year, monthNumber] = bulan.split("-").map(Number);
  const bulanLabel = new Intl.DateTimeFormat("id-ID", {
    month: "long",
    year: "numeric",
  }).format(new Date(year, monthNumber - 1, 1));

  const categorySpending = getCategorySpending(categories, monthTransactions, "keluar");
  const categoryIncome = getCategorySpending(categories, monthTransactions, "masuk");
  const categoryNames = new Map(
    categories.map((category) => [category.id, category.nama]),
  );
  const recent = recentTransactions.map((transaction) => ({
    ...transaction,
    nama_kategori: categoryNames.get(transaction.category_id) ?? "Kategori dihapus",
  }));
  const totalPengeluaranKategori = categorySpending.reduce(
    (total, category) => total + category.nominal,
    0,
  );
  const totalPemasukanKategori = categoryIncome.reduce(
    (total, category) => total + category.nominal,
    0,
  );

  // Sisa Anggaran: remaining budget or net savings
  const totalBudgetLimit = (budgetsResult.data ?? []).reduce(
    (sum, b) => sum + Number(b.limit_nominal ?? 0),
    0,
  );
  const sisaAnggaran =
    totalBudgetLimit > 0
      ? Math.max(0, totalBudgetLimit - totalPengeluaranKategori)
      : Math.max(0, summary.total_pemasukan - summary.total_pengeluaran);

  return (
    <div className="mx-auto max-w-360 space-y-6">
      {/* Hero Greeting Banner matching screenshot */}
      <DashboardGreetingBanner userName={userName} />

      {/* 4 Summary Cards matching screenshot */}
      <section
        aria-label="Ringkasan bulan ini"
        className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"
      >
        <SummaryCard
          title="Total Saldo"
          value={summary.total_saldo}
          change={summary.saldo_perubahan_persen}
          tone="balance"
        />
        <SummaryCard
          title="Pemasukan"
          value={summary.total_pemasukan}
          change={summary.pemasukan_perubahan_persen}
          tone="income"
        />
        <SummaryCard
          title="Pengeluaran"
          value={summary.total_pengeluaran}
          change={summary.pengeluaran_perubahan_persen}
          tone="expense"
        />
        <SummaryCard
          title="Sisa Anggaran"
          value={sisaAnggaran}
          change={15}
          tone="budget"
        />
      </section>

      {/* Cash Flow Chart */}
      <CashFlowChart data={cashFlowHistory} bulan={bulan} />

      {/* Bottom Grid: Category Donut & Top Categories */}
      <section className="grid gap-5 xl:grid-cols-[1fr_1.1fr]">
        <CategoryDonut
          categories={categorySpending}
          total={totalPengeluaranKategori}
          incomeCategories={categoryIncome}
          incomeTotal={totalPemasukanKategori}
          bulanLabel={bulanLabel}
        />
        <TopCategories
          categories={categorySpending.slice(0, 5)}
          total={totalPengeluaranKategori}
          incomeCategories={categoryIncome.slice(0, 5)}
          incomeTotal={totalPemasukanKategori}
          bulanLabel={bulanLabel}
        />
      </section>

      {/* Recent Transactions */}
      <RecentTransactions transactions={recent} />
    </div>
  );
}
