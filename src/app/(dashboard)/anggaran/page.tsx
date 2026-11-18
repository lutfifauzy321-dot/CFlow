import { redirect } from "next/navigation";
import { BudgetManager } from "@/components/management/BudgetManager";
import { getCurrentUser } from "@/lib/supabase/server";
import { getBudgetProgress } from "@/services/budget.service";

type SearchParams = Record<string, string | string[] | undefined>;

function currentMonth() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

function getMonth(value: string | string[] | undefined) {
  const month = Array.isArray(value) ? value[0] : value;
  return month && /^\d{4}-(0[1-9]|1[0-2])$/.test(month) ? month : currentMonth();
}

export default async function AnggaranPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const bulan = getMonth(params.bulan);

  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const overview = await getBudgetProgress(user.id, bulan);

  return (
    <div className="mx-auto max-w-360 space-y-6">
      <div>
        <p className="text-sm font-medium text-primary">Rencana pengeluaran</p>
        <h1 className="mt-1 text-2xl font-semibold text-foreground">Anggaran</h1>
        <p className="mt-1.5 text-sm text-muted">
          Tetapkan batas per kategori dan pantau pemakaian bulan ini.
        </p>
      </div>
      <BudgetManager bulan={bulan} {...overview} />
    </div>
  );
}
