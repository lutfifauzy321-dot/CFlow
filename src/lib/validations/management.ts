import { z } from "zod";

function isValidDate(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
  );
}

export const budgetSchema = z.object({
  categoryId: z.string().uuid("Kategori tidak valid."),
  bulan: z.string().regex(/^\d{4}-(0[1-9]|1[0-2])$/, "Bulan tidak valid."),
  limitNominal: z
    .number()
    .int("Batas anggaran harus bilangan bulat.")
    .positive("Batas anggaran harus lebih dari 0.")
    .max(Number.MAX_SAFE_INTEGER, "Batas anggaran terlalu besar."),
});

export const savingsGoalSchema = z.object({
  nama: z.string().trim().min(1, "Nama target wajib diisi.").max(100),
  targetNominal: z
    .number()
    .int("Target harus bilangan bulat.")
    .positive("Target harus lebih dari 0.")
    .max(Number.MAX_SAFE_INTEGER, "Target terlalu besar."),
  deadline: z.string().refine(isValidDate, "Tanggal target tidak valid."),
});

export const savingsContributionSchema = z.object({
  goalId: z.string().uuid("Target tabungan tidak valid."),
  amount: z
    .number()
    .int("Nominal harus bilangan bulat.")
    .positive("Nominal harus lebih dari 0.")
    .max(Number.MAX_SAFE_INTEGER, "Nominal terlalu besar."),
});

export const categorySchema = z.object({
  id: z.string().uuid().optional(),
  nama: z.string().trim().min(1, "Nama kategori wajib diisi.").max(60),
  tipe: z.enum(["masuk", "keluar"]),
  ikon: z.string().trim().min(1, "Pilih ikon kategori.").max(40),
  warna: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Pilih warna yang valid."),
});

export type BudgetInput = z.infer<typeof budgetSchema>;
export type SavingsGoalInput = z.infer<typeof savingsGoalSchema>;
export type SavingsContributionInput = z.infer<typeof savingsContributionSchema>;
export type CategoryInput = z.infer<typeof categorySchema>;