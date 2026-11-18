"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { budgetSchema, type BudgetInput } from "@/lib/validations/management";

export async function saveBudgetAction(input: BudgetInput) {
  const parsed = budgetSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Data anggaran tidak valid." };
  }

  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: "Sesi berakhir. Silakan masuk kembali." };

    const { data: category, error: categoryError } = await supabase
      .from("categories")
      .select("id, tipe")
      .eq("id", parsed.data.categoryId)
      .eq("user_id", user.id)
      .maybeSingle();
    if (categoryError || !category || category.tipe !== "keluar") {
      return { success: false, error: "Pilih kategori pengeluaran yang valid." };
    }

    const { error } = await supabase.from("budgets").upsert(
      {
        user_id: user.id,
        category_id: parsed.data.categoryId,
        bulan: `${parsed.data.bulan}-01`,
        limit_nominal: parsed.data.limitNominal,
      },
      { onConflict: "user_id,category_id,bulan" },
    );
    if (error) return { success: false, error: "Anggaran gagal disimpan." };

    revalidatePath("/anggaran");
    revalidatePath("/dashboard");
    revalidatePath("/laporan");
    return { success: true };
  } catch {
    return { success: false, error: "Layanan belum tersedia. Coba lagi nanti." };
  }
}