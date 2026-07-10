import { createClient } from "@/lib/supabase/server";
import type { Stock } from "@/lib/types";

export async function getStockByTicker(ticker: string): Promise<Stock | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("stocks")
    .select("*")
    .eq("ticker", ticker.toUpperCase())
    .order("created_at", { ascending: true })
    .limit(1);

  if (error) {
    throw new Error(error.message);
  }

  return (data?.[0] as Stock) ?? null;
}
