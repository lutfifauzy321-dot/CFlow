"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

export async function createSavingsGoalAction(input: {
  nama: string;
  targetNominal: number;
  deadline: string;
}) {
  const parsed = z
    .object({
      nama: z.string().trim().min(1, "Nama target wajib diisi.").max(80),
      targetNominal: z.number().int().positive("Nominal target harus lebih dari 0."),
      deadline: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Tanggal tenggat tidak valid."),
    })
    .safeParse(input);

  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Data target tidak valid.",
    };
  }

  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
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

export async function addSavingsContributionAction(input: {
  goalId: string;
  amount: number;
}) {
  const parsed = z
    .object({
      goalId: z.string().uuid("Target tabungan tidak valid."),
      amount: z.number().int().positive("Nominal setoran harus lebih dari 0."),
    })
    .safeParse(input);

  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Nominal tabungan tidak valid.",
    };
  }

  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return { success: false, error: "Sesi berakhir. Silakan masuk kembali." };

    const { data: goal, error: fetchError } = await supabase
      .from("savings_goals")
      .select("id, terkumpul")
      .eq("id", parsed.data.goalId)
      .eq("user_id", user.id)
      .maybeSingle();

    if (fetchError || !goal) {
      return { success: false, error: "Target tabungan tidak ditemukan." };
    }

    const updatedTotal = Number(goal.terkumpul) + parsed.data.amount;
    const { error: updateError } = await supabase
      .from("savings_goals")
      .update({ terkumpul: updatedTotal })
      .eq("id", goal.id)
      .eq("user_id", user.id);

    if (updateError) {
      return { success: false, error: "Setoran gagal ditambahkan." };
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
    const {
      data: { user },
    } = await supabase.auth.getUser();
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
