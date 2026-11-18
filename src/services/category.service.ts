import { createClient } from "@/lib/supabase/server";
import type { Category } from "@/types";

export async function getCategories(userId: string) {
	const supabase = await createClient();
	const { data, error } = await supabase
		.from("categories")
		.select("id, nama, tipe, ikon, warna")
		.eq("user_id", userId)
		.order("tipe")
		.order("nama");

	if (error) throw new Error("Kategori gagal dimuat.");

	return (data ?? []) as Category[];
}
