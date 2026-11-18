"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import {
  ArrowRight,
  CheckCircle2,
  Eye,
  EyeOff,
  LoaderCircle,
  LockKeyhole,
  Mail,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  Wallet,
  Zap,
} from "lucide-react";
import { loginAction, registerAction } from "@/actions/auth";
import { BrandLogo } from "@/components/brand/BrandLogo";

type AuthFormProps = {
  mode: "login" | "register";
  nextPath?: string;
  initialError?: string;
};

const inputBaseClass =
  "h-12 w-full rounded-xl border border-border bg-surface pl-10 pr-10 text-sm text-foreground outline-none transition-all placeholder:text-muted focus:border-primary focus:ring-4 focus:ring-primary/10 shadow-2xs";

export function AuthForm({ mode, nextPath, initialError }: AuthFormProps) {
  const isRegister = mode === "register";
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [state, formAction, pending] = useActionState(
    isRegister ? registerAction : loginAction,
    { error: initialError },
  );

  return (
    <main className="min-h-screen bg-page lg:grid lg:grid-cols-[1.1fr_0.9fr] selection:bg-primary-soft selection:text-primary transition-colors">
      {/* Left Column: Brand Hero Banner with Fluid Wave Background & Live Dashboard Showcase */}
      <section className="relative isolate flex flex-col justify-between overflow-hidden bg-gradient-to-br from-[#4e26a7] via-[#3b178f] to-[#250b5e] dark:from-[#130e2e] dark:via-[#0e0924] dark:to-[#070514] px-6 py-8 text-white sm:px-10 lg:min-h-screen lg:px-14 lg:py-12">
        {/* Layer 1: Ambient Luminous Glow Orbs */}
        <div className="pointer-events-none absolute -left-20 -top-20 h-96 w-96 rounded-full bg-purple-400/20 blur-3xl" />
        <div className="pointer-events-none absolute bottom-10 right-0 h-96 w-96 rounded-full bg-indigo-500/15 blur-3xl" />

        {/* Layer 2: Organic Fluid SVG Waves matching Sidebar & Dashboard */}
        <div className="pointer-events-none absolute inset-0 select-none overflow-hidden opacity-60 dark:opacity-30">
          <svg
            viewBox="0 0 500 900"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="absolute inset-0 h-full w-full object-cover"
            preserveAspectRatio="none"
          >
            <defs>
              <linearGradient id="authWave1" x1="500" y1="0" x2="0" y2="450" gradientUnits="userSpaceOnUse">
                <stop stopColor="#6e3cdb" stopOpacity="0.75" />
                <stop offset="1" stopColor="#481fa6" stopOpacity="0.1" />
              </linearGradient>
              <linearGradient id="authWave2" x1="0" y1="280" x2="500" y2="720" gradientUnits="userSpaceOnUse">
                <stop stopColor="#8149eb" stopOpacity="0.5" />
                <stop offset="0.6" stopColor="#5d2cb8" stopOpacity="0.25" />
                <stop offset="1" stopColor="#3b1487" stopOpacity="0.05" />
              </linearGradient>
              <linearGradient id="authWave3" x1="500" y1="650" x2="0" y2="900" gradientUnits="userSpaceOnUse">
                <stop stopColor="#723dd6" stopOpacity="0.6" />
                <stop offset="1" stopColor="#250b59" stopOpacity="0.8" />
              </linearGradient>
            </defs>

            {/* Top right wave */}
            <path
              d="M500 0 V340 C420 370 300 330 240 250 C170 160 80 180 0 140 V0 H500 Z"
              fill="url(#authWave1)"
            />
            {/* Middle wave */}
            <path
              d="M0 320 C100 380 200 350 290 410 C390 470 430 570 500 610 V420 C420 380 360 310 380 230 C410 170 480 140 500 80 C430 130 300 190 200 210 C80 240 0 320 0 320 Z"
              fill="url(#authWave2)"
            />
            {/* Bottom wave */}
            <path
              d="M0 670 C140 620 250 670 340 750 C430 830 460 870 500 880 V900 H0 V670 Z"
              fill="url(#authWave3)"
            />
          </svg>
        </div>

        {/* Top Bar: Brand Logo + Version Badge */}
        <div className="relative z-10 flex items-center justify-between">
          <BrandLogo href="/" />
          <span className="hidden sm:inline-flex items-center gap-1 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold text-purple-100 backdrop-blur-md border border-white/20 shadow-xs">
            <Sparkles size={13} className="text-amber-300" />
            CFlow Financial App
          </span>
        </div>

        {/* Middle Hero Showcase: Typography + Glassmorphic Dashboard Preview Cards */}
        <div className="relative z-10 my-auto hidden max-w-xl py-10 lg:block">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/12 px-3.5 py-1 text-xs font-semibold uppercase tracking-wider text-purple-200 backdrop-blur-md border border-white/15">
            <Zap size={13} className="text-amber-300" />
            Keuangan yang lebih tertata
          </div>

          <h1 className="mt-4 text-4xl xl:text-5xl font-extrabold leading-[1.12] tracking-tight text-white font-sans">
            Atur arus uangmu <br />
            dengan lebih jernih.
          </h1>

          <p className="mt-4 text-base leading-relaxed text-purple-200/90 max-w-md">
            Pantau saldo harian, catat pemasukan dan pengeluaran secara terarah, serta nikmati visualisasi grafik otomatis dalam satu tempat.
          </p>

          {/* Interactive Floating Glassmorphism Cards Showcase */}
          <div className="mt-8 space-y-3.5 select-none">
            {/* Floating Card 1: Total Saldo Preview with Sparkline */}
            <div className="relative overflow-hidden rounded-2xl bg-white/12 p-4 backdrop-blur-md border border-white/20 shadow-2xl max-w-sm transition-transform hover:-translate-y-1 duration-300">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="grid size-10 place-items-center rounded-xl bg-white/20 text-white shadow-2xs">
                    <Wallet size={19} strokeWidth={2.2} />
                  </span>
                  <div>
                    <p className="text-xs text-purple-200/80 font-medium">Total Saldo</p>
                    <p className="text-xl font-bold text-white tracking-tight tabular-nums">
                      Rp 12.500.000
                    </p>
                  </div>
                </div>
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-400/20 px-2.5 py-1 text-[11px] font-bold text-emerald-300 border border-emerald-400/30">
                  <TrendingUp size={12} /> ↑ 12%
                </span>
              </div>

              {/* Decorative wave sparkline matching dashboard cards */}
              <div className="-mx-4 -mb-4 mt-3 h-8 overflow-hidden opacity-75">
                <svg viewBox="0 0 200 40" preserveAspectRatio="none" className="size-full">
                  <defs>
                    <linearGradient id="authSparklineGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#c4b5fd" stopOpacity="0.4" />
                      <stop offset="100%" stopColor="#c4b5fd" stopOpacity="0.0" />
                    </linearGradient>
                  </defs>
                  <path
                    d="M0 25 C40 10, 80 35, 120 18 C160 5, 180 20, 200 12 L200 40 L0 40 Z"
                    fill="url(#authSparklineGrad)"
                  />
                  <path
                    d="M0 25 C40 10, 80 35, 120 18 C160 5, 180 20, 200 12"
                    fill="none"
                    stroke="#ddd6fe"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                  />
                </svg>
              </div>
            </div>

            {/* Floating Card 2: Health Status Badge + Gold Coin */}
            <div className="flex items-center gap-3 pt-1">
              <div className="inline-flex items-center gap-2.5 rounded-full bg-white/15 px-4 py-2 backdrop-blur-md border border-white/20 text-xs font-semibold text-white shadow-lg">
                <span className="grid size-5 place-items-center rounded-full bg-emerald-400 text-[#1e1742] shrink-0 font-bold">
                  ✓
                </span>
                <span>Finansial sehat, hidup lebih tenang</span>
              </div>

              {/* Floating 3D Gold Coin with metallic sheen */}
              <div className="size-8 rounded-full bg-gradient-to-tr from-amber-500 via-amber-400 to-yellow-200 shadow-md shadow-amber-500/30 border-2 border-yellow-100 flex items-center justify-center animate-bounce duration-1000">
                <div className="size-4 rounded-full border border-amber-600/40 bg-amber-400/20" />
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Feature Points */}
        <div className="relative z-10 hidden border-t border-white/15 pt-5 lg:flex items-center justify-between text-xs text-purple-200/80">
          <span className="flex items-center gap-1.5">
            <CheckCircle2 size={14} className="text-emerald-400" />
            Pencatatan instan & rapi
          </span>
          <span className="flex items-center gap-1.5">
            <CheckCircle2 size={14} className="text-emerald-400" />
            Grafik arus kas otomatis
          </span>
          <span className="flex items-center gap-1.5">
            <CheckCircle2 size={14} className="text-emerald-400" />
            Privasi data terlindungi
          </span>
        </div>

        {/* Mobile-only compact caption */}
        <div className="relative z-10 mt-6 flex items-center gap-2 text-xs text-purple-200 lg:hidden">
          <CheckCircle2 size={15} className="text-emerald-400 shrink-0" />
          <span>Kelola arus keuanganmu dengan lebih cerdas dan terarah.</span>
        </div>
      </section>

      {/* Right Column: Floating Modern Glassmorphic Form Card */}
      <section className="relative flex items-center justify-center px-4 py-10 sm:px-8 lg:px-12">
        {/* Ambient background soft glow */}
        <div className="pointer-events-none absolute -right-10 top-10 h-72 w-72 rounded-full bg-purple-200/40 dark:bg-purple-950/20 blur-3xl" />

        <div className="relative w-full max-w-md rounded-3xl border border-border bg-surface p-7 sm:p-9 shadow-[0_20px_50px_rgba(79,70,229,0.06)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.4)] backdrop-blur-md transition-all">
          {/* Header Title */}
          <div className="mb-7">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-primary-soft px-3 py-1 text-xs font-semibold text-primary">
              <Sparkles size={13} />
              {isRegister ? "Registrasi Akun Baru" : "Selamat Datang Kembali"}
            </span>

            <h2 className="mt-3 text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground font-sans">
              {isRegister ? "Mulai akun CFlow" : "Masuk ke akunmu"}
            </h2>

            <p className="mt-1.5 text-xs sm:text-sm text-muted leading-relaxed">
              {isRegister
                ? "Daftar gratis dan mulai kelola arus kasmu secara terstruktur."
                : "Lanjutkan memantau dan mengatur tujuan finansialmu."}
            </p>
          </div>

          <form action={formAction} className="space-y-4">
            {nextPath && <input type="hidden" name="next" value={nextPath} />}

            {/* Email Field */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-foreground-soft mb-1.5">
                Alamat Email
              </label>
              <div className="relative flex items-center">
                <Mail
                  aria-hidden="true"
                  size={17}
                  className="pointer-events-none absolute left-3.5 text-muted transition-colors"
                />
                <input
                  className={inputBaseClass}
                  type="email"
                  name="email"
                  autoComplete="email"
                  placeholder="nama@email.com"
                  required
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold uppercase tracking-wider text-foreground-soft">
                  Kata Sandi
                </label>
              </div>
              <div className="relative flex items-center">
                <LockKeyhole
                  aria-hidden="true"
                  size={17}
                  className="pointer-events-none absolute left-3.5 text-muted transition-colors"
                />
                <input
                  className={inputBaseClass}
                  type={showPassword ? "text" : "password"}
                  name="password"
                  autoComplete={isRegister ? "new-password" : "current-password"}
                  placeholder={isRegister ? "Minimal 8 karakter" : "Masukkan kata sandi"}
                  minLength={isRegister ? 8 : undefined}
                  required
                />
                <button
                  type="button"
                  aria-label={showPassword ? "Sembunyikan sandi" : "Tampilkan sandi"}
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 text-muted hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
            </div>

            {/* Confirm Password Field (Register only) */}
            {isRegister && (
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-foreground-soft mb-1.5">
                  Konfirmasi Kata Sandi
                </label>
                <div className="relative flex items-center">
                  <LockKeyhole
                    aria-hidden="true"
                    size={17}
                    className="pointer-events-none absolute left-3.5 text-muted transition-colors"
                  />
                  <input
                    className={inputBaseClass}
                    type={showConfirmPassword ? "text" : "password"}
                    name="confirmPassword"
                    autoComplete="new-password"
                    placeholder="Ulangi kata sandi"
                    minLength={8}
                    required
                  />
                  <button
                    type="button"
                    aria-label={showConfirmPassword ? "Sembunyikan sandi" : "Tampilkan sandi"}
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3.5 text-muted hover:text-foreground transition-colors"
                  >
                    {showConfirmPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                  </button>
                </div>
              </div>
            )}

            {/* Error Message Alert */}
            {state.error && (
              <div
                className="rounded-xl border border-danger/30 bg-danger-soft p-3 text-xs sm:text-sm text-danger animate-in fade-in-50 duration-200"
                role="alert"
              >
                {state.error}
              </div>
            )}

            {/* Success Message Alert */}
            {state.message && (
              <div
                className="rounded-xl border border-success/30 bg-success-soft p-3 text-xs sm:text-sm text-success animate-in fade-in-50 duration-200"
                role="status"
              >
                {state.message}
              </div>
            )}

            {/* Submit Action Button */}
            <button
              type="submit"
              disabled={pending}
              className="mt-2 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-primary to-primary-strong hover:from-primary-hover hover:to-primary text-white font-semibold text-sm shadow-md shadow-primary/25 transition-all active:scale-[0.98] disabled:cursor-wait disabled:opacity-70"
            >
              {pending ? (
                <LoaderCircle size={18} className="animate-spin" />
              ) : (
                <>
                  <span>{isRegister ? "Daftar Akun Baru" : "Masuk ke Akun"}</span>
                  <ArrowRight size={17} strokeWidth={2.4} />
                </>
              )}
            </button>
          </form>

          {/* Switch Link: Login <-> Register */}
          <div className="mt-6 border-t border-border/80 pt-5 text-center">
            <p className="text-xs sm:text-sm text-muted">
              {isRegister ? "Sudah memiliki akun?" : "Belum memiliki akun?"}{" "}
              <Link
                href={isRegister ? "/login" : "/register"}
                className="font-bold text-primary hover:text-primary-strong transition-colors"
              >
                {isRegister ? "Masuk sekarang" : "Daftar gratis"}
              </Link>
            </p>
          </div>

          {/* Security & Encryption Footer Badge */}
          <div className="mt-5 flex items-center justify-center gap-1.5 text-[11px] text-muted">
            <ShieldCheck size={14} className="text-emerald-500 shrink-0" />
            <span>Data terlindungi dengan enkripsi aman Supabase Auth</span>
          </div>
        </div>
      </section>
    </main>
  );
}
