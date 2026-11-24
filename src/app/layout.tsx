import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { CurrencyProvider } from "@/components/providers/CurrencyProvider";
import { NotificationProvider } from "@/components/providers/NotificationProvider";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { getServerCurrency } from "@/lib/utils/currency-server";
import "./globals.css";

// Geist dipilih karena bentuknya netral dan tetap jelas untuk angka keuangan.
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "CFlow - Keuangan Pribadi",
  description: "Kelola keuangan pribadimu dengan lebih teratur.",
  icons: {
    icon: [
      { url: "/icon.png?v=2", type: "image/png" },
      { url: "/favicon.ico?v=2", sizes: "32x32" },
    ],
    shortcut: "/icon.png?v=2",
    apple: "/icon.png?v=2",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const initialCurrency = await getServerCurrency();

  return (
    <html lang="id" suppressHydrationWarning>
      <body className={`${geistSans.variable} antialiased`}>
        <ThemeProvider>
          <CurrencyProvider initialCurrency={initialCurrency}>
            <NotificationProvider>{children}</NotificationProvider>
          </CurrencyProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
