"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export interface RsiFormState {
  error: string | null;
  alertCreated?: boolean;
}

const FOUR_HOURS_MS = 4 * 60 * 60 * 1000;

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

  const { data: prevReadings, error: prevError } = await supabase
    .from("rsi_readings")
    .select("rsi_value, candle_timestamp")
    .eq("stock_id", stockId)
    .lt("candle_timestamp", candleTimestamp.toISOString())
    .order("candle_timestamp", { ascending: false })
    .limit(1);

  if (prevError) {
    return { error: prevError.message };
  }

  const { data: inserted, error: insertError } = await supabase
    .from("rsi_readings")
    .insert({
      stock_id: stockId,
      ticker,
      rsi_value: rsiValue,
      candle_timestamp: candleTimestamp.toISOString(),
      source: "manual",
    })
    .select("id")
    .single();

  if (insertError) {
    return { error: insertError.message };
  }

  await supabase.from("audit_logs").insert({
    action: "rsi_logged",
    entity_type: "rsi_reading",
    entity_id: inserted.id,
    payload: {
      ticker,
      rsi_value: rsiValue,
      candle_timestamp: candleTimestamp.toISOString(),
    },
    actor: "user",
  });

  const prev = prevReadings?.[0];
  const isCrossover = prev != null && Number(prev.rsi_value) >= 20 && rsiValue < 20;

  let alertCreated = false;

  if (isCrossover && stock.fundamental_pass) {
    const windowStart = new Date(
      candleTimestamp.getTime() - FOUR_HOURS_MS,
    ).toISOString();
    const windowEnd = new Date(
      candleTimestamp.getTime() + FOUR_HOURS_MS,
    ).toISOString();

    const { data: existingAlerts } = await supabase
      .from("alert_events")
      .select("id")
      .eq("stock_id", stockId)
      .gte("triggered_at", windowStart)
      .lte("triggered_at", windowEnd)
      .limit(1);

    if (!existingAlerts || existingAlerts.length === 0) {
      const { data: alertRow, error: alertError } = await supabase
        .from("alert_events")
        .insert({
          stock_id: stockId,
          ticker,
          rsi_value: rsiValue,
          triggered_at: candleTimestamp.toISOString(),
          alert_type: "rsi_cross_below_20",
          status: "pending",
        })
        .select("id")
        .single();

      if (!alertError && alertRow) {
        alertCreated = true;
        await supabase.from("audit_logs").insert({
          action: "rsi_alert_triggered",
          entity_type: "alert_event",
          entity_id: alertRow.id,
          payload: {
            ticker,
            rsi_value: rsiValue,
            triggered_at: candleTimestamp.toISOString(),
          },
          actor: "system",
        });
      }
    }
  }

  revalidatePath(`/stocks/${ticker}`);
  revalidatePath("/alerts");

  return { error: null, alertCreated };
}
