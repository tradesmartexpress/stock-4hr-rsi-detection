import { NextResponse, type NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { fetchFourHourCandles } from "@/lib/fmp";
import { computeRsi } from "@/lib/rsi";
import { processRsiReading } from "@/lib/alert-engine";
import type { Stock } from "@/lib/types";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

function authorized(request: NextRequest): boolean {
  const secret = process.env.CRON_SECRET;
  // Vercel Cron sends `Authorization: Bearer <CRON_SECRET>` when it's set.
  if (!secret) return true;
  const header = request.headers.get("authorization");
  return header === `Bearer ${secret}`;
}

function toIso(fmpDate: string): string {
  // FMP candle date is "YYYY-MM-DD HH:mm:ss" in US/Eastern exchange time.
  // Treat it as UTC-ish for a stable, comparable timestamp; the exact zone
  // doesn't affect crossover logic (ordering) or idempotency (equality).
  return new Date(fmpDate.replace(" ", "T") + "Z").toISOString();
}

export async function GET(request: NextRequest) {
  if (!authorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createAdminClient();
  const { data, error } = await supabase.from("stocks").select("*");
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const stocks = (data ?? []) as Stock[];
  const results: Array<Record<string, unknown>> = [];

  for (const stock of stocks) {
    try {
      const candles = await fetchFourHourCandles(stock.ticker);
      if (candles.length < 15) {
        results.push({ ticker: stock.ticker, skipped: "insufficient candles" });
        continue;
      }

      const closes = candles.map((c) => c.close);
      const rsi = computeRsi(closes, 14);
      if (rsi == null) {
        results.push({ ticker: stock.ticker, skipped: "rsi null" });
        continue;
      }

      const latest = candles[candles.length - 1];
      const candleIso = toIso(latest.date);

      const result = await processRsiReading(supabase, {
        stockId: stock.id,
        ticker: stock.ticker,
        fundamentalPass: stock.fundamental_pass,
        rsiValue: Math.round(rsi * 100) / 100,
        candleTimestamp: candleIso,
        source: "cron-fmp",
        skipIfCandleExists: true,
      });

      results.push({
        ticker: stock.ticker,
        rsi: Math.round(rsi * 100) / 100,
        candle: candleIso,
        duplicate: result.duplicateReading,
        alertCreated: result.alertCreated,
        delivery: result.deliveryStatus,
      });
    } catch (err) {
      // Log and continue — one bad ticker shouldn't abort the whole run.
      const message = err instanceof Error ? err.message : "unknown error";
      await supabase.from("audit_logs").insert({
        action: "cron_fetch_rsi_error",
        entity_type: "stock",
        entity_id: stock.id,
        payload: { ticker: stock.ticker, error: message },
        actor: "system",
      });
      results.push({ ticker: stock.ticker, error: message });
    }
  }

  return NextResponse.json({ ok: true, processed: results.length, results });
}
