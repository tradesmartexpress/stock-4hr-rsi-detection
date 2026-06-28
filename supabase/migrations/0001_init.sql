create table if not exists stocks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  created_at timestamptz not null default now(),
  ticker text not null,
  company_name text not null,
  sector text,
  revenue_cagr_5yr numeric,
  revenue_growth_consecutive_years integer,
  eps_cagr_5yr numeric,
  fcf_positive_years integer,
  net_profit_margin_avg numeric,
  roe_avg numeric,
  roic_avg numeric,
  debt_to_equity numeric,
  moat_rating text,
  moat_rating_source text,
  moat_rating_confidence numeric,
  moat_rating_review_status text default 'unreviewed',
  fundamental_pass boolean generated always as (
    revenue_cagr_5yr > 8
    and revenue_growth_consecutive_years >= 5
    and eps_cagr_5yr > 10
    and fcf_positive_years >= 5
    and net_profit_margin_avg > 5
    and roe_avg > 15
    and roic_avg > 10
    and debt_to_equity < 0.5
  ) stored,
  notes text
);

alter table stocks enable row level security;
drop policy if exists "stocks_v1_read" on stocks;
create policy "stocks_v1_read" on stocks for select using (true);
drop policy if exists "stocks_v1_write" on stocks;
create policy "stocks_v1_write" on stocks for all using (true) with check (true);

create table if not exists rsi_readings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  created_at timestamptz not null default now(),
  stock_id uuid not null references stocks(id) on delete cascade,
  ticker text not null,
  rsi_value numeric not null,
  candle_timestamp timestamptz not null,
  source text not null default 'manual',
  timeframe text not null default '4h'
);

alter table rsi_readings enable row level security;
drop policy if exists "rsi_readings_v1_read" on rsi_readings;
create policy "rsi_readings_v1_read" on rsi_readings for select using (true);
drop policy if exists "rsi_readings_v1_write" on rsi_readings;
create policy "rsi_readings_v1_write" on rsi_readings for all using (true) with check (true);

create table if not exists alert_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  created_at timestamptz not null default now(),
  stock_id uuid not null references stocks(id) on delete cascade,
  ticker text not null,
  rsi_value numeric not null,
  triggered_at timestamptz not null default now(),
  alert_type text not null default 'rsi_cross_below_20',
  status text not null default 'pending',
  acknowledged_at timestamptz,
  notes text
);

alter table alert_events enable row level security;
drop policy if exists "alert_events_v1_read" on alert_events;
create policy "alert_events_v1_read" on alert_events for select using (true);
drop policy if exists "alert_events_v1_write" on alert_events;
create policy "alert_events_v1_write" on alert_events for all using (true) with check (true);

create table if not exists alert_deliveries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  created_at timestamptz not null default now(),
  alert_event_id uuid not null references alert_events(id) on delete cascade,
  channel text not null,
  recipient text not null,
  status text not null default 'pending',
  delivered_at timestamptz,
  error_message text
);

alter table alert_deliveries enable row level security;
drop policy if exists "alert_deliveries_v1_read" on alert_deliveries;
create policy "alert_deliveries_v1_read" on alert_deliveries for select using (true);
drop policy if exists "alert_deliveries_v1_write" on alert_deliveries;
create policy "alert_deliveries_v1_write" on alert_deliveries for all using (true) with check (true);

create table if not exists audit_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  created_at timestamptz not null default now(),
  action text not null,
  entity_type text not null,
  entity_id uuid,
  payload jsonb,
  actor text default 'system'
);

alter table audit_logs enable row level security;
drop policy if exists "audit_logs_v1_read" on audit_logs;
create policy "audit_logs_v1_read" on audit_logs for select using (true);
drop policy if exists "audit_logs_v1_write" on audit_logs;
create policy "audit_logs_v1_write" on audit_logs for all using (true) with check (true);

insert into stocks (ticker, company_name, sector, revenue_cagr_5yr, revenue_growth_consecutive_years, eps_cagr_5yr, fcf_positive_years, net_profit_margin_avg, roe_avg, roic_avg, debt_to_equity, moat_rating, moat_rating_source, moat_rating_confidence, moat_rating_review_status, notes) values
('MSFT', 'Microsoft Corporation', 'Technology', 14.2, 5, 18.5, 5, 36.2, 42.1, 28.3, 0.35, 'wide', 'manual', 0.95, 'reviewed', 'Cloud + OS duopoly'),
('ASML', 'ASML Holding NV', 'Semiconductors', 17.8, 5, 22.1, 5, 27.4, 55.3, 38.9, 0.21, 'wide', 'manual', 0.98, 'reviewed', 'Only EUV lithography supplier globally'),
('GOOGL', 'Alphabet Inc', 'Technology', 11.3, 5, 15.6, 5, 21.8, 28.7, 22.4, 0.08, 'wide', 'manual', 0.90, 'reviewed', 'Search monopoly + cloud growth'),
('V', 'Visa Inc', 'Financials', 9.7, 5, 13.4, 5, 51.3, 44.2, 31.7, 0.44, 'wide', 'manual', 0.93, 'reviewed', 'Payment network effects');

insert into rsi_readings (stock_id, ticker, rsi_value, candle_timestamp, source) values
((select id from stocks where ticker = 'MSFT'), 'MSFT', 22.4, now() - interval '8 hours', 'manual'),
((select id from stocks where ticker = 'MSFT'), 'MSFT', 18.7, now() - interval '4 hours', 'manual'),
((select id from stocks where ticker = 'ASML'), 'ASML', 31.2, now() - interval '4 hours', 'manual'),
((select id from stocks where ticker = 'GOOGL'), 'GOOGL', 19.1, now() - interval '4 hours', 'manual');

insert into alert_events (stock_id, ticker, rsi_value, triggered_at, alert_type, status) values
((select id from stocks where ticker = 'MSFT'), 'MSFT', 18.7, now() - interval '4 hours', 'rsi_cross_below_20', 'acknowledged'),
((select id from stocks where ticker = 'GOOGL'), 'GOOGL', 19.1, now() - interval '4 hours', 'rsi_cross_below_20', 'pending');