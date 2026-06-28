create table if not exists stocks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  created_at timestamptz not null default now(),
  ticker text not null,
  company_name text not null,
  sector text,
  moat_rating text,
  moat_ai_value text,
  moat_ai_source text,
  moat_ai_confidence numeric,
  moat_ai_review_status text default 'unreviewed',
  rsi_alert_threshold numeric not null default 20,
  fundamental_pass boolean,
  notes text
);

alter table stocks enable row level security;
drop policy if exists "stocks_v1_read" on stocks;
create policy "stocks_v1_read" on stocks for select using (true);
drop policy if exists "stocks_v1_write" on stocks;
create policy "stocks_v1_write" on stocks for all using (true) with check (true);

create table if not exists fundamental_snapshots (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  created_at timestamptz not null default now(),
  stock_id uuid not null references stocks(id) on delete cascade,
  snapshot_date date not null,
  revenue_cagr_5yr numeric,
  revenue_growth_continuous boolean,
  eps_cagr_5yr numeric,
  fcf_positive_5yr boolean,
  net_profit_margin_avg numeric,
  roe_avg numeric,
  roic_avg numeric,
  debt_to_equity numeric,
  revenue_cagr_pass boolean,
  eps_cagr_pass boolean,
  fcf_pass boolean,
  npm_pass boolean,
  roe_pass boolean,
  roic_pass boolean,
  de_pass boolean,
  moat_pass boolean,
  overall_pass boolean,
  data_source text
);

alter table fundamental_snapshots enable row level security;
drop policy if exists "fundamental_snapshots_v1_read" on fundamental_snapshots;
create policy "fundamental_snapshots_v1_read" on fundamental_snapshots for select using (true);
drop policy if exists "fundamental_snapshots_v1_write" on fundamental_snapshots;
create policy "fundamental_snapshots_v1_write" on fundamental_snapshots for all using (true) with check (true);

create table if not exists rsi_readings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  created_at timestamptz not null default now(),
  stock_id uuid not null references stocks(id) on delete cascade,
  reading_time timestamptz not null,
  rsi_value numeric not null,
  timeframe text not null default '4h',
  source text
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
  rsi_reading_id uuid references rsi_readings(id),
  triggered_at timestamptz not null default now(),
  rsi_value_at_trigger numeric not null,
  rsi_threshold numeric not null default 20,
  alert_type text not null default 'rsi_cross_below',
  delivery_status text not null default 'pending'
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
  sent_at timestamptz,
  error_message text,
  provider_message_id text
);

alter table alert_deliveries enable row level security;
drop policy if exists "alert_deliveries_v1_read" on alert_deliveries;
create policy "alert_deliveries_v1_read" on alert_deliveries for select using (true);
drop policy if exists "alert_deliveries_v1_write" on alert_deliveries;
create policy "alert_deliveries_v1_write" on alert_deliveries for all using (true) with check (true);

insert into stocks (id, ticker, company_name, sector, moat_rating, rsi_alert_threshold, fundamental_pass) values
  ('a1000000-0000-0000-0000-000000000001', 'MSFT', 'Microsoft Corporation', 'Technology', 'wide', 20, true),
  ('a1000000-0000-0000-0000-000000000002', 'AAPL', 'Apple Inc.', 'Technology', 'wide', 20, true),
  ('a1000000-0000-0000-0000-000000000003', 'V', 'Visa Inc.', 'Financials', 'wide', 20, true),
  ('a1000000-0000-0000-0000-000000000004', 'NKE', 'Nike Inc.', 'Consumer Discretionary', 'narrow', 20, false),
  ('a1000000-0000-0000-0000-000000000005', 'SBUX', 'Starbucks Corporation', 'Consumer Discretionary', 'narrow', 20, false);

insert into fundamental_snapshots (stock_id, snapshot_date, revenue_cagr_5yr, revenue_growth_continuous, eps_cagr_5yr, fcf_positive_5yr, net_profit_margin_avg, roe_avg, roic_avg, debt_to_equity, revenue_cagr_pass, eps_cagr_pass, fcf_pass, npm_pass, roe_pass, roic_pass, de_pass, moat_pass, overall_pass, data_source) values
  ('a1000000-0000-0000-0000-000000000001', '2024-12-31', 14.2, true, 18.5, true, 34.1, 38.2, 28.7, 0.31, true, true, true, true, true, true, true, true, true, 'manual'),
  ('a1000000-0000-0000-0000-000000000002', '2024-12-31', 9.1, true, 13.4, true, 24.3, 147.5, 32.1, 0.19, true, true, true, true, true, true, true, true, true, 'manual'),
  ('a1000000-0000-0000-0000-000000000003', '2024-12-31', 11.7, true, 16.8, true, 51.2, 44.6, 31.9, 0.07, true, true, true, true, true, true, true, true, true, 'manual'),
  ('a1000000-0000-0000-0000-000000000004', '2024-12-31', 5.3, false, 7.2, true, 10.8, 22.1, 9.4, 0.84, false, false, true, true, true, false, false, false, false, 'manual'),
  ('a1000000-0000-0000-0000-000000000005', '2024-12-31', 6.1, true, 8.9, false, 12.3, 31.4, 8.7, 1.42, false, false, false, true, true, false, false, false, false, 'manual');

insert into rsi_readings (stock_id, reading_time, rsi_value, timeframe, source) values
  ('a1000000-0000-0000-0000-000000000001', now() - interval '8 hours', 35.2, '4h', 'demo'),
  ('a1000000-0000-0000-0000-000000000001', now() - interval '4 hours', 22.1, '4h', 'demo'),
  ('a1000000-0000-0000-0000-000000000001', now(), 17.8, '4h', 'demo'),
  ('a1000000-0000-0000-0000-000000000002', now() - interval '8 hours', 42.5, '4h', 'demo'),
  ('a1000000-0000-0000-0000-000000000002', now() - interval '4 hours', 21.3, '4h', 'demo'),
  ('a1000000-0000-0000-0000-000000000002', now(), 19.1, '4h', 'demo'),
  ('a1000000-0000-0000-0000-000000000003', now() - interval '4 hours', 38.7, '4h', 'demo'),
  ('a1000000-0000-0000-0000-000000000003', now(), 33.2, '4h', 'demo');

insert into alert_events (stock_id, triggered_at, rsi_value_at_trigger, rsi_threshold, alert_type, delivery_status) values
  ('a1000000-0000-0000-0000-000000000001', now() - interval '3 hours', 17.8, 20, 'rsi_cross_below', 'sent'),
  ('a1000000-0000-0000-0000-000000000002', now() - interval '1 hour', 19.1, 20, 'rsi_cross_below', 'sent');

insert into alert_deliveries (alert_event_id, channel, recipient, status, sent_at) values
  ((select id from alert_events limit 1), 'email', 'user@example.com', 'sent', now() - interval '3 hours'),
  ((select id from alert_events limit 1), 'whatsapp', '+60123456789', 'sent', now() - interval '3 hours'),
  ((select id from alert_events offset 1 limit 1), 'email', 'user@example.com', 'sent', now() - interval '1 hour'),
  ((select id from alert_events offset 1 limit 1), 'whatsapp', '+60123456789', 'sent', now() - interval '1 hour');