import { redirect } from "next/navigation";
import { MonthlyReport } from "@/components/management/MonthlyReport";
import { getCurrentUser } from "@/lib/supabase/server";
import { getMonthlyReport } from "@/services/report.service";

type SearchParams = Record<string, string | string[] | undefined>;

function currentMonth() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

function getMonth(value: string | string[] | undefined) {
  const month = Array.isArray(value) ? value[0] : value;
  return month && /^\d{4}-(0[1-9]|1[0-2])$/.test(month) ? month : currentMonth();
}

export default async function LaporanPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const bulan = getMonth(params.bulan);

  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const report = await getMonthlyReport(user.id, bulan);

  return (
    <div className="mx-auto max-w-360">
      <MonthlyReport bulan={bulan} {...report} />
    </div>
  );
}
