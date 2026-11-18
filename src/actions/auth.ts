"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

type AuthState = {
	error?: string;
	message?: string;
};

const loginSchema = z.object({
	email: z.string().trim().email("Format email tidak valid."),
	password: z.string().min(1, "Kata sandi wajib diisi."),
});

const registerSchema = z
	.object({
		email: z.string().trim().email("Format email tidak valid."),
		password: z
			.string()
			.min(8, "Kata sandi harus terdiri dari minimal 8 karakter."),
		confirmPassword: z.string().min(1, "Konfirmasi kata sandi wajib diisi."),
	})
	.refine((value) => value.password === value.confirmPassword, {
		message: "Konfirmasi kata sandi tidak cocok.",
		path: ["confirmPassword"],
	});

function safeNextPath(value: FormDataEntryValue | null) {
	if (
		typeof value !== "string" ||
		!value.startsWith("/") ||
		value.startsWith("//")
	) {
		return "/dashboard";
	}

	if (
		value === "/login" ||
		value.startsWith("/login?") ||
		value === "/register"
	) {
		return "/dashboard";
	}

	return value;
}

function authErrorMessage(message: string) {
	if (message.includes("Invalid login credentials")) {
		return "Email atau kata sandi salah.";
	}
	if (message.includes("User already registered")) {
		return "Email ini sudah terdaftar. Silakan masuk.";
	}
	if (message.includes("Password should be at least")) {
		return "Kata sandi belum memenuhi ketentuan keamanan.";
	}
	if (message.includes("rate limit")) {
		return "Terlalu banyak percobaan. Coba lagi beberapa saat.";
	}

	return "Terjadi kendala saat menghubungkan ke layanan. Coba lagi.";
}

export async function loginAction(
	_previousState: AuthState,
	formData: FormData,
): Promise<AuthState> {
	const parsed = loginSchema.safeParse({
		email: formData.get("email"),
		password: formData.get("password"),
	});

	if (!parsed.success) {
		return { error: parsed.error.issues[0]?.message ?? "Data masuk tidak valid." };
	}

	try {
		const supabase = await createClient();
		const { error } = await supabase.auth.signInWithPassword(parsed.data);

		if (error) return { error: authErrorMessage(error.message) };
	} catch {
		return { error: "Layanan autentikasi belum tersedia. Coba lagi nanti." };
	}

	redirect(safeNextPath(formData.get("next")));
}

export async function registerAction(
	_previousState: AuthState,
	formData: FormData,
): Promise<AuthState> {
	const parsed = registerSchema.safeParse({
		email: formData.get("email"),
		password: formData.get("password"),
		confirmPassword: formData.get("confirmPassword"),
	});

	if (!parsed.success) {
		return {
			error: parsed.error.issues[0]?.message ?? "Data pendaftaran tidak valid.",
		};
	}

	let hasSession = false;

	try {
		const supabase = await createClient();
		const requestHeaders = await headers();
		const origin =
			requestHeaders.get("origin") ??
			process.env.NEXT_PUBLIC_SITE_URL ??
			"http://localhost:3000";
		const { data, error } = await supabase.auth.signUp({
			email: parsed.data.email,
			password: parsed.data.password,
			options: {
				emailRedirectTo: new URL(
					"/api/auth/callback?next=/dashboard",
					origin,
				).toString(),
			},
		});

		if (error) return { error: authErrorMessage(error.message) };
		hasSession = Boolean(data.session);
	} catch {
		return { error: "Layanan autentikasi belum tersedia. Coba lagi nanti." };
	}

	if (hasSession) redirect("/dashboard");

	return {
		message: "Akun berhasil dibuat. Periksa email untuk mengonfirmasi pendaftaran.",
	};
}

export async function logoutAction() {
	const supabase = await createClient();
	await supabase.auth.signOut();
	redirect("/login");
}
