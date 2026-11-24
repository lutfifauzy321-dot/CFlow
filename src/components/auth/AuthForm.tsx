"use client";

import Link from "next/link";
import { useActionState, useEffect, useState } from "react";
import { useTheme } from "next-themes";
import {
  ArrowRight,
  CheckCircle2,
  Eye,
  EyeOff,
  Globe,
  LoaderCircle,
  LockKeyhole,
  Mail,
  Minus,
  Moon,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  Sun,
  TrendingDown,
  TrendingUp,
  Zap,
} from "lucide-react";
import { loginAction, registerAction } from "@/actions/auth";
import { BrandLogo } from "@/components/brand/BrandLogo";
import { useCurrency } from "@/components/providers/CurrencyProvider";
import { CURRENCIES, FOREIGN_CURRENCIES } from "@/lib/utils/currency";

type AuthFormProps = {
  mode: "login" | "register";
  nextPath?: string;
  initialError?: string;
};

const inputBaseClass =
  "h-11.5 w-full rounded-xl border border-purple-200/80 dark:border-purple-400/20 bg-white/90 dark:bg-[#1b123d]/90 pl-10 pr-10 text-sm text-foreground outline-none transition-all placeholder:text-muted focus:border-primary focus:ring-3 focus:ring-primary/15 shadow-2xs";

export function AuthForm({ mode, nextPath, initialError }: AuthFormProps) {
  const isRegister = mode === "register";
  const { resolvedTheme, setTheme } = useTheme();
  const { ratesPayload, isRefreshing, refreshRates } = useCurrency();
  const [mounted, setMounted] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => setMounted(true), []);
  const isDark = mounted && resolvedTheme === "dark";

  const [state, formAction, pending] = useActionState(
    isRegister ? registerAction : loginAction,
    { error: initialError },
  );

  return (
    <main className="relative min-h-dvh lg:h-dvh lg:overflow-hidden bg-[#f4f0fe] dark:bg-[#090514] lg:grid lg:grid-cols-[1.08fr_0.92fr] selection:bg-primary-soft selection:text-primary">
      {/* Background Organic Waves across the entire Auth Page (shows on the right panel in both Light & Dark mode) */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-0 select-none overflow-hidden"
      >
        <svg
          viewBox="0 0 1440 900"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="absolute inset-0 h-full w-full object-cover"
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id="authPageWave1" x1="1440" y1="0" x2="600" y2="500" gradientUnits="userSpaceOnUse">
              <stop stopColor="#7c4dff" stopOpacity="0.22" />
              <stop offset="1" stopColor="#552cb8" stopOpacity="0.03" />
            </linearGradient>
            <linearGradient id="authPageWave2" x1="700" y1="400" x2="1440" y2="900" gradientUnits="userSpaceOnUse">
              <stop stopColor="#6e3cdb" stopOpacity="0.25" />
              <stop offset="1" stopColor="#2a0e68" stopOpacity="0.08" />
            </linearGradient>
          </defs>
          <path
            d="M1440 0 V380 C1240 420 1020 330 880 220 C740 110 560 160 420 100 V0 H1440 Z"
            fill="url(#authPageWave1)"
          />
          <path
            d="M460 900 C680 780 920 820 1120 710 C1280 620 1370 520 1440 480 V900 H460 Z"
            fill="url(#authPageWave2)"
          />
        </svg>
      </div>

      {/* Left Column: Floating Rounded Brand Hero Showcase */}
      <section className="relative z-10 isolate flex flex-col justify-between overflow-hidden bg-gradient-to-br from-[#5427ba] via-[#3c168f] to-[#210954] dark:from-[#291266] dark:via-[#18093e] dark:to-[#0c0420] px-6 py-6 text-white sm:px-10 lg:m-3.5 lg:rounded-[32px] lg:border lg:border-white/15 lg:px-11 lg:py-8 lg:shadow-2xl">
        {/* Organic Fluid SVG Waves matching Sidebar */}
        <div className="pointer-events-none absolute inset-0 select-none overflow-hidden opacity-85">
          <svg
            viewBox="0 0 500 900"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="absolute inset-0 h-full w-full object-cover"
            preserveAspectRatio="none"
          >
            <defs>
              <linearGradient id="authWave1" x1="500" y1="0" x2="0" y2="450" gradientUnits="userSpaceOnUse">
                <stop stopColor="#7b46eb" stopOpacity="0.8" />
                <stop offset="1" stopColor="#481fa6" stopOpacity="0.12" />
              </linearGradient>
              <linearGradient id="authWave2" x1="0" y1="280" x2="500" y2="720" gradientUnits="userSpaceOnUse">
                <stop stopColor="#8c55f7" stopOpacity="0.55" />
                <stop offset="0.6" stopColor="#5d2cb8" stopOpacity="0.28" />
                <stop offset="1" stopColor="#3b1487" stopOpacity="0.06" />
              </linearGradient>
              <linearGradient id="authWave3" x1="500" y1="650" x2="0" y2="900" gradientUnits="userSpaceOnUse">
                <stop stopColor="#723dd6" stopOpacity="0.65" />
                <stop offset="1" stopColor="#1e084b" stopOpacity="0.85" />
              </linearGradient>
            </defs>

            <path
              d="M500 0 V340 C420 370 300 330 240 250 C170 160 80 180 0 140 V0 H500 Z"
              fill="url(#authWave1)"
            />
            <path
              d="M0 320 C100 380 200 350 290 410 C390 470 430 570 500 610 V420 C420 380 360 310 380 230 C410 170 480 140 500 80 C430 130 300 190 200 210 C80 240 0 320 0 320 Z"
              fill="url(#authWave2)"
            />
            <path
              d="M0 670 C140 620 250 670 340 750 C430 830 460 870 500 880 V900 H0 V670 Z"
              fill="url(#authWave3)"
            />
          </svg>
        </div>

        {/* Top Bar: Brand Logo + App Badge */}
        <div className="relative z-10 flex items-center justify-between">
          <BrandLogo href="/" />
          <span className="hidden sm:inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3.5 py-1 text-xs font-semibold text-purple-100 border border-white/20 shadow-xs">
            <Sparkles size={13} className="text-amber-300" />
            CFlow Financial App
          </span>
        </div>

        {/* Middle Hero Showcase: Copywriting + Refined Live FX Board */}
        <div className="relative z-10 my-auto hidden max-w-xl py-4 lg:block">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/14 px-3.5 py-1 text-[11px] font-semibold uppercase tracking-wider text-purple-100 border border-white/20">
            <Zap size={13} className="text-amber-300" />
            KELOLA FINANSIAL LEBIH RINGAN
          </div>

          <h1 className="mt-3.5 text-3xl xl:text-[40px] font-extrabold leading-[1.15] tracking-tight text-white font-sans">
            Kendalikan pengeluaranmu,
            <br />
            amankan akhir bulanmu.
          </h1>

          <p className="mt-3 text-sm xl:text-[15px] leading-relaxed text-purple-200/80 max-w-lg">
            Tak ada lagi cerita saldo habis tanpa jejak sebelum waktunya. CFlow membantumu melacak setiap transaksi dalam hitungan detik, membatasi pos boros, dan menyisihkan tabungan secara konsisten.
          </p>

          {/* Refined Live Exchange Rates Card (IDR) — aligned cleanly with hero copy */}
          <div className="mt-6 rounded-2xl bg-white/10 p-4 border border-white/20 shadow-xl">
            <div className="flex items-center justify-between gap-2 border-b border-white/15 pb-3 mb-3">
              <div className="flex items-center gap-2.5">
                <span className="grid size-8 place-items-center rounded-xl bg-white/15 text-purple-100">
                  <Globe size={15} />
                </span>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-xs font-bold text-white leading-none">
                      Kurs Mata Uang Live (IDR)
                    </p>
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-400/20 px-2 py-0.5 text-[10px] font-bold text-emerald-300">
                      <span
                        className={`size-1.5 rounded-full ${
                          ratesPayload.isLive ? "bg-emerald-400 animate-pulse" : "bg-amber-300"
                        }`}
                      />
                      {ratesPayload.isLive ? "LIVE" : "EST"}
                    </span>
                  </div>
                  <p className="mt-0.5 text-[11px] text-purple-200/70">
                    {ratesPayload.source} · {ratesPayload.date}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => refreshRates()}
                disabled={isRefreshing}
                title="Perbarui kurs live"
                aria-label="Perbarui kurs live"
                className="inline-flex items-center gap-1.5 rounded-xl bg-white/10 px-2.5 py-1.5 text-[11px] font-semibold text-purple-100 transition hover:bg-white/20 disabled:opacity-50"
              >
                <RefreshCw size={12} className={isRefreshing ? "animate-spin" : ""} />
                <span>Perbarui</span>
              </button>
            </div>

            {/* Symmetrical Grid: USD featured on top + 2x3 grid for SGD, MYR, EUR, JPY, AUD, GBP */}
            <div className="grid grid-cols-2 gap-2">
              {FOREIGN_CURRENCIES.map((code) => {
                const entry = ratesPayload.rates[code];
                const isFeatured = code === "USD";

                return (
                  <div
                    key={code}
                    className={`flex items-center justify-between gap-2 rounded-xl border border-white/12 px-3 py-2 transition hover:bg-white/12 ${
                      isFeatured
                        ? "col-span-2 bg-white/12 py-2.5"
                        : "bg-white/7"
                    }`}
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-white">{code}</span>
                        <span className="text-[11px] text-purple-200/70">
                          ({CURRENCIES[code].symbol})
                        </span>
                        {isFeatured && (
                          <span className="hidden sm:inline text-[11px] text-purple-200/65">
                            · {CURRENCIES[code].name}
                          </span>
                        )}
                      </div>
                      <p
                        className={`mt-0.5 font-bold tabular-nums text-white ${
                          isFeatured ? "text-sm" : "text-xs"
                        }`}
                      >
                        Rp {Math.round(entry.idrPerUnit).toLocaleString("id-ID")}
                      </p>
                    </div>

                    {entry.trend === "up" ? (
                      <span
                        title={`${code} menguat terhadap IDR`}
                        className="inline-flex shrink-0 items-center gap-0.5 rounded-full bg-emerald-400/20 px-2 py-0.5 text-[11px] font-bold text-emerald-300 border border-emerald-400/25"
                      >
                        <TrendingUp size={11} strokeWidth={2.5} />
                        +{Math.abs(entry.changePercent)}%
                      </span>
                    ) : entry.trend === "down" ? (
                      <span
                        title={`IDR menguat terhadap ${code}`}
                        className="inline-flex shrink-0 items-center gap-0.5 rounded-full bg-rose-400/20 px-2 py-0.5 text-[11px] font-bold text-rose-200 border border-rose-400/25"
                      >
                        <TrendingDown size={11} strokeWidth={2.5} />
                        -{Math.abs(entry.changePercent)}%
                      </span>
                    ) : (
                      <span className="inline-flex shrink-0 items-center gap-0.5 rounded-full bg-white/10 px-2 py-0.5 text-[11px] font-medium text-purple-200/80">
                        <Minus size={10} /> 0%
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Bottom Feature Points */}
        <div className="relative z-10 hidden border-t border-white/15 pt-4 lg:flex items-center justify-between text-xs text-purple-100/85">
          <span className="flex items-center gap-1.5">
            <CheckCircle2 size={14} className="text-emerald-400" />
            Pencatatan instan & rapi
          </span>
          <span className="flex items-center gap-1.5">
            <CheckCircle2 size={14} className="text-emerald-400" />
            Grafik arus uang otomatis
          </span>
          <span className="flex items-center gap-1.5">
            <CheckCircle2 size={14} className="text-emerald-400" />
            Privasi data terlindungi
          </span>
        </div>

        {/* Mobile-only compact caption */}
        <div className="relative z-10 mt-4 flex items-center gap-2 text-xs text-purple-100 lg:hidden">
          <CheckCircle2 size={15} className="text-emerald-400 shrink-0" />
          <span>Kelola arus uangmu dengan lebih cerdas dan terarah.</span>
        </div>
      </section>

      {/* Right Column: Auth Form Card + Top-Right Theme Switcher */}
      <section className="relative z-10 flex flex-col justify-center px-4 py-8 sm:px-8 lg:px-12">
        {/* Top-Right Theme Toggle Button (Light / Dark Mode) */}
        <div className="absolute right-5 top-5 sm:right-8 sm:top-6">
          <button
            type="button"
            onClick={() => setTheme(isDark ? "light" : "dark")}
            aria-label={isDark ? "Beralih ke mode terang" : "Beralih ke mode gelap"}
            title={isDark ? "Mode Terang" : "Mode Gelap"}
            className="inline-flex items-center gap-2 rounded-full border border-purple-200/80 dark:border-purple-400/25 bg-white/80 dark:bg-[#191038]/85 px-3.5 py-2 text-xs font-semibold text-foreground shadow-sm transition hover:border-primary active:scale-95"
          >
            {isDark ? (
              <>
                <Sun size={15} className="text-amber-400" />
                <span>Mode Terang</span>
              </>
            ) : (
              <>
                <Moon size={15} className="text-primary" />
                <span>Mode Gelap</span>
              </>
            )}
          </button>
        </div>

        <div className="mx-auto w-full max-w-md rounded-3xl border border-purple-200/80 dark:border-purple-400/20 bg-white/80 dark:bg-[#150d30]/82 p-6 sm:p-8 shadow-[0_20px_50px_rgba(85,44,184,0.08)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.45)]">
          {/* Header Title */}
          <div className="mb-6">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-primary-soft px-3 py-1 text-xs font-semibold text-primary">
              <Sparkles size={13} />
              {isRegister ? "Registrasi Akun Baru" : "Selamat Datang Kembali"}
            </span>

            <h2 className="mt-3 text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground font-sans">
              {isRegister ? "Mulai akun CFlow" : "Masuk ke akunmu"}
            </h2>

            <p className="mt-1 text-xs sm:text-sm text-muted leading-relaxed">
              {isRegister
                ? "Daftar gratis dan mulai kelola arus uangmu secara terstruktur."
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
                  className="pointer-events-none absolute left-3.5 text-muted"
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
              <label className="block text-xs font-semibold uppercase tracking-wider text-foreground-soft mb-1.5">
                Kata Sandi
              </label>
              <div className="relative flex items-center">
                <LockKeyhole
                  aria-hidden="true"
                  size={17}
                  className="pointer-events-none absolute left-3.5 text-muted"
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
                    className="pointer-events-none absolute left-3.5 text-muted"
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
              className="mt-2 flex h-11.5 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#5e32c8] to-[#4721a3] hover:from-[#5227b8] hover:to-[#3c1a8f] text-white font-semibold text-sm shadow-md shadow-primary/25 transition-all active:scale-[0.98] disabled:cursor-wait disabled:opacity-70"
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
          <div className="mt-5 border-t border-border/80 pt-4 text-center">
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
          <div className="mt-4 flex items-center justify-center gap-1.5 text-[11px] text-muted">
            <ShieldCheck size={14} className="text-emerald-500 shrink-0" />
            <span>Data terlindungi dengan enkripsi aman Supabase Auth</span>
          </div>
        </div>
      </section>
    </main>
  );
}
