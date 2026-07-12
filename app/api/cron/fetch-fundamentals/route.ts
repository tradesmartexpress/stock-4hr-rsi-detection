import { NextResponse, type NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { fetchFundamentals } from "@/lib/fmp";
import type { Stock } from "@/lib/types";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

function authorized(request: NextRequest): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return true;
  return request.headers.get("authorization") === `Bearer ${secret}`;
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
      const f = await fetchFundamentals(stock.ticker);

      // Only overwrite fields FMP actually returned; preserve manual 5yr
      // CAGR entries (not derivable from a single TTM call).
      const update: Record<string, number> = {};
      if (f.net_profit_margin_avg != null)
        update.net_profit_margin_avg = f.net_profit_margin_avg;
      if (f.roe_avg != null) update.roe_avg = f.roe_avg;
      if (f.roic_avg != null) update.roic_avg = f.roic_avg;
      if (f.debt_to_equity != null) update.debt_to_equity = f.debt_to_equity;

      if (Object.keys(update).length === 0) {
        results.push({ ticker: stock.ticker, skipped: "no data" });
        continue;
      }

      const { error: updateError } = await supabase
        .from("stocks")
        .update(update)
        .eq("id", stock.id);

      if (updateError) throw new Error(updateError.message);

      await supabase.from("audit_logs").insert({
        action: "fundamentals_updated",
        entity_type: "stock",
        entity_id: stock.id,
        payload: { ticker: stock.ticker, update },
        actor: "system",
        user_id: stock.user_id,
      });

      results.push({ ticker: stock.ticker, updated: update });
    } catch (err) {
      const message = err instanceof Error ? err.message : "unknown error";
      results.push({ ticker: stock.ticker, error: message });
    }
  }

  return NextResponse.json({ ok: true, processed: results.length, results });
}
