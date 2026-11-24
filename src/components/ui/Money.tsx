"use client";

import { useCurrency } from "@/components/providers/CurrencyProvider";

export function Money({ amount }: { amount: number | bigint }) {
  const { formatMoney } = useCurrency();
  return <>{formatMoney(amount)}</>;
}
