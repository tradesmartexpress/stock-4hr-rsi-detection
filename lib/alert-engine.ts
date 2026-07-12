import type { SupabaseClient } from "@supabase/supabase-js";
import { sendEmailAlert } from "./email";

const FOUR_HOURS_MS = 4 * 60 * 60 * 1000;

export interface ProcessResult {
  readingId: string | null;
  duplicateReading: boolean;
  alertCreated: boolean;
  deliveryStatus: "sent" | "failed" | null;
}

/**
 * Core RSI ingestion + crossover engine, shared by the manual entry
 * server action and the cron route.
 *
 * 1. (cron only) skip if a reading already exists for this candle.
 * 2. insert rsi_readings row + audit log.
 * 3. crossover rule: previous reading >= 20 AND new < 20.
 * 4. gated on the stock's stored fundamental_pass.
 * 5. idempotency: at most one alert per stock per 4-hour window.
 * 6. on new alert: insert alert_events + audit log, then attempt email
 *    delivery and record an alert_deliveries row.
 */
export async function processRsiReading(
  supabase: SupabaseClient,
  opts: {
    stockId: string;
    ticker: string;
    fundamentalPass: boolean | null;
    rsiValue: number;
    candleTimestamp: string; // ISO
    source: string; // "manual" | "cron-fmp"
    skipIfCandleExists?: boolean;
  },
): Promise<ProcessResult> {
  const {
    stockId,
    ticker,
    fundamentalPass,
    rsiValue,
    candleTimestamp,
    source,
    skipIfCandleExists = false,
  } = opts;

  if (skipIfCandleExists) {
    const { data: existing } = await supabase
      .from("rsi_readings")
      .select("id")
      .eq("stock_id", stockId)
      .eq("candle_timestamp", candleTimestamp)
      .limit(1);
    if (existing && existing.length > 0) {
      return {
        readingId: existing[0].id,
        duplicateReading: true,
        alertCreated: false,
        deliveryStatus: null,
      };
    }
  }

  // Previous reading strictly before this candle.
  const { data: prevReadings } = await supabase
    .from("rsi_readings")
    .select("rsi_value, candle_timestamp")
    .eq("stock_id", stockId)
    .lt("candle_timestamp", candleTimestamp)
    .order("candle_timestamp", { ascending: false })
    .limit(1);

  const { data: inserted, error: insertError } = await supabase
    .from("rsi_readings")
    .insert({
      stock_id: stockId,
      ticker,
      rsi_value: rsiValue,
      candle_timestamp: candleTimestamp,
      source,
    })
    .select("id")
    .single();

  if (insertError || !inserted) {
    throw new Error(insertError?.message ?? "Failed to insert RSI reading");
  }

  await supabase.from("audit_logs").insert({
    action: "rsi_logged",
    entity_type: "rsi_reading",
    entity_id: inserted.id,
    payload: { ticker, rsi_value: rsiValue, candle_timestamp: candleTimestamp },
    actor: source === "manual" ? "user" : "system",
  });

  const prev = prevReadings?.[0];
  const isCrossover =
    prev != null && Number(prev.rsi_value) >= 20 && rsiValue < 20;

  if (!isCrossover || !fundamentalPass) {
    return {
      readingId: inserted.id,
      duplicateReading: false,
      alertCreated: false,
      deliveryStatus: null,
    };
  }

  // Idempotency: don't fire twice inside a 4-hour window.
  const windowStart = new Date(
    new Date(candleTimestamp).getTime() - FOUR_HOURS_MS,
  ).toISOString();
  const windowEnd = new Date(
    new Date(candleTimestamp).getTime() + FOUR_HOURS_MS,
  ).toISOString();

  const { data: existingAlerts } = await supabase
    .from("alert_events")
    .select("id")
    .eq("stock_id", stockId)
    .gte("triggered_at", windowStart)
    .lte("triggered_at", windowEnd)
    .limit(1);

  if (existingAlerts && existingAlerts.length > 0) {
    return {
      readingId: inserted.id,
      duplicateReading: false,
      alertCreated: false,
      deliveryStatus: null,
    };
  }

  const { data: alertRow, error: alertError } = await supabase
    .from("alert_events")
    .insert({
      stock_id: stockId,
      ticker,
      rsi_value: rsiValue,
      triggered_at: candleTimestamp,
      alert_type: "rsi_cross_below_20",
      status: "pending",
    })
    .select("id")
    .single();

  if (alertError || !alertRow) {
    throw new Error(alertError?.message ?? "Failed to insert alert event");
  }

  await supabase.from("audit_logs").insert({
    action: "rsi_alert_triggered",
    entity_type: "alert_event",
    entity_id: alertRow.id,
    payload: { ticker, rsi_value: rsiValue, triggered_at: candleTimestamp },
    actor: "system",
  });

  // High-risk action (external send) — always logged to alert_deliveries.
  const delivery = await sendEmailAlert({
    ticker,
    rsiValue,
    triggeredAt: candleTimestamp,
  });

  await supabase.from("alert_deliveries").insert({
    alert_event_id: alertRow.id,
    channel: "email",
    recipient: delivery.recipient || "unconfigured",
    status: delivery.status,
    delivered_at: delivery.status === "sent" ? new Date().toISOString() : null,
    error_message: delivery.error,
  });

  return {
    readingId: inserted.id,
    duplicateReading: false,
    alertCreated: true,
    deliveryStatus: delivery.status,
  };
}
