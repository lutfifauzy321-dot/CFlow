"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import {
  savingsContributionSchema,
  savingsGoalSchema,
  type SavingsContributionInput,
  type SavingsGoalInput,
} from "@/lib/validations/management";

export async function createSavingsGoalAction(input: SavingsGoalInput) {
  const parsed = savingsGoalSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Data target tidak valid." };
  }

  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: "Sesi berakhir. Silakan masuk kembali." };
    const { error } = await supabase.from("savings_goals").insert({
      user_id: user.id,
      nama: parsed.data.nama,
      target_nominal: parsed.data.targetNominal,
      deadline: parsed.data.deadline,
      terkumpul: 0,
    });
    if (error) return { success: false, error: "Target tabungan gagal disimpan." };

    revalidatePath("/target-tabungan");
    revalidatePath("/dashboard");
    return { success: true };
  } catch {
    return { success: false, error: "Layanan belum tersedia. Coba lagi nanti." };
  }
}

export async function addSavingsContributionAction(input: SavingsContributionInput) {
  const parsed = savingsContributionSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Nominal tabungan tidak valid." };
  }

  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: "Sesi berakhir. Silakan masuk kembali." };
    const { error } = await supabase.rpc("add_saving_contribution", {
      p_goal_id: parsed.data.goalId,
      p_amount: parsed.data.amount,
    });
    if (error) {
      return {
        success: false,
        error: error.code === "P0002"
          ? "Target tabungan tidak ditemukan."
          : "Setoran gagal ditambahkan.",
      };
    }

    revalidatePath("/target-tabungan");
    revalidatePath("/dashboard");
    return { success: true };
  } catch {
    return { success: false, error: "Layanan belum tersedia. Coba lagi nanti." };
  }
}

export async function deleteSavingsGoalAction(id: string) {
  if (!z.string().uuid().safeParse(id).success) {
    return { success: false, error: "Target tabungan tidak valid." };
  }

  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: "Sesi berakhir. Silakan masuk kembali." };
    const { data, error } = await supabase
      .from("savings_goals")
      .delete()
      .eq("id", id)
      .eq("user_id", user.id)
      .select("id")
      .maybeSingle();
    if (error || !data) return { success: false, error: "Target gagal dihapus." };

    revalidatePath("/target-tabungan");
    revalidatePath("/dashboard");
    return { success: true };
  } catch {
    return { success: false, error: "Layanan belum tersedia. Coba lagi nanti." };
  }
}