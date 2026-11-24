"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import {
	transactionSchema,
	type TransactionInput,
} from "@/lib/validations/transaction";

export type TransactionActionResult = {
	success: boolean;
	error?: string;
};

export async function saveTransactionAction(
	input: TransactionInput,
): Promise<TransactionActionResult> {
	const parsed = transactionSchema.safeParse(input);
	if (!parsed.success) {
		return {
			success: false,
			error: parsed.error.issues[0]?.message ?? "Data transaksi tidak valid.",
		};
	}

	try {
		const supabase = await createClient();
		const {
			data: { user },
		} = await supabase.auth.getUser();
		if (!user) return { success: false, error: "Sesi berakhir. Silakan masuk kembali." };

		const { data: category, error: categoryError } = await supabase
			.from("categories")
			.select("id, tipe")
			.eq("id", parsed.data.category_id)
			.eq("user_id", user.id)
			.maybeSingle();

		if (categoryError || !category) {
			return { success: false, error: "Kategori tidak ditemukan." };
		}
		if (category.tipe !== parsed.data.tipe) {
			return {
				success: false,
				error: "Jenis kategori harus sesuai dengan jenis transaksi.",
			};
		}

		const { id, ...values } = parsed.data;
		const payload = { ...values, user_id: user.id };

		if (id) {
			let { data, error } = await supabase
				.from("transactions")
				.update(payload)
				.eq("id", id)
				.eq("user_id", user.id)
				.select("id")
				.maybeSingle();

			if (error && String(error.message).includes("bukti_url")) {
				if (payload.bukti_url) {
					return {
						success: false,
						error: "Kolom bukti_url belum ada di database. Jalankan migrasi 002_add_bukti_url.sql di Supabase.",
					};
				}
				const fallbackPayload = {
					category_id: payload.category_id,
					keterangan: payload.keterangan,
					nominal: payload.nominal,
					tanggal: payload.tanggal,
					tipe: payload.tipe,
					user_id: payload.user_id,
				};
				const retry = await supabase
					.from("transactions")
					.update(fallbackPayload)
					.eq("id", id)
					.eq("user_id", user.id)
					.select("id")
					.maybeSingle();
				data = retry.data;
				error = retry.error;
			}

			if (error || !data) {
				return { success: false, error: "Transaksi gagal diperbarui." };
			}
		} else {
			let { error } = await supabase.from("transactions").insert(payload);
			if (error && String(error.message).includes("bukti_url")) {
				if (payload.bukti_url) {
					return {
						success: false,
						error: "Kolom bukti_url belum ada di database. Jalankan migrasi 002_add_bukti_url.sql di Supabase.",
					};
				}
				const fallbackPayload = {
					category_id: payload.category_id,
					keterangan: payload.keterangan,
					nominal: payload.nominal,
					tanggal: payload.tanggal,
					tipe: payload.tipe,
					user_id: payload.user_id,
				};
				const retry = await supabase.from("transactions").insert(fallbackPayload);
				error = retry.error;
			}
			if (error) return { success: false, error: "Transaksi gagal disimpan." };
		}

		revalidatePath("/transaksi");
		revalidatePath("/dashboard");
		revalidatePath("/ringkasan");
		return { success: true };
	} catch {
		return { success: false, error: "Layanan belum tersedia. Coba lagi nanti." };
	}
}

export async function deleteTransactionAction(
	id: string,
): Promise<TransactionActionResult> {
	if (!z.string().uuid().safeParse(id).success) {
		return { success: false, error: "Transaksi tidak valid." };
	}

	try {
		const supabase = await createClient();
		const {
			data: { user },
		} = await supabase.auth.getUser();
		if (!user) return { success: false, error: "Sesi berakhir. Silakan masuk kembali." };

		const { data, error } = await supabase
			.from("transactions")
			.delete()
			.eq("id", id)
			.eq("user_id", user.id)
			.select("id")
			.maybeSingle();

		if (error || !data) {
			return { success: false, error: "Transaksi gagal dihapus." };
		}

		revalidatePath("/transaksi");
		revalidatePath("/dashboard");
		revalidatePath("/ringkasan");
		return { success: true };
	} catch {
		return { success: false, error: "Layanan belum tersedia. Coba lagi nanti." };
	}
}
