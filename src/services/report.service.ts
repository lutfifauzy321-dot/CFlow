import { createClient } from "@/lib/supabase/server";

export async function getMonthlyReport(userId: string, bulan: string) {
  const supabase = await createClient();
  const [year, month] = bulan.split("-").map(Number);
  const endDate = new Date(Date.UTC(year, month, 1)).toISOString().slice(0, 10);

  const [summaryResult, categoriesResult, transactionsResult] = await Promise.all([
    supabase.rpc("get_dashboard_summary", { bulan: `${bulan}-01` }),
    supabase
      .from("categories")
      .select("id, nama, tipe, warna")
      .eq("user_id", userId),
    supabase
      .from("transactions")
      .select("id, category_id, tanggal, keterangan, tipe, nominal")
      .eq("user_id", userId)
      .gte("tanggal", `${bulan}-01`)
      .lt("tanggal", endDate)
      .order("tanggal", { ascending: true })
      .order("created_at", { ascending: true }),
  ]);

  if (summaryResult.error || categoriesResult.error || transactionsResult.error) {
    throw new Error("Laporan bulanan gagal dimuat.");
  }

  return {
    summary: summaryResult.data?.[0] ?? {
      total_saldo: 0,
      total_pemasukan: 0,
      total_pengeluaran: 0,
      saldo_perubahan_persen: null,
      pemasukan_perubahan_persen: null,
      pengeluaran_perubahan_persen: null,
    },
    categories: categoriesResult.data ?? [],
    transactions: transactionsResult.data ?? [],
  };
}