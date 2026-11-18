"use client";

import { useState, useTransition } from "react";
import { useTheme } from "next-themes";
import {
  Check,
  Globe,
  KeyRound,
  Lock,
  LogOut,
  Moon,
  Palette,
  Shield,
  Sun,
  User,
  AlertCircle,
} from "lucide-react";
import { updatePasswordAction, updateProfileAction } from "@/actions/profile";
import { logoutAction } from "@/actions/auth";

type SettingsManagerProps = {
  user: {
    id: string;
    email: string;
    nama: string;
  };
  stats: {
    totalTransactions: number;
    totalCategories: number;
  };
};

export function SettingsManager({ user, stats }: SettingsManagerProps) {
  const { resolvedTheme, setTheme } = useTheme();
  const [activeTab, setActiveTab] = useState<"profile" | "security" | "appearance" | "preferences">("profile");

  // Profile Form state
  const [profilePending, startProfileTransition] = useTransition();
  const [profileMsg, setProfileMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Password Form state
  const [passwordPending, startPasswordTransition] = useTransition();
  const [passwordMsg, setPasswordMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const initials = user.nama
    ? user.nama
        .split(" ")
        .map((n) => n[0])
        .filter(Boolean)
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : "DA";

  async function handleProfileSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setProfileMsg(null);
    const formData = new FormData(e.currentTarget);
    startProfileTransition(async () => {
      const result = await updateProfileAction(formData);
      if (result.success) {
        setProfileMsg({ type: "success", text: result.message ?? "Profil berhasil disimpan!" });
      } else {
        setProfileMsg({ type: "error", text: result.error ?? "Gagal menyimpan profil." });
      }
    });
  }

  async function handlePasswordSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPasswordMsg(null);
    const form = e.currentTarget;
    const formData = new FormData(form);
    startPasswordTransition(async () => {
      const result = await updatePasswordAction(formData);
      if (result.success) {
        setPasswordMsg({ type: "success", text: result.message ?? "Kata sandi berhasil diubah!" });
        form.reset();
      } else {
        setPasswordMsg({ type: "error", text: result.error ?? "Gagal mengubah kata sandi." });
      }
    });
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <span className="text-xs font-semibold uppercase tracking-wider text-primary">
          Pengaturan Akun & Preferensi
        </span>
        <h1 className="mt-1 text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
          Pengaturan
        </h1>
        <p className="mt-1 text-xs sm:text-sm text-muted">
          Kelola profil, kata sandi, tema tampilan, dan data akun CFlow Anda.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[240px_1fr]">
        {/* Navigation Tabs on Left */}
        <div className="space-y-1">
          <button
            type="button"
            onClick={() => setActiveTab("profile")}
            className={`flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-xs sm:text-sm font-semibold transition ${
              activeTab === "profile"
                ? "bg-primary text-white shadow-sm"
                : "text-muted hover:bg-surface-alt hover:text-foreground"
            }`}
          >
            <User size={18} />
            <span>Profil Pengguna</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("security")}
            className={`flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-xs sm:text-sm font-semibold transition ${
              activeTab === "security"
                ? "bg-primary text-white shadow-sm"
                : "text-muted hover:bg-surface-alt hover:text-foreground"
            }`}
          >
            <Lock size={18} />
            <span>Keamanan & Password</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("appearance")}
            className={`flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-xs sm:text-sm font-semibold transition ${
              activeTab === "appearance"
                ? "bg-primary text-white shadow-sm"
                : "text-muted hover:bg-surface-alt hover:text-foreground"
            }`}
          >
            <Palette size={18} />
            <span>Tema Tampilan</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("preferences")}
            className={`flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-xs sm:text-sm font-semibold transition ${
              activeTab === "preferences"
                ? "bg-primary text-white shadow-sm"
                : "text-muted hover:bg-surface-alt hover:text-foreground"
            }`}
          >
            <Globe size={18} />
            <span>Data & Preferensi</span>
          </button>
        </div>

        {/* Tab Content on Right */}
        <div className="rounded-3xl border border-border/80 bg-surface p-5 sm:p-7 shadow-xs">
          {/* TAB 1: PROFIL PENGGUNA */}
          {activeTab === "profile" && (
            <div className="space-y-6">
              <div className="border-b border-border-soft pb-4">
                <h2 className="text-base sm:text-lg font-bold text-foreground">
                  Informasi Profil
                </h2>
                <p className="text-xs text-muted">
                  Perbarui nama pengguna dan identitas akun Anda di CFlow.
                </p>
              </div>

              {/* Avatar Row */}
              <div className="flex items-center gap-4">
                <div className="grid size-16 shrink-0 place-items-center rounded-full bg-primary-soft text-xl font-bold text-primary border border-primary/20 shadow-xs">
                  {initials}
                </div>
                <div>
                  <p className="text-sm font-bold text-foreground">{user.nama}</p>
                  <p className="text-xs text-muted">{user.email}</p>
                  <span className="mt-1.5 inline-flex items-center gap-1 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 px-2 py-0.5 text-[10px] font-semibold">
                    <Check size={11} /> Terverifikasi
                  </span>
                </div>
              </div>

              {profileMsg && (
                <div
                  className={`flex items-center gap-2 rounded-xl p-3 text-xs ${
                    profileMsg.type === "success"
                      ? "bg-emerald-50 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800"
                      : "bg-danger-soft text-danger border border-danger/20"
                  }`}
                >
                  {profileMsg.type === "success" ? <Check size={15} /> : <AlertCircle size={15} />}
                  <span>{profileMsg.text}</span>
                </div>
              )}

              <form onSubmit={handleProfileSubmit} className="space-y-4 max-w-lg">
                <div>
                  <label className="block text-xs font-semibold text-foreground-soft mb-1.5">
                    Nama Lengkap / Username
                  </label>
                  <input
                    type="text"
                    name="nama"
                    defaultValue={user.nama}
                    required
                    maxLength={60}
                    className="h-11 w-full rounded-xl border border-border bg-surface px-3.5 text-sm text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-foreground-soft mb-1.5">
                    Alamat Email
                  </label>
                  <input
                    type="email"
                    value={user.email}
                    disabled
                    className="h-11 w-full rounded-xl border border-border bg-surface-alt px-3.5 text-sm text-muted cursor-not-allowed"
                  />
                  <p className="mt-1 text-[11px] text-muted">
                    Email akun dikelola oleh sistem autentikasi.
                  </p>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={profilePending}
                    className="flex h-10.5 items-center justify-center rounded-xl bg-primary px-5 text-xs sm:text-sm font-semibold text-white shadow-sm hover:bg-primary-hover transition disabled:opacity-60"
                  >
                    {profilePending ? "Menyimpan..." : "Simpan Perubahan Profil"}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* TAB 2: KEAMANAN & PASSWORD */}
          {activeTab === "security" && (
            <div className="space-y-6">
              <div className="border-b border-border-soft pb-4">
                <h2 className="text-base sm:text-lg font-bold text-foreground">
                  Ganti Kata Sandi
                </h2>
                <p className="text-xs text-muted">
                  Pastikan kata sandi Anda kuat untuk melindungi data finansial Anda.
                </p>
              </div>

              {passwordMsg && (
                <div
                  className={`flex items-center gap-2 rounded-xl p-3 text-xs ${
                    passwordMsg.type === "success"
                      ? "bg-emerald-50 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800"
                      : "bg-danger-soft text-danger border border-danger/20"
                  }`}
                >
                  {passwordMsg.type === "success" ? <Check size={15} /> : <AlertCircle size={15} />}
                  <span>{passwordMsg.text}</span>
                </div>
              )}

              <form onSubmit={handlePasswordSubmit} className="space-y-4 max-w-lg">
                <div>
                  <label className="block text-xs font-semibold text-foreground-soft mb-1.5">
                    Kata Sandi Baru
                  </label>
                  <div className="relative">
                    <KeyRound size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
                    <input
                      type="password"
                      name="password"
                      required
                      minLength={6}
                      placeholder="Minimal 6 karakter"
                      className="h-11 w-full rounded-xl border border-border bg-surface pl-10 pr-3.5 text-sm text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-foreground-soft mb-1.5">
                    Konfirmasi Kata Sandi Baru
                  </label>
                  <div className="relative">
                    <KeyRound size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
                    <input
                      type="password"
                      name="confirmPassword"
                      required
                      minLength={6}
                      placeholder="Ulangi kata sandi baru"
                      className="h-11 w-full rounded-xl border border-border bg-surface pl-10 pr-3.5 text-sm text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={passwordPending}
                    className="flex h-10.5 items-center justify-center rounded-xl bg-primary px-5 text-xs sm:text-sm font-semibold text-white shadow-sm hover:bg-primary-hover transition disabled:opacity-60"
                  >
                    {passwordPending ? "Mengubah..." : "Perbarui Kata Sandi"}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* TAB 3: TEMA TAMPILAN */}
          {activeTab === "appearance" && (
            <div className="space-y-6">
              <div className="border-b border-border-soft pb-4">
                <h2 className="text-base sm:text-lg font-bold text-foreground">
                  Tema & Tampilan
                </h2>
                <p className="text-xs text-muted">
                  Pilih mode tampilan yang nyaman untuk mata Anda.
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2 max-w-lg">
                {/* Mode Terang Card */}
                <button
                  type="button"
                  onClick={() => setTheme("light")}
                  className={`flex flex-col items-start rounded-2xl border-2 p-4 text-left transition ${
                    resolvedTheme === "light"
                      ? "border-primary bg-primary-soft/30 shadow-xs"
                      : "border-border hover:border-border/80 bg-surface"
                  }`}
                >
                  <div className="flex w-full items-center justify-between mb-3">
                    <span className="grid size-10 place-items-center rounded-xl bg-amber-100 text-amber-600">
                      <Sun size={20} />
                    </span>
                    {resolvedTheme === "light" && (
                      <span className="size-5 rounded-full bg-primary text-white grid place-items-center">
                        <Check size={12} strokeWidth={3} />
                      </span>
                    )}
                  </div>
                  <p className="text-sm font-bold text-foreground">Mode Terang (Light)</p>
                  <p className="text-xs text-muted mt-1">
                    Tampilan bersih, cerah, dan kontras tinggi untuk siang hari.
                  </p>
                </button>

                {/* Mode Gelap Card */}
                <button
                  type="button"
                  onClick={() => setTheme("dark")}
                  className={`flex flex-col items-start rounded-2xl border-2 p-4 text-left transition ${
                    resolvedTheme === "dark"
                      ? "border-primary bg-primary-soft/30 shadow-xs"
                      : "border-border hover:border-border/80 bg-surface"
                  }`}
                >
                  <div className="flex w-full items-center justify-between mb-3">
                    <span className="grid size-10 place-items-center rounded-xl bg-indigo-900/60 text-indigo-300">
                      <Moon size={20} />
                    </span>
                    {resolvedTheme === "dark" && (
                      <span className="size-5 rounded-full bg-primary text-white grid place-items-center">
                        <Check size={12} strokeWidth={3} />
                      </span>
                    )}
                  </div>
                  <p className="text-sm font-bold text-foreground">Mode Gelap (Dark)</p>
                  <p className="text-xs text-muted mt-1">
                    Tampilan redup dan elegan yang nyaman digunakan di ruangan gelap.
                  </p>
                </button>
              </div>
            </div>
          )}

          {/* TAB 4: DATA & PREFERENSI */}
          {activeTab === "preferences" && (
            <div className="space-y-6">
              <div className="border-b border-border-soft pb-4">
                <h2 className="text-base sm:text-lg font-bold text-foreground">
                  Data & Ringkasan Akun
                </h2>
                <p className="text-xs text-muted">
                  Informasi teknis dan preferensi sistem CFlow Anda.
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-2 max-w-lg">
                <div className="rounded-2xl border border-border bg-surface-alt/60 p-4">
                  <p className="text-xs text-muted">Total Transaksi Tercatat</p>
                  <p className="mt-1 text-2xl font-bold text-foreground tabular-nums">
                    {stats.totalTransactions}
                  </p>
                </div>
                <div className="rounded-2xl border border-border bg-surface-alt/60 p-4">
                  <p className="text-xs text-muted">Kategori Terdaftar</p>
                  <p className="mt-1 text-2xl font-bold text-foreground tabular-nums">
                    {stats.totalCategories}
                  </p>
                </div>
              </div>

              <div className="space-y-3 max-w-lg pt-2">
                <div className="flex items-center justify-between rounded-2xl border border-border p-4">
                  <div>
                    <p className="text-xs font-bold text-foreground">Mata Uang Default</p>
                    <p className="text-[11px] text-muted">Format Rupiah (IDR)</p>
                  </div>
                  <span className="rounded-lg bg-surface-alt px-2.5 py-1 text-xs font-bold text-primary">
                    IDR (Rp)
                  </span>
                </div>

                <div className="flex items-center justify-between rounded-2xl border border-border p-4">
                  <div>
                    <p className="text-xs font-bold text-foreground">Format Tanggal</p>
                    <p className="text-[11px] text-muted">Standar Indonesia</p>
                  </div>
                  <span className="rounded-lg bg-surface-alt px-2.5 py-1 text-xs font-medium text-foreground">
                    DD/MM/YYYY
                  </span>
                </div>
              </div>

              {/* Sesi & Logout */}
              <div className="border-t border-border-soft pt-5 max-w-lg">
                <form action={logoutAction}>
                  <button
                    type="submit"
                    className="flex items-center gap-2 rounded-xl bg-danger-soft px-4 py-2.5 text-xs font-bold text-danger hover:bg-danger/20 transition"
                  >
                    <LogOut size={15} />
                    <span>Keluar dari Akun CFlow</span>
                  </button>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

