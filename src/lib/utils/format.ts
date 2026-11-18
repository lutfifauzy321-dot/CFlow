const rupiahFormatter = new Intl.NumberFormat("id-ID", {
  style: "currency",
  currency: "IDR",
  maximumFractionDigits: 0,
});

export function formatRupiah(nominal: number | bigint): string {
  return rupiahFormatter.format(Number(nominal));
}
