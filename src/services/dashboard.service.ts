import { createClient } from "@/lib/supabase/server";
import type { Category, Transaction, TransactionType } from "@/types";

export type DashboardSummaryData = {
	total_saldo: number;
	total_pemasukan: number;
	total_pengeluaran: number;
	saldo_perubahan_persen: number | null;
	pemasukan_perubahan_persen: number | null;
	pengeluaran_perubahan_persen: number | null;
};

export type CategorySpending = {
	id: string;
	nama: string;
	ikon: string;
	warna: string;
	nominal: number;
};

export type CashFlowPoint = {
	tanggal: string;
	pemasukan: number;
	pengeluaran: number;
};

export type DashboardMonthTransaction = Pick<
	Transaction,
	"category_id" | "tipe" | "nominal" | "tanggal"
>;

export async function getDashboardSummary(bulan: string) {
	const supabase = await createClient();
	const { data, error } = await supabase.rpc("get_dashboard_summary", {
		bulan: `${bulan}-01`,
	});

	if (error) throw new Error("Ringkasan keuangan gagal dimuat.");

	return (
		data?.[0] ?? {
			total_saldo: 0,
			total_pemasukan: 0,
			total_pengeluaran: 0,
			saldo_perubahan_persen: null,
			pemasukan_perubahan_persen: null,
			pengeluaran_perubahan_persen: null,
		}
	) satisfies DashboardSummaryData;
}

export async function getDashboardCategories(userId: string) {
	const supabase = await createClient();
	const { data, error } = await supabase
		.from("categories")
		.select("id, nama, ikon, warna, tipe")
		.eq("user_id", userId)
		.order("nama");

	if (error) throw new Error("Kategori gagal dimuat.");

	return (data ?? []) as Category[];
}

export async function getDashboardMonthTransactions(
	userId: string,
	bulan: string,
) {
	const supabase = await createClient();
	const [year, month] = bulan.split("-").map(Number);
	const nextMonth = new Date(Date.UTC(year, month, 1)).toISOString().slice(0, 10);
	const { data, error } = await supabase
		.from("transactions")
		.select("category_id, tipe, nominal, tanggal")
		.eq("user_id", userId)
		.gte("tanggal", `${bulan}-01`)
		.lt("tanggal", nextMonth);

	if (error) throw new Error("Transaksi bulanan gagal dimuat.");

	return (data ?? []) as DashboardMonthTransaction[];
}

export async function getCashFlowHistory(userId: string, bulan: string) {
	const supabase = await createClient();
	const [year, month] = bulan.split("-").map(Number);
	const start = new Date(Date.UTC(year, month - 13, 1));
	const end = new Date(Date.UTC(year, month, 1));
	const startDate = start.toISOString().slice(0, 10);
	const endDate = end.toISOString().slice(0, 10);
	const { data, error } = await supabase
		.from("transactions")
		.select("tanggal, tipe, nominal")
		.eq("user_id", userId)
		.gte("tanggal", startDate)
		.lt("tanggal", endDate);

	if (error) throw new Error("Riwayat arus uang gagal dimuat.");

	const totalsByDate = new Map<string, CashFlowPoint>();
	for (const transaction of data ?? []) {
		const dailyTotal = totalsByDate.get(transaction.tanggal) ?? {
			tanggal: transaction.tanggal,
			pemasukan: 0,
			pengeluaran: 0,
		};
		if (transaction.tipe === "masuk") {
			dailyTotal.pemasukan += transaction.nominal;
		} else {
			dailyTotal.pengeluaran += transaction.nominal;
		}
		totalsByDate.set(transaction.tanggal, dailyTotal);
	}

	const points: CashFlowPoint[] = [];
	for (const day = new Date(start); day < end; day.setUTCDate(day.getUTCDate() + 1)) {
		const date = day.toISOString().slice(0, 10);
		points.push(
			totalsByDate.get(date) ?? {
				tanggal: date,
				pemasukan: 0,
				pengeluaran: 0,
			},
		);
	}

	return points;
}

export async function getRecentTransactions(userId: string) {
	const supabase = await createClient();
	let { data, error } = await supabase
		.from("transactions")
		.select("id, category_id, tanggal, keterangan, tipe, nominal, bukti_url")
		.eq("user_id", userId)
		.order("tanggal", { ascending: false })
		.order("created_at", { ascending: false })
		.limit(5);

	if (error && String(error.message).includes("bukti_url")) {
		const fallback = await supabase
			.from("transactions")
			.select("id, category_id, tanggal, keterangan, tipe, nominal")
			.eq("user_id", userId)
			.order("tanggal", { ascending: false })
			.order("created_at", { ascending: false })
			.limit(5);
		data = fallback.data as typeof data;
		error = fallback.error;
	}

	if (error) throw new Error("Transaksi terbaru gagal dimuat.");

	return (data ?? []) as Transaction[];
}

export function getCategorySpending(
	categories: Category[],
	transactions: DashboardMonthTransaction[],
	tipe: TransactionType = "keluar",
): CategorySpending[] {
	const totals = new Map<string, number>();
	for (const transaction of transactions) {
		if (transaction.tipe !== tipe) continue;
		totals.set(
			transaction.category_id,
			(totals.get(transaction.category_id) ?? 0) + transaction.nominal,
		);
	}

	return categories
		.map((category) => ({
			id: category.id,
			nama: category.nama,
			ikon: category.ikon,
			warna: category.warna,
			nominal: totals.get(category.id) ?? 0,
		}))
		.filter((category) => category.nominal > 0)
		.sort((left, right) => right.nominal - left.nominal);
}
