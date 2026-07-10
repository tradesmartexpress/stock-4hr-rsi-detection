import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "Stock 4hr RSI Detection",
  description: "Fundamentals-screened watchlist with 4-hr RSI crossover alerts",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased">
        <header className="border-b border-neutral-200">
          <nav className="mx-auto flex max-w-5xl items-center gap-6 px-8 py-4 text-sm">
            <span className="font-semibold">RSI Alert Watchlist</span>
            <Link href="/stocks" className="text-neutral-600 hover:text-neutral-900">
              Stocks
            </Link>
            <Link href="/alerts" className="text-neutral-600 hover:text-neutral-900">
              Alerts
            </Link>
          </nav>
        </header>
        {children}
      </body>
    </html>
  );
}
