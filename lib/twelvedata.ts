// Twelve Data client for 4-hour intraday candles.
//
// FMP's intraday `historical-chart/4hour` endpoint is paywalled on the
// current plan (returns 402), so 4h candles come from Twelve Data's free
// tier, which supports `interval=4h` natively. Fundamentals still come from
// FMP (see lib/fmp.ts) — only the candle feed moved.
//
// Free tier limits: ~8 requests/min, ~800/day. A per-run scan makes one
// request per stock, so keep the watchlist comfortably under 8 symbols or
// add throttling before growing it.

const BASE = "https://api.twelvedata.com";

// How many 4h candles to pull. RSI-14 only needs 15, but a longer warmup
// makes Wilder's smoothing converge to the value charting tools show.
const OUTPUT_SIZE = 200;

function apiKey(): string {
  const key = process.env.TWELVEDATA_API_KEY;
  if (!key) {
    throw new Error("TWELVEDATA_API_KEY is not set.");
  }
  return key;
}

export interface Candle {
  date: string; // "2026-07-18 09:30:00" (exchange-local time)
  open: number;
  low: number;
  high: number;
  close: number;
  volume: number;
}

interface TwelveDataValue {
  datetime: string;
  open: string;
  high: string;
  low: string;
  close: string;
  volume?: string;
}

interface TwelveDataResponse {
  status?: "ok" | "error";
  code?: number;
  message?: string;
  values?: TwelveDataValue[];
}

/**
 * Fetch 4-hour OHLCV candles for a ticker, returned in CHRONOLOGICAL order
 * (oldest first). `order=ASC` asks Twelve Data for chronological order
 * directly.
 *
 * Twelve Data signals problems two ways: a non-2xx HTTP status, or a 200
 * body with `status: "error"` (bad symbol, rate limit, etc). Both are
 * surfaced as thrown errors so the cron route's per-ticker try/catch can
 * audit-log and continue.
 */
export async function fetchFourHourCandles(ticker: string): Promise<Candle[]> {
  const params = new URLSearchParams({
    symbol: ticker,
    interval: "4h",
    outputsize: String(OUTPUT_SIZE),
    order: "ASC",
    apikey: apiKey(),
  });

  const res = await fetch(`${BASE}/time_series?${params}`, {
    cache: "no-store",
  });

  // Twelve Data returns 429 (with a message) when the rate limit is hit.
  if (!res.ok) {
    let detail = "";
    try {
      const body = (await res.json()) as TwelveDataResponse;
      detail = body?.message ? ` — ${body.message}` : "";
    } catch {
      /* non-JSON error body */
    }
    throw new Error(
      `Twelve Data 4h fetch failed for ${ticker}: ${res.status}${detail}`,
    );
  }

  const data = (await res.json()) as TwelveDataResponse;

  if (data.status === "error") {
    throw new Error(
      `Twelve Data 4h fetch failed for ${ticker}: ${data.message ?? "unknown error"}`,
    );
  }

  const values = data.values ?? [];
  return values.map((v) => ({
    date: v.datetime,
    open: Number(v.open),
    high: Number(v.high),
    low: Number(v.low),
    close: Number(v.close),
    volume: v.volume == null ? 0 : Number(v.volume),
  }));
}
