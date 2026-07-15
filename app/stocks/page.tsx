import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import type { Stock } from "@/lib/types";
import { PassBadge } from "./PassBadge";
import { DeleteStockButton } from "./DeleteStockButton";
import { compositeScore, MAX_SCORE } from "@/lib/score";

export const dynamic = "force-dynamic";

export default async function StocksPage() {
  const supabase = await createClient();
  const { data, error } = await supabase.from("stocks").select("*");

  if (error) {
    throw new Error(error.message);
  }

  // Ranked watchlist: sort by composite fundamental score (desc), ticker tiebreak.
  const stocks = ((data ?? []) as Stock[])
    .map((s) => ({ ...s, score: compositeScore(s) }))
    .sort((a, b) => b.score - a.score || a.ticker.localeCompare(b.ticker));

  return (
    <main className="mx-auto max-w-5xl p-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Stock Watchlist
          </h1>
          <p className="text-sm text-neutral-500">
            Ranked by composite fundamental score for the 4-hr RSI alert engine.
          </p>
        </div>
        <Link
          href="/stocks/new"
          className="rounded bg-neutral-900 px-4 py-2 text-sm font-medium text-white"
        >
          + Add Stock
        </Link>
      </div>

      {stocks.length === 0 ? (
        <div className="rounded border border-dashed border-neutral-300 p-12 text-center">
          <p className="text-neutral-500">
            Add your first stock to the watchlist.
          </p>
          <Link
            href="/stocks/new"
            className="mt-4 inline-block rounded bg-neutral-900 px-4 py-2 text-sm font-medium text-white"
          >
            + Add Stock
          </Link>
        </div>
      ) : (
        <div className="overflow-hidden rounded border border-neutral-200">
          <table className="w-full text-left text-sm">
            <thead className="bg-neutral-50 text-neutral-600">
              <tr>
                <th className="px-4 py-2.5 font-medium">Rank</th>
                <th className="px-4 py-2.5 font-medium">Ticker</th>
                <th className="px-4 py-2.5 font-medium">Company</th>
                <th className="px-4 py-2.5 font-medium">Sector</th>
                <th className="px-4 py-2.5 font-medium">Moat</th>
                <th className="px-4 py-2.5 font-medium">Score</th>
                <th className="px-4 py-2.5 font-medium">Fundamentals</th>
                <th className="px-4 py-2.5 font-medium"></th>
              </tr>
            </thead>
            <tbody>
              {stocks.map((stock, i) => (
                <tr key={stock.id} className="border-t border-neutral-200">
                  <td className="px-4 py-3 text-neutral-400">{i + 1}</td>
                  <td className="px-4 py-3 font-semibold">
                    <Link href={`/stocks/${stock.ticker}`} className="hover:underline">
                      {stock.ticker}
                    </Link>
                  </td>
                  <td className="px-4 py-3">{stock.company_name}</td>
                  <td className="px-4 py-3 text-neutral-500">
                    {stock.sector ?? "—"}
                  </td>
                  <td className="px-4 py-3 capitalize text-neutral-500">
                    {stock.moat_rating ?? "—"}
                  </td>
                  <td className="px-4 py-3 font-medium tabular-nums">
                    {stock.score}
                    <span className="text-neutral-400">/{MAX_SCORE}</span>
                  </td>
                  <td className="px-4 py-3">
                    <PassBadge pass={stock.fundamental_pass} />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      <Link
                        href={`/stocks/${stock.ticker}/edit`}
                        className="rounded border border-neutral-300 px-3 py-1.5 text-sm hover:bg-neutral-50"
                      >
                        Edit
                      </Link>
                      <DeleteStockButton id={stock.id} ticker={stock.ticker} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}
