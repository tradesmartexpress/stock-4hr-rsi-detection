import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";
import { createClient } from "@/lib/supabase/server";
import { signOut } from "./auth/actions";

export const metadata: Metadata = {
  title: "Stock 4hr RSI Detection",
  description: "Fundamentals-screened watchlist with 4-hr RSI crossover alerts",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <html lang="en">
      <body className="antialiased">
        <header className="border-b border-neutral-200">
          <nav className="mx-auto flex max-w-5xl items-center gap-6 px-8 py-4 text-sm">
            <span className="font-semibold">RSI Alert Watchlist</span>
            {user && (
              <>
                <Link
                  href="/stocks"
                  className="text-neutral-600 hover:text-neutral-900"
                >
                  Stocks
                </Link>
                <Link
                  href="/alerts"
                  className="text-neutral-600 hover:text-neutral-900"
                >
                  Alerts
                </Link>
                <Link
                  href="/settings"
                  className="text-neutral-600 hover:text-neutral-900"
                >
                  Settings
                </Link>
                <div className="ml-auto flex items-center gap-3">
                  <span className="text-neutral-400">{user.email}</span>
                  <form action={signOut}>
                    <button
                      type="submit"
                      className="text-neutral-600 hover:text-neutral-900"
                    >
                      Sign out
                    </button>
                  </form>
                </div>
              </>
            )}
          </nav>
        </header>
        {children}
      </body>
    </html>
  );
}
