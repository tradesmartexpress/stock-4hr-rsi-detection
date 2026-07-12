// Financial Modeling Prep client — uses the newer `stable` API base.
// The legacy /api/v3 base returns 401 for stable-tier keys.

const BASE = "https://financialmodelingprep.com/stable";

function apiKey(): string {
  const key = process.env.FMP_API_KEY;
  if (!key) {
    throw new Error("FMP_API_KEY is not set.");
  }
  return key;
}

export interface FmpCandle {
  date: string; // "2026-07-10 13:30:00" (US/Eastern exchange time)
  open: number;
  low: number;
  high: number;
  close: number;
  volume: number;
}

/**
 * Fetch 4-hour OHLCV candles for a ticker, returned in CHRONOLOGICAL
 * order (oldest first). FMP returns newest-first, so we reverse.
 */
export async function fetchFourHourCandles(
  ticker: string,
  fromISODate?: string,
  toISODate?: string,
): Promise<FmpCandle[]> {
  const params = new URLSearchParams({ symbol: ticker, apikey: apiKey() });
  if (fromISODate) params.set("from", fromISODate);
  if (toISODate) params.set("to", toISODate);

  const res = await fetch(`${BASE}/historical-chart/4hour?${params}`, {
    cache: "no-store",
  });
  if (!res.ok) {
    throw new Error(`FMP 4hour fetch failed for ${ticker}: ${res.status}`);
  }
  const data = (await res.json()) as FmpCandle[];
  if (!Array.isArray(data)) {
    return [];
  }
  return [...data].reverse();
}

export interface FmpFundamentals {
  revenue_cagr_5yr: number | null;
  eps_cagr_5yr: number | null;
  net_profit_margin_avg: number | null;
  roe_avg: number | null;
  roic_avg: number | null;
  debt_to_equity: number | null;
}

interface RatiosTtm {
  netProfitMarginTTM?: number;
  debtToEquityRatioTTM?: number;
}

interface KeyMetricsTtm {
  returnOnEquityTTM?: number;
  returnOnInvestedCapitalTTM?: number;
}

/**
 * Fetch a best-effort snapshot of fundamentals.
 *
 * Margins + debt/equity come from `ratios-ttm`; ROE/ROIC from
 * `key-metrics-ttm` (they aren't present on ratios-ttm). FMP returns
 * fractions (0.24 = 24%) for margins/returns, so we scale to the
 * percentage units the stocks table expects. 5-year CAGR fields need
 * multi-year statements and aren't derivable from a single TTM call, so
 * they're left null for the caller to preserve.
 */
export async function fetchFundamentals(
  ticker: string,
): Promise<FmpFundamentals> {
  const params = new URLSearchParams({
    symbol: ticker,
    limit: "1",
    apikey: apiKey(),
  });

  const [ratiosRes, metricsRes] = await Promise.all([
    fetch(`${BASE}/ratios-ttm?${params}`, { cache: "no-store" }),
    fetch(`${BASE}/key-metrics-ttm?${params}`, { cache: "no-store" }),
  ]);

  if (!ratiosRes.ok) {
    throw new Error(`FMP ratios fetch failed for ${ticker}: ${ratiosRes.status}`);
  }
  if (!metricsRes.ok) {
    throw new Error(
      `FMP key-metrics fetch failed for ${ticker}: ${metricsRes.status}`,
    );
  }

  const r = ((await ratiosRes.json()) as RatiosTtm[])?.[0] ?? {};
  const m = ((await metricsRes.json()) as KeyMetricsTtm[])?.[0] ?? {};

  const pct = (v: number | undefined) =>
    v == null ? null : Math.round(v * 1000) / 10;

  return {
    revenue_cagr_5yr: null,
    eps_cagr_5yr: null,
    net_profit_margin_avg: pct(r.netProfitMarginTTM),
    roe_avg: pct(m.returnOnEquityTTM),
    roic_avg: pct(m.returnOnInvestedCapitalTTM),
    debt_to_equity:
      r.debtToEquityRatioTTM == null
        ? null
        : Math.round(r.debtToEquityRatioTTM * 100) / 100,
  };
}
