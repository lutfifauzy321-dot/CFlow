export const APP_NAME = "Cflow";

export const DASHBOARD_PATHS = [
  "/dashboard",
  "/ringkasan",
  "/transaksi",
  "/anggaran",
  "/target-tabungan",
  "/laporan",
  "/kategori",
  "/profil",
  "/pengaturan",
] as const;

export const DEFAULT_CATEGORIES = [
  { nama: "Makanan & Minuman", tipe: "keluar", ikon: "utensils", warna: "#F59E0B" },
  { nama: "Transportasi", tipe: "keluar", ikon: "car", warna: "#3B82F6" },
  { nama: "Belanja", tipe: "keluar", ikon: "shopping-bag", warna: "#EC4899" },
  { nama: "Hiburan", tipe: "keluar", ikon: "clapperboard", warna: "#8B5CF6" },
  { nama: "Gaji", tipe: "masuk", ikon: "wallet", warna: "#10B981" },
  { nama: "Lainnya", tipe: "keluar", ikon: "circle-ellipsis", warna: "#64748B" },
] as const;
