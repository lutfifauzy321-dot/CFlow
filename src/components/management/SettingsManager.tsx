"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  AlertCircle,
  Camera,
  Check,
  Globe,
  KeyRound,
  Lock,
  LogOut,
  Minus,
  RefreshCw,
  Trash2,
  TrendingDown,
  TrendingUp,
  User,
} from "lucide-react";
import { logoutAction } from "@/actions/auth";
import {
  updateCurrencyAction,
  updatePasswordAction,
  updateProfileAction,
} from "@/actions/profile";
import { useCurrency } from "@/components/providers/CurrencyProvider";
import { useNotification } from "@/components/providers/NotificationProvider";
import { CURRENCIES, FOREIGN_CURRENCIES, type CurrencyCode } from "@/lib/utils/currency";

type SettingsManagerProps = {
  user: {
    id: string;
    email: string;
    nama: string;
    avatarUrl: string | null;
  };
  stats: {
    totalTransactions: number;
    totalCategories: number;
  };
  initialTab?: "profile" | "security" | "preferences";
};

export function SettingsManager({
  user,
  stats,
  initialTab = "profile",
}: SettingsManagerProps) {
  const router = useRouter();
  const { currency, setCurrency, ratesPayload, activeRate, isRefreshing, refreshRates } = useCurrency();
  const { toast } = useNotification();
  const [activeTab, setActiveTab] = useState<"profile" | "security" | "preferences">(initialTab);

  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);

  // Profile Form state
  const [profilePending, startProfileTransition] = useTransition();
  const [profileMsg, setProfileMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(user.avatarUrl);
  const [avatarDirty, setAvatarDirty] = useState(false);
  const avatarInputRef = useRef<HTMLInputElement>(null);

  // Password Form state
  const [passwordPending, startPasswordTransition] = useTransition();
  const [passwordMsg, setPasswordMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Currency state
  const [currencyPending, startCurrencyTransition] = useTransition();
  const [currencyMsg, setCurrencyMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const initials = user.nama
    ? user.nama
        .split(" ")
        .map((n) => n[0])
        .filter(Boolean)
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : "CF";

  function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setProfileMsg({ type: "error", text: "File foto profil harus berupa gambar (JPG, PNG, WebP)." });
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const targetSize = 256;
        const minSide = Math.min(img.width, img.height);
        const sx = (img.width - minSide) / 2;
        const sy = (img.height - minSide) / 2;

        canvas.width = targetSize;
        canvas.height = targetSize;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.drawImage(img, sx, sy, minSide, minSide, 0, 0, targetSize, targetSize);
          const dataUrl = canvas.toDataURL("image/jpeg", 0.85);
          setAvatarPreview(dataUrl);
          setAvatarDirty(true);
          setProfileMsg(null);
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  }

  function handleRemoveAvatar() {
    setAvatarPreview(null);
    setAvatarDirty(true);
    if (avatarInputRef.current) {
      avatarInputRef.current.value = "";
    }
  }

  async function handleProfileSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setProfileMsg(null);
    const formData = new FormData(e.currentTarget);
    if (avatarDirty) {
      formData.set("avatar_url", avatarPreview ?? "");
    }
    startProfileTransition(async () => {
      const result = await updateProfileAction(formData);
      if (result.success) {
        setAvatarDirty(false);
        const msg = result.message ?? "Profil berhasil disimpan!";
        setProfileMsg({ type: "success", text: msg });
        toast.success(msg);
        router.refresh();
      } else {
        const msg = result.error ?? "Gagal menyimpan profil.";
        setProfileMsg({ type: "error", text: msg });
        toast.error(msg);
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
        const msg = result.message ?? "Kata sandi berhasil diubah!";
        setPasswordMsg({ type: "success", text: msg });
        toast.success(msg);
        form.reset();
      } else {
        const msg = result.error ?? "Gagal mengubah kata sandi.";
        setPasswordMsg({ type: "error", text: msg });
        toast.error(msg);
      }
    });
  }

  function handleCurrencyChange(nextCurrency: CurrencyCode) {
    setCurrencyMsg(null);
    setCurrency(nextCurrency);
    startCurrencyTransition(async () => {
      const result = await updateCurrencyAction(nextCurrency);
      if (result.success) {
        const msg = `Mata uang berhasil diubah ke ${CURRENCIES[nextCurrency].name} (${nextCurrency}).`;
        setCurrencyMsg({ type: "success", text: msg });
        toast.success(msg);
        router.refresh();
      } else {
        const msg = result.error ?? "Gagal mengubah mata uang.";
        setCurrencyMsg({ type: "error", text: msg });
        toast.error(msg);
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
          Kelola profil, foto akun, kata sandi, serta preferensi mata uang CFlow Anda.
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
            onClick={() => setActiveTab("preferences")}
            className={`flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-xs sm:text-sm font-semibold transition ${
              activeTab === "preferences"
                ? "bg-primary text-white shadow-sm"
                : "text-muted hover:bg-surface-alt hover:text-foreground"
            }`}
          >
            <Globe size={18} />
            <span>Data & Referensi</span>
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
                  Perbarui foto profil, nama pengguna, dan identitas akun Anda di CFlow.
                </p>
              </div>

              {/* Avatar Row with Upload */}
              <div className="flex flex-wrap items-center gap-4">
                <div className="relative group">
                  {avatarPreview ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      src={avatarPreview}
                      alt={user.nama}
                      className="size-20 shrink-0 rounded-full object-cover border-2 border-primary/25 shadow-sm"
                    />
                  ) : (
                    <div className="grid size-20 shrink-0 place-items-center rounded-full bg-primary-soft text-2xl font-bold text-primary border-2 border-primary/20 shadow-xs">
                      {initials}
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={() => avatarInputRef.current?.click()}
                    title="Ubah foto profil"
                    className="absolute -bottom-1 -right-1 grid size-8 place-items-center rounded-full border-2 border-surface bg-primary text-white shadow-sm transition hover:bg-primary-hover"
                  >
                    <Camera size={14} />
                  </button>
                  <input
                    ref={avatarInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarChange}
                    className="hidden"
                  />
                </div>

                <div className="space-y-1.5">
                  <div>
                    <p className="text-sm font-bold text-foreground">{user.nama}</p>
                    <p className="text-xs text-muted">{user.email}</p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() => avatarInputRef.current?.click()}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-surface-alt px-2.5 py-1 text-xs font-semibold text-foreground-soft hover:border-primary/40 hover:text-primary transition"
                    >
                      <Camera size={13} />
                      <span>{avatarPreview ? "Ganti Foto" : "Unggah Foto"}</span>
                    </button>
                    {avatarPreview && (
                      <button
                        type="button"
                        onClick={handleRemoveAvatar}
                        className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium text-danger hover:bg-danger-soft transition"
                      >
                        <Trash2 size={13} />
                        <span>Hapus</span>
                      </button>
                    )}
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 px-2 py-0.5 text-[10px] font-semibold">
                      <Check size={11} /> Terverifikasi
                    </span>
                  </div>
                </div>
              </div>

              {profileMsg && (
                <div
                  className={`flex items-center gap-2 rounded-xl p-3 text-xs ${
                    profileMsg.type === "success"
                      ? "bg-emerald-50 text-emerald-800 border border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800/50"
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
                      ? "bg-emerald-50 text-emerald-800 border border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800/50"
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

          {/* TAB 3: DATA & REFERENSI */}
          {activeTab === "preferences" && (
            <div className="space-y-6">
              <div className="border-b border-border-soft pb-4">
                <h2 className="text-base sm:text-lg font-bold text-foreground">
                  Data & Referensi
                </h2>
                <p className="text-xs text-muted">
                  Ringkasan data akun dan pengaturan mata uang tampilan CFlow Anda.
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

              {currencyMsg && (
                <div
                  className={`flex max-w-lg items-center gap-2 rounded-xl p-3 text-xs ${
                    currencyMsg.type === "success"
                      ? "bg-emerald-50 text-emerald-800 border border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800/50"
                      : "bg-danger-soft text-danger border border-danger/20"
                  }`}
                >
                  {currencyMsg.type === "success" ? <Check size={15} /> : <AlertCircle size={15} />}
                  <span>{currencyMsg.text}</span>
                </div>
              )}

              <div className="space-y-3 max-w-xl pt-2">
                <div className="rounded-2xl border border-border p-4 space-y-4">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-xs font-bold text-foreground">Mata Uang Tampilan</p>
                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold ${
                            ratesPayload.isLive
                              ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/70 dark:text-emerald-300"
                              : "bg-amber-50 text-amber-700 dark:bg-amber-950/70 dark:text-amber-300"
                          }`}
                        >
                          <span
                            className={`size-1.5 rounded-full ${
                              ratesPayload.isLive ? "bg-emerald-500 animate-pulse" : "bg-amber-500"
                            }`}
                          />
                          {ratesPayload.isLive ? "Kurs Live" : "Estimasi"}
                        </span>
                      </div>
                      <p className="text-[11px] text-muted mt-0.5">
                        Nominal IDR otomatis menyesuaikan kurs pasar secara live.
                      </p>
                    </div>
                    <select
                      aria-label="Pilih mata uang tampilan"
                      value={currency}
                      disabled={currencyPending}
                      onChange={(e) => handleCurrencyChange(e.target.value as CurrencyCode)}
                      className="h-10 shrink-0 rounded-xl border border-border bg-surface-alt px-3 text-xs font-semibold text-primary outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                    >
                      {Object.values(CURRENCIES).map((item) => (
                        <option key={item.code} value={item.code}>
                          {item.code} ({item.symbol}) - {item.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Active Foreign Currency Live Status & Up/Down Arrow Indicator */}
                  {currency !== "IDR" && activeRate && (
                    <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border-soft bg-surface-alt/60 px-3.5 py-3">
                      <div>
                        <p className="text-[11px] font-medium text-muted">
                          Kurs Live Saat Ini ({ratesPayload.date})
                        </p>
                        <p className="mt-0.5 text-sm font-bold tabular-nums text-foreground">
                          1 {currency} = Rp {Math.round(activeRate.idrPerUnit).toLocaleString("id-ID")}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        {activeRate.trend === "up" && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 dark:bg-emerald-950/70 border border-emerald-200 dark:border-emerald-800/50 px-2.5 py-1 text-xs font-bold text-emerald-700 dark:text-emerald-300">
                            <TrendingUp size={14} strokeWidth={2.5} />
                            <span>
                              {currency} Menguat (+{Math.abs(activeRate.changePercent)}%)
                            </span>
                          </span>
                        )}
                        {activeRate.trend === "down" && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 dark:bg-rose-950/70 border border-rose-200 dark:border-rose-800/50 px-2.5 py-1 text-xs font-bold text-rose-600 dark:text-rose-300">
                            <TrendingDown size={14} strokeWidth={2.5} />
                            <span>
                              IDR Menguat (-{Math.abs(activeRate.changePercent)}%)
                            </span>
                          </span>
                        )}
                        {activeRate.trend === "flat" && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-surface border border-border px-2.5 py-1 text-xs font-semibold text-muted">
                            <Minus size={13} />
                            <span>Stabil (0%)</span>
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Live FX Market Board for All Supported Foreign Currencies */}
                  <div className="border-t border-border-soft pt-3 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <p className="text-[11px] font-semibold uppercase tracking-wider text-muted">
                        Papan Kurs Live terhadap IDR ({ratesPayload.source})
                      </p>
                      <button
                        type="button"
                        onClick={() => refreshRates()}
                        disabled={isRefreshing}
                        className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-[11px] font-semibold text-primary hover:bg-primary-soft transition disabled:opacity-50"
                      >
                        <RefreshCw size={12} className={isRefreshing ? "animate-spin" : ""} />
                        <span>{isRefreshing ? "Memuat..." : "Perbarui"}</span>
                      </button>
                    </div>

                    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                      {FOREIGN_CURRENCIES.map((code) => {
                        const rate = ratesPayload.rates[code];
                        const isSelected = currency === code;
                        return (
                          <button
                            key={code}
                            type="button"
                            onClick={() => handleCurrencyChange(code)}
                            className={`flex items-center justify-between gap-2 rounded-xl border px-3 py-2 text-left transition ${
                              isSelected
                                ? "border-primary bg-primary-soft/50 shadow-2xs"
                                : "border-border/80 bg-surface-alt/40 hover:border-primary/40"
                            }`}
                          >
                            <div className="min-w-0">
                              <p className="text-xs font-bold text-foreground">
                                {code}{" "}
                                <span className="font-normal text-muted">
                                  ({CURRENCIES[code].symbol})
                                </span>
                              </p>
                              <p className="text-[11px] font-semibold tabular-nums text-foreground-soft">
                                Rp {Math.round(rate.idrPerUnit).toLocaleString("id-ID")}
                              </p>
                            </div>

                            {rate.trend === "up" ? (
                              <span
                                title={`${code} lebih kuat / naik terhadap IDR`}
                                className="inline-flex shrink-0 items-center gap-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/70 px-2 py-0.5 text-[11px] font-bold text-emerald-600 dark:text-emerald-400"
                              >
                                <TrendingUp size={12} strokeWidth={2.5} />
                                +{Math.abs(rate.changePercent)}%
                              </span>
                            ) : rate.trend === "down" ? (
                              <span
                                title={`IDR menguat / ${code} turun`}
                                className="inline-flex shrink-0 items-center gap-0.5 rounded-full bg-rose-50 dark:bg-rose-950/70 px-2 py-0.5 text-[11px] font-bold text-rose-600 dark:text-rose-400"
                              >
                                <TrendingDown size={12} strokeWidth={2.5} />
                                -{Math.abs(rate.changePercent)}%
                              </span>
                            ) : (
                              <span className="inline-flex shrink-0 items-center gap-0.5 rounded-full bg-surface px-2 py-0.5 text-[11px] font-medium text-muted">
                                <Minus size={11} /> 0%
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
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
