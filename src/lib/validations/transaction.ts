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

export const transactionSchema = z.object({
  id: z.string().uuid().optional(),
  keterangan: z
    .string()
    .trim()
    .min(1, "Keterangan wajib diisi.")
    .max(160, "Keterangan maksimal 160 karakter."),
  tipe: z.enum(["masuk", "keluar"], {
    error: "Pilih jenis transaksi.",
  }),
  category_id: z.string().uuid("Pilih kategori yang valid."),
  tanggal: z.string().refine(isValidDate, "Tanggal tidak valid."),
  nominal: z
    .number()
    .int("Nominal harus berupa bilangan bulat.")
    .positive("Nominal harus lebih dari 0.")
    .max(Number.MAX_SAFE_INTEGER, "Nominal terlalu besar."),
  bukti_url: z.string().optional().nullable(),
});

export type TransactionInput = z.infer<typeof transactionSchema>;
