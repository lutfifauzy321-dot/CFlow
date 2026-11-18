import { createClient } from "@/lib/supabase/server";
import type { Category } from "@/types";

export type BudgetProgress = {
	categoryId: string;
	categoryName: string;
	categoryColor: string;
	limit: number;
	spent: number;
};

export async function getBudgetProgress(userId: string, bulan: string) {
	const supabase = await createClient();
	const [year, month] = bulan.split("-").map(Number);
	const endDate = new Date(Date.UTC(year, month, 1)).toISOString().slice(0, 10);
	const [categoriesResult, budgetsResult, transactionsResult] = await Promise.all([
		supabase
			.from("categories")
			.select("id, nama, tipe, ikon, warna")
			.eq("user_id", userId)
			.eq("tipe", "keluar")
			.order("nama"),
		supabase
			.from("budgets")
			.select("id, category_id, bulan, limit_nominal")
			.eq("user_id", userId)
			.eq("bulan", `${bulan}-01`),
		supabase
			.from("transactions")
			.select("category_id, nominal")
			.eq("user_id", userId)
			.eq("tipe", "keluar")
			.gte("tanggal", `${bulan}-01`)
			.lt("tanggal", endDate),
	]);

	if (categoriesResult.error || budgetsResult.error || transactionsResult.error) {
		throw new Error("Data anggaran gagal dimuat.");
	}

	const categories = (categoriesResult.data ?? []) as Category[];
	const budgetsByCategory = new Map(
		(budgetsResult.data ?? []).map((budget) => [budget.category_id, budget.limit_nominal]),
	);
	const spendingByCategory = new Map<string, number>();
	for (const transaction of transactionsResult.data ?? []) {
		spendingByCategory.set(
			transaction.category_id,
			(spendingByCategory.get(transaction.category_id) ?? 0) + transaction.nominal,
		);
	}

	const progress: BudgetProgress[] = categories.map((category) => ({
		categoryId: category.id,
		categoryName: category.nama,
		categoryColor: category.warna,
		limit: budgetsByCategory.get(category.id) ?? 0,
		spent: spendingByCategory.get(category.id) ?? 0,
	}));

	return {
		categories,
		progress,
		totalLimit: progress.reduce((total, item) => total + item.limit, 0),
		totalSpent: progress.reduce((total, item) => total + item.spent, 0),
	};
}
