"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import {
  CURRENCY_COOKIE_NAME,
  isValidCurrency,
} from "@/lib/utils/currency";

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
  avatar_url: z.string().max(1_500_000, "Ukuran foto terlalu besar.").nullable().optional(),
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
  const rawAvatar = formData.get("avatar_url");
  const avatar_url =
    typeof rawAvatar === "string" && rawAvatar.trim().length > 0
      ? rawAvatar.trim()
      : rawAvatar === ""
        ? null
        : undefined;

  const parsed = updateProfileSchema.safeParse({ nama, avatar_url });

  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Data profil tidak valid.",
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

    const updatePayload: { nama: string; avatar_url?: string | null } = {
      nama: parsed.data.nama,
    };
    if (parsed.data.avatar_url !== undefined) {
      updatePayload.avatar_url = parsed.data.avatar_url;
    }

    const { error: profileError } = await supabase
      .from("profiles")
      .update(updatePayload)
      .eq("id", user.id);

    if (profileError) {
      return { success: false, error: "Gagal memperbarui profil." };
    }

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

export async function updateCurrencyAction(
  currency: string,
): Promise<ActionResult> {
  if (!isValidCurrency(currency)) {
    return { success: false, error: "Mata uang tidak didukung." };
  }

  try {
    const cookieStore = await cookies();
    cookieStore.set(CURRENCY_COOKIE_NAME, currency, {
      path: "/",
      maxAge: 60 * 60 * 24 * 365,
      sameSite: "lax",
    });

    revalidatePath("/", "layout");
    return { success: true, message: `Mata uang diubah ke ${currency}.` };
  } catch {
    return { success: false, error: "Gagal menyimpan preferensi mata uang." };
  }
}
