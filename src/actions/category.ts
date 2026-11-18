"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { categorySchema, type CategoryInput } from "@/lib/validations/management";

export type ManagementActionResult = { success: boolean; error?: string };

function revalidateCategoryPages() {
	for (const path of ["/kategori", "/transaksi", "/dashboard", "/anggaran", "/laporan"]) {
		revalidatePath(path);
	}
}

export async function saveCategoryAction(
	input: CategoryInput,
): Promise<ManagementActionResult> {
	const parsed = categorySchema.safeParse(input);
	if (!parsed.success) {
		return { success: false, error: parsed.error.issues[0]?.message ?? "Data kategori tidak valid." };
	}

	try {
		const supabase = await createClient();
		const { data: { user } } = await supabase.auth.getUser();
		if (!user) return { success: false, error: "Sesi berakhir. Silakan masuk kembali." };

		const { id, ...values } = parsed.data;
		if (id) {
			const { data: existing, error: lookupError } = await supabase
				.from("categories")
				.select("id, tipe")
				.eq("id", id)
				.eq("user_id", user.id)
				.maybeSingle();
			if (lookupError || !existing) return { success: false, error: "Kategori tidak ditemukan." };

			if (existing.tipe !== values.tipe) {
				const { count, error } = await supabase
					.from("transactions")
					.select("id", { count: "exact", head: true })
					.eq("category_id", id)
					.eq("user_id", user.id);
				if (error) return { success: false, error: "Pemakaian kategori gagal diperiksa." };
				if (count) {
					return {
						success: false,
						error: "Jenis kategori tidak dapat diubah karena sudah dipakai transaksi.",
					};
				}
			}

			const { error } = await supabase
				.from("categories")
				.update(values)
				.eq("id", id)
				.eq("user_id", user.id);
			if (error) {
				return {
					success: false,
					error: error.code === "23505" ? "Nama kategori sudah ada untuk jenis ini." : "Kategori gagal diperbarui.",
				};
			}
		} else {
			const { error } = await supabase
				.from("categories")
				.insert({ ...values, user_id: user.id });
			if (error) {
				return {
					success: false,
					error: error.code === "23505" ? "Nama kategori sudah ada untuk jenis ini." : "Kategori gagal disimpan.",
				};
			}
		}

		revalidateCategoryPages();
		return { success: true };
	} catch {
		return { success: false, error: "Layanan belum tersedia. Coba lagi nanti." };
	}
}

export async function deleteCategoryAction(id: string): Promise<ManagementActionResult> {
	if (!z.string().uuid().safeParse(id).success) {
		return { success: false, error: "Kategori tidak valid." };
	}

	try {
		const supabase = await createClient();
		const { data: { user } } = await supabase.auth.getUser();
		if (!user) return { success: false, error: "Sesi berakhir. Silakan masuk kembali." };
		const { error } = await supabase
			.from("categories")
			.delete()
			.eq("id", id)
			.eq("user_id", user.id);

		if (error) {
			return {
				success: false,
				error: error.code === "23503"
					? "Kategori tidak dapat dihapus karena masih digunakan transaksi."
					: "Kategori gagal dihapus.",
			};
		}

		revalidateCategoryPages();
		return { success: true };
	} catch {
		return { success: false, error: "Layanan belum tersedia. Coba lagi nanti." };
	}
}
