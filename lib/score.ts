import type { Stock } from "./types";

// Composite fundamental score per INTELLIGENCE_LAYER.md.
// 8 rule criteria (1 point each) + moat bonus (wide=2, narrow=1, none/null=0).
// Max = 10. Pass threshold = 8 (matches the DB's generated fundamental_pass,
// which requires all 8 rule criteria; moat is the tie-breaker for ranking).
// The consecutive-revenue-growth criterion is >= 4 (see migration 0003 — the
// FMP plan's 5-year history cap makes 5 unreachable via auto-fetch).
export function compositeScore(stock: Stock): number {
  let score = 0;
  if ((stock.revenue_cagr_5yr ?? 0) > 8) score += 1;
  if ((stock.revenue_growth_consecutive_years ?? 0) >= 4) score += 1;
  if ((stock.eps_cagr_5yr ?? 0) > 10) score += 1;
  if ((stock.fcf_positive_years ?? 0) >= 5) score += 1;
  if ((stock.net_profit_margin_avg ?? 0) > 5) score += 1;
  if ((stock.roe_avg ?? 0) > 15) score += 1;
  if ((stock.roic_avg ?? 0) > 10) score += 1;
  if ((stock.debt_to_equity ?? Infinity) < 0.5) score += 1;

  if (stock.moat_rating === "wide") score += 2;
  else if (stock.moat_rating === "narrow") score += 1;

  return score;
}

export const MAX_SCORE = 10;
