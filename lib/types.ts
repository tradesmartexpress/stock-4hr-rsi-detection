export type MoatRating = "wide" | "narrow" | "none";

export interface Stock {
  id: string;
  user_id: string | null;
  created_at: string;
  ticker: string;
  company_name: string;
  sector: string | null;
  revenue_cagr_5yr: number | null;
  revenue_growth_consecutive_years: number | null;
  eps_cagr_5yr: number | null;
  fcf_positive_years: number | null;
  net_profit_margin_avg: number | null;
  roe_avg: number | null;
  roic_avg: number | null;
  debt_to_equity: number | null;
  moat_rating: MoatRating | null;
  moat_rating_source: string | null;
  moat_rating_confidence: number | null;
  moat_rating_review_status: string | null;
  fundamental_pass: boolean | null;
  notes: string | null;
}

export interface RsiReading {
  id: string;
  created_at: string;
  stock_id: string;
  ticker: string;
  rsi_value: number;
  candle_timestamp: string;
  source: string;
  timeframe: string;
}

export interface AlertEvent {
  id: string;
  created_at: string;
  stock_id: string;
  ticker: string;
  rsi_value: number;
  triggered_at: string;
  alert_type: string;
  status: "pending" | "acknowledged";
  acknowledged_at: string | null;
  notes: string | null;
}
