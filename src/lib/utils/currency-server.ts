import { cookies } from "next/headers";
import {
  CURRENCY_COOKIE_NAME,
  isValidCurrency,
  type CurrencyCode,
} from "@/lib/utils/currency";

export async function getServerCurrency(): Promise<CurrencyCode> {
  try {
    const cookieStore = await cookies();
    const raw = cookieStore.get(CURRENCY_COOKIE_NAME)?.value;
    if (isValidCurrency(raw)) return raw;
  } catch {
    // Fallback when called outside request context
  }
  return "IDR";
}
