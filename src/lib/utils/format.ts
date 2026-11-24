import { formatCurrencyValue, type CurrencyCode } from "@/lib/utils/currency";

export function formatRupiah(
  nominal: number | bigint,
  currency: CurrencyCode = "IDR",
): string {
  return formatCurrencyValue(nominal, currency);
}
