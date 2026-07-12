"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { processRsiReading } from "@/lib/alert-engine";

export interface RsiFormState {
  error: string | null;
  alertCreated?: boolean;
}

export async function logRsiReading(
  stockId: string,
  ticker: string,
  _prevState: RsiFormState,
  formData: FormData,
): Promise<RsiFormState> {
  const rsiValueRaw = formData.get("rsi_value");
  const timestampRaw = formData.get("candle_timestamp");

  const rsiValue = Number(rsiValueRaw);
  if (!rsiValueRaw || typeof rsiValueRaw !== "string" || Number.isNaN(rsiValue)) {
    return { error: "RSI value is required and must be a number." };
  }
  if (!timestampRaw || typeof timestampRaw !== "string") {
    return { error: "Candle timestamp is required." };
  }
  const candleTimestamp = new Date(timestampRaw);
  if (Number.isNaN(candleTimestamp.getTime())) {
    return { error: "Invalid timestamp." };
  }

  const supabase = await createClient();

  const { data: stock, error: stockError } = await supabase
    .from("stocks")
    .select("id, fundamental_pass")
    .eq("id", stockId)
    .single();

  if (stockError || !stock) {
    return { error: "Stock not found." };
  }

  try {
    const result = await processRsiReading(supabase, {
      stockId,
      ticker,
      fundamentalPass: stock.fundamental_pass,
      rsiValue,
      candleTimestamp: candleTimestamp.toISOString(),
      source: "manual",
    });

    revalidatePath(`/stocks/${ticker}`);
    revalidatePath("/alerts");

    return { error: null, alertCreated: result.alertCreated };
  } catch (err) {
    return {
      error: err instanceof Error ? err.message : "Failed to log reading.",
    };
  }
}
