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
  revenue_growth_consecutive_years: number | null;
  fcf_positive_years: number | null;
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

interface IncomeStatement {
  date: string;
  revenue?: number;
  eps?: number;
  epsDiluted?: number;
}

interface CashFlowStatement {
  date: string;
  freeCashFlow?: number;
}

// How many annual statements to pull. The current FMP plan caps `limit` at
// 5, so we get at most 5 annual points = 4 YoY comparisons. That means
// `revenue_growth_consecutive_years` tops out at 4 here; see the fetch route
// and the fundamental_pass screen for how that interacts with the gate.
const STATEMENT_YEARS = 5;

/**
 * Compound annual growth rate (as a percentage) between the oldest and
 * newest value in a newest-first series. Returns null when it can't be
 * computed meaningfully — too few points, or a non-positive base/end that
 * would make the growth rate nonsensical (common for EPS).
 */
function cagrPct(newestFirst: Array<number | undefined>): number | null {
  const vals = newestFirst.filter((v): v is number => v != null);
  if (vals.length < 2) return null;
  const latest = vals[0];
  const earliest = vals[vals.length - 1];
  const years = vals.length - 1;
  if (earliest <= 0 || latest <= 0) return null;
  const cagr = (Math.pow(latest / earliest, 1 / years) - 1) * 100;
  return Math.round(cagr * 10) / 10;
}

/**
 * Count how many of the most recent years, consecutively, satisfy `ok`
 * relative to the following year. Walks a newest-first series and stops at
 * the first year that breaks the streak.
 */
function consecutiveFromNewest<T>(
  newestFirst: T[],
  ok: (current: T, previous: T) => boolean,
): number {
  let count = 0;
  for (let i = 0; i < newestFirst.length - 1; i++) {
    if (ok(newestFirst[i], newestFirst[i + 1])) count++;
    else break;
  }
  return count;
}

/**
 * Fetch a full fundamentals snapshot covering all 8 screen criteria.
 *
 * TTM ratios/returns come from `ratios-ttm` + `key-metrics-ttm` (FMP returns
 * fractions like 0.24 = 24%, scaled here to percentage units). The multi-year
 * criteria — revenue/EPS 5yr CAGR, consecutive revenue-growth years, and
 * FCF-positive years — are derived from annual `income-statement` and
 * `cash-flow-statement` history. Any field FMP can't supply is left null so
 * the caller can preserve a manual value.
 */
export async function fetchFundamentals(
  ticker: string,
): Promise<FmpFundamentals> {
  const ttmParams = new URLSearchParams({
    symbol: ticker,
    limit: "1",
    apikey: apiKey(),
  });
  const stmtParams = new URLSearchParams({
    symbol: ticker,
    period: "annual",
    limit: String(STATEMENT_YEARS),
    apikey: apiKey(),
  });

  const [ratiosRes, metricsRes, incomeRes, cashRes] = await Promise.all([
    fetch(`${BASE}/ratios-ttm?${ttmParams}`, { cache: "no-store" }),
    fetch(`${BASE}/key-metrics-ttm?${ttmParams}`, { cache: "no-store" }),
    fetch(`${BASE}/income-statement?${stmtParams}`, { cache: "no-store" }),
    fetch(`${BASE}/cash-flow-statement?${stmtParams}`, { cache: "no-store" }),
  ]);

  for (const [label, res] of [
    ["ratios", ratiosRes],
    ["key-metrics", metricsRes],
    ["income-statement", incomeRes],
    ["cash-flow-statement", cashRes],
  ] as const) {
    if (!res.ok) {
      throw new Error(`FMP ${label} fetch failed for ${ticker}: ${res.status}`);
    }
  }

  const r = ((await ratiosRes.json()) as RatiosTtm[])?.[0] ?? {};
  const m = ((await metricsRes.json()) as KeyMetricsTtm[])?.[0] ?? {};
  const income = ((await incomeRes.json()) as IncomeStatement[]) ?? [];
  const cash = ((await cashRes.json()) as CashFlowStatement[]) ?? [];

  const pct = (v: number | undefined) =>
    v == null ? null : Math.round(v * 1000) / 10;

  // income/cash are newest-first from FMP.
  const revenueCagr = cagrPct(income.map((s) => s.revenue));
  const epsCagr = cagrPct(income.map((s) => s.epsDiluted ?? s.eps));
  const revenueGrowthYears =
    income.length >= 2
      ? consecutiveFromNewest(
          income,
          (cur, prev) =>
            cur.revenue != null &&
            prev.revenue != null &&
            cur.revenue > prev.revenue,
        )
      : null;
  const fcfPositiveYears =
    cash.length >= 1
      ? // count leading years (newest-first) with positive FCF
        (() => {
          let n = 0;
          for (const s of cash) {
            if (s.freeCashFlow != null && s.freeCashFlow > 0) n++;
            else break;
          }
          return n;
        })()
      : null;

  return {
    revenue_cagr_5yr: revenueCagr,
    eps_cagr_5yr: epsCagr,
    revenue_growth_consecutive_years: revenueGrowthYears,
    fcf_positive_years: fcfPositiveYears,
    net_profit_margin_avg: pct(r.netProfitMarginTTM),
    roe_avg: pct(m.returnOnEquityTTM),
    roic_avg: pct(m.returnOnInvestedCapitalTTM),
    debt_to_equity:
      r.debtToEquityRatioTTM == null
        ? null
        : Math.round(r.debtToEquityRatioTTM * 100) / 100,
  };
}
