"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

export type ActionResult = {
  success: boolean;
  message?: string;
  error?: string;
};

const updateProfileSchema = z.object({
  nama: z
    .string()
    .trim()
    .min(2, "Nama minimal 2 karakter.")
    .max(60, "Nama maksimal 60 karakter."),
});

const updatePasswordSchema = z
  .object({
    password: z
      .string()
      .min(6, "Password minimal 6 karakter.")
      .max(72, "Password maksimal 72 karakter."),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Konfirmasi password tidak cocok.",
    path: ["confirmPassword"],
  });

export async function updateProfileAction(
  formData: FormData,
): Promise<ActionResult> {
  const nama = formData.get("nama") as string;
  const parsed = updateProfileSchema.safeParse({ nama });

  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Nama tidak valid.",
    };
  }

  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: "Sesi berakhir. Silakan login kembali." };
    }

    // Update in profiles table
    const { error: profileError } = await supabase
      .from("profiles")
      .update({ nama: parsed.data.nama })
      .eq("id", user.id);

    if (profileError) {
      return { success: false, error: "Gagal memperbarui profil." };
    }

    // Update in auth user metadata
    await supabase.auth.updateUser({
      data: {
        nama: parsed.data.nama,
        full_name: parsed.data.nama,
      },
    });

    revalidatePath("/dashboard");
    revalidatePath("/pengaturan");
    return { success: true, message: "Profil berhasil diperbarui!" };
  } catch {
    return { success: false, error: "Layanan tidak tersedia. Coba lagi nanti." };
  }
}

export async function updatePasswordAction(
  formData: FormData,
): Promise<ActionResult> {
  const password = formData.get("password") as string;
  const confirmPassword = formData.get("confirmPassword") as string;

  const parsed = updatePasswordSchema.safeParse({ password, confirmPassword });

  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Password tidak valid.",
    };
  }

  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: "Sesi berakhir. Silakan login kembali." };
    }

    const { error } = await supabase.auth.updateUser({
      password: parsed.data.password,
    });

    if (error) {
      return {
        success: false,
        error: error.message || "Gagal mengubah kata sandi.",
      };
    }

    revalidatePath("/pengaturan");
    return { success: true, message: "Kata sandi berhasil diperbarui!" };
  } catch {
    return { success: false, error: "Layanan tidak tersedia. Coba lagi nanti." };
  }
}

