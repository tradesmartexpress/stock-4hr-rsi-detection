import Link from "next/link";
import { notFound } from "next/navigation";
import { getStockByTicker } from "../queries";
import { PassBadge } from "../PassBadge";
import { DeleteStockButton } from "../DeleteStockButton";
import { RsiForm } from "./RsiForm";
import { createClient } from "@/lib/supabase/server";
import type { RsiReading } from "@/lib/types";

export const dynamic = "force-dynamic";

const RULES: Array<{
  label: string;
  key: keyof NonNullable<Awaited<ReturnType<typeof getStockByTicker>>>;
  threshold: string;
  passes: (v: number | null) => boolean;
}> = [
  {
    label: "Revenue CAGR (5yr)",
    key: "revenue_cagr_5yr",
    threshold: "> 8%",
    passes: (v) => v != null && v > 8,
  },
  {
    label: "Revenue growth streak",
    key: "revenue_growth_consecutive_years",
    threshold: "≥ 5 yrs",
    passes: (v) => v != null && v >= 5,
  },
  {
    label: "EPS CAGR (5yr)",
    key: "eps_cagr_5yr",
    threshold: "> 10%",
    passes: (v) => v != null && v > 10,
  },
  {
    label: "FCF positive",
    key: "fcf_positive_years",
    threshold: "≥ 5 yrs",
    passes: (v) => v != null && v >= 5,
  },
  {
    label: "Net margin avg",
    key: "net_profit_margin_avg",
    threshold: "> 5%",
    passes: (v) => v != null && v > 5,
  },
  {
    label: "ROE avg",
    key: "roe_avg",
    threshold: "> 15%",
    passes: (v) => v != null && v > 15,
  },
  {
    label: "ROIC avg",
    key: "roic_avg",
    threshold: "> 10%",
    passes: (v) => v != null && v > 10,
  },
  {
    label: "Debt / equity",
    key: "debt_to_equity",
    threshold: "< 0.5",
    passes: (v) => v != null && v < 0.5,
  },
];

export default async function StockDetailPage({
  params,
}: {
  params: Promise<{ ticker: string }>;
}) {
  const { ticker } = await params;
  const stock = await getStockByTicker(ticker);

  if (!stock) {
    notFound();
  }

  const supabase = await createClient();
  const { data: readingsData, error: readingsError } = await supabase
    .from("rsi_readings")
    .select("*")
    .eq("stock_id", stock.id)
    .order("candle_timestamp", { ascending: false });

  if (readingsError) {
    throw new Error(readingsError.message);
  }

  const readings = (readingsData ?? []) as RsiReading[];

  return (
    <main className="mx-auto max-w-3xl p-8">
      <Link href="/stocks" className="text-sm text-neutral-500 hover:underline">
        ← Back to watchlist
      </Link>

      <div className="mb-6 mt-2 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            {stock.ticker}{" "}
            <span className="text-lg font-normal text-neutral-500">
              {stock.company_name}
            </span>
          </h1>
          <p className="text-sm text-neutral-500">{stock.sector ?? "—"}</p>
        </div>
        <div className="flex gap-2">
          <Link
            href={`/stocks/${stock.ticker}/edit`}
            className="rounded border border-neutral-300 px-3 py-1.5 text-sm hover:bg-neutral-50"
          >
            Edit
          </Link>
          <DeleteStockButton id={stock.id} ticker={stock.ticker} />
        </div>
      </div>

      <div className="mb-6 flex items-center gap-3">
        <PassBadge pass={stock.fundamental_pass} />
        <span className="text-sm capitalize text-neutral-500">
          Moat: {stock.moat_rating ?? "unrated"}
        </span>
      </div>

      <div className="overflow-hidden rounded border border-neutral-200">
        <table className="w-full text-left text-sm">
          <thead className="bg-neutral-50 text-neutral-600">
            <tr>
              <th className="px-4 py-2.5 font-medium">Rule</th>
              <th className="px-4 py-2.5 font-medium">Threshold</th>
              <th className="px-4 py-2.5 font-medium">Value</th>
              <th className="px-4 py-2.5 font-medium"></th>
            </tr>
          </thead>
          <tbody>
            {RULES.map((rule) => {
              const value = stock[rule.key] as number | null;
              const pass = rule.passes(value);
              return (
                <tr key={rule.label} className="border-t border-neutral-200">
                  <td className="px-4 py-2.5">{rule.label}</td>
                  <td className="px-4 py-2.5 text-neutral-500">
                    {rule.threshold}
                  </td>
                  <td className="px-4 py-2.5">{value ?? "—"}</td>
                  <td className="px-4 py-2.5">{pass ? "✅" : "✕"}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {stock.notes && (
        <div className="mt-6">
          <h2 className="mb-1 text-sm font-medium text-neutral-700">Notes</h2>
          <p className="text-sm text-neutral-600">{stock.notes}</p>
        </div>
      )}

      <div className="mt-8">
        <h2 className="mb-3 text-lg font-semibold tracking-tight">
          RSI Readings (4h)
        </h2>
        <div className="mb-4 rounded border border-neutral-200 p-4">
          <RsiForm stockId={stock.id} ticker={stock.ticker} />
        </div>

        {readings.length === 0 ? (
          <p className="text-sm text-neutral-500">
            No RSI readings logged yet.
          </p>
        ) : (
          <div className="overflow-hidden rounded border border-neutral-200">
            <table className="w-full text-left text-sm">
              <thead className="bg-neutral-50 text-neutral-600">
                <tr>
                  <th className="px-4 py-2.5 font-medium">Candle time</th>
                  <th className="px-4 py-2.5 font-medium">RSI</th>
                  <th className="px-4 py-2.5 font-medium">Source</th>
                </tr>
              </thead>
              <tbody>
                {readings.map((reading) => (
                  <tr key={reading.id} className="border-t border-neutral-200">
                    <td className="px-4 py-2.5">
                      {new Date(reading.candle_timestamp).toLocaleString()}
                    </td>
                    <td className="px-4 py-2.5 font-medium">
                      {reading.rsi_value}
                    </td>
                    <td className="px-4 py-2.5 text-neutral-500">
                      {reading.source}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </main>
  );
}
