-- Relax the fundamental_pass gate's revenue-growth criterion from
-- ">= 5 consecutive years" to ">= 4".
--
-- Why: the current FMP plan caps annual statement history at 5 years, which
-- yields only 4 year-over-year comparisons. The original ">= 5" rule was
-- therefore unsatisfiable by the auto-fetch (revenue_growth_consecutive_years
-- tops out at 4), so no stock could ever pass without hand-entered data. All
-- seven other criteria are unchanged.
--
-- A generated column's expression can't be altered in place, so we drop and
-- re-add it. fundamental_pass is derived (holds no source data), so this is
-- non-destructive.

alter table stocks drop column if exists fundamental_pass;

alter table stocks
  add column fundamental_pass boolean generated always as (
    revenue_cagr_5yr > 8
    and revenue_growth_consecutive_years >= 4
    and eps_cagr_5yr > 10
    and fcf_positive_years >= 5
    and net_profit_margin_avg > 5
    and roe_avg > 15
    and roic_avg > 10
    and debt_to_equity < 0.5
  ) stored;
