import { createClient } from "@/lib/supabase/server";
import type { Category, Transaction, TransactionType } from "@/types";

export type TransactionFilters = {
	userId: string;
	bulan: string;
	tipe?: TransactionType;
	categoryId?: string;
	search?: string;
	page: number;
	pageSize: number;
};

export async function getTransactions(filters: TransactionFilters) {
	const supabase = await createClient();
	const startDate = `${filters.bulan}-01`;
	const [year, month] = filters.bulan.split("-").map(Number);
	const endDate = new Date(Date.UTC(year, month, 1)).toISOString().slice(0, 10);
	const firstItem = (filters.page - 1) * filters.pageSize;

	let query = supabase
		.from("transactions")
		.select("*", { count: "exact" })
		.eq("user_id", filters.userId)
		.gte("tanggal", startDate)
		.lt("tanggal", endDate);

	if (filters.tipe) query = query.eq("tipe", filters.tipe);
	if (filters.categoryId) query = query.eq("category_id", filters.categoryId);
	if (filters.search) query = query.ilike("keterangan", `%${filters.search}%`);

	const { data, error, count } = await query
		.order("tanggal", { ascending: false })
		.order("created_at", { ascending: false })
		.range(firstItem, firstItem + filters.pageSize - 1);

	if (error) throw new Error("Transaksi gagal dimuat.");

	return {
		transactions: (data ?? []) as Transaction[],
		total: count ?? 0,
	};
}

export async function getTransactionCategories(userId: string) {
	const supabase = await createClient();
	const { data, error } = await supabase
		.from("categories")
		.select("id, nama, tipe, ikon, warna")
		.eq("user_id", userId)
		.order("nama");

	if (error) throw new Error("Kategori gagal dimuat.");

	return (data ?? []) as Category[];
}
