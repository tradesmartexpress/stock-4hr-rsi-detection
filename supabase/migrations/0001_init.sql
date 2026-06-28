create table if not exists stocks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  ticker text not null,
  company_name text not null,
  sector text,
  moat_rating text default 'none',
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

alter table stocks enable row level security;
drop policy if exists "stocks_v1_read" on stocks;
create policy "stocks_v1_read" on stocks for select using (true);
drop policy if exists "stocks_v1_write" on stocks;
create policy "stocks_v1_write" on stocks for all using (true) with check (true);

create table if not exists fundamental_snapshots (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  stock_id uuid not null references stocks(id) on delete cascade,
  as_of_date date not null,
  revenue_cagr_5y numeric,
  revenue_growth_continuous boolean,
  eps_cagr_5y numeric,
  fcf_positive_5y boolean,
  net_profit_margin_avg numeric,
  roe_avg numeric,
  roic_avg numeric,
  debt_to_equity numeric,
  passes_screen boolean,
  passes_screen_source text,
  passes_screen_confidence numeric,
  passes_screen_review_status text default 'unreviewed',
  data_source text,
  notes text,
  created_at timestamptz not null default now()
);

alter table fundamental_snapshots enable row level security;
drop policy if exists "fundamental_snapshots_v1_read" on fundamental_snapshots;
create policy "fundamental_snapshots_v1_read" on fundamental_snapshots for select using (true);
drop policy if exists "fundamental_snapshots_v1_write" on fundamental_snapshots;
create policy "fundamental_snapshots_v1_write" on fundamental_snapshots for all using (true) with check (true);

create table if not exists rsi_readings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  stock_id uuid not null references stocks(id) on delete cascade,
  timeframe text not null default '4h',
  rsi_value numeric not null,
  reading_at timestamptz not null default now(),
  source text default 'manual',
  created_at timestamptz not null default now()
);

alter table rsi_readings enable row level security;
drop policy if exists "rsi_readings_v1_read" on rsi_readings;
create policy "rsi_readings_v1_read" on rsi_readings for select using (true);
drop policy if exists "rsi_readings_v1_write" on rsi_readings;
create policy "rsi_readings_v1_write" on rsi_readings for all using (true) with check (true);

create table if not exists alert_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  stock_id uuid not null references stocks(id) on delete cascade,
  rsi_reading_id uuid references rsi_readings(id),
  trigger_type text not null default 'rsi_cross_below_20',
  rsi_value numeric not null,
  fundamental_passed boolean not null,
  email_status text default 'pending',
  whatsapp_status text default 'pending',
  delivered_at timestamptz,
  created_at timestamptz not null default now()
);

alter table alert_events enable row level security;
drop policy if exists "alert_events_v1_read" on alert_events;
create policy "alert_events_v1_read" on alert_events for select using (true);
drop policy if exists "alert_events_v1_write" on alert_events;
create policy "alert_events_v1_write" on alert_events for all using (true) with check (true);

create table if not exists notification_settings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  email_enabled boolean not null default true,
  email_address text,
  whatsapp_enabled boolean not null default false,
  whatsapp_number text,
  created_at timestamptz not null default now()
);

alter table notification_settings enable row level security;
drop policy if exists "notification_settings_v1_read" on notification_settings;
create policy "notification_settings_v1_read" on notification_settings for select using (true);
drop policy if exists "notification_settings_v1_write" on notification_settings;
create policy "notification_settings_v1_write" on notification_settings for all using (true) with check (true);

insert into stocks (id, ticker, company_name, sector, moat_rating) values
  ('a1000000-0000-0000-0000-000000000001', 'MSFT', 'Microsoft Corporation', 'Technology', 'wide'),
  ('a1000000-0000-0000-0000-000000000002', 'ASML', 'ASML Holding NV', 'Semiconductors', 'wide'),
  ('a1000000-0000-0000-0000-000000000003', 'V', 'Visa Inc', 'Financials', 'wide'),
  ('a1000000-0000-0000-0000-000000000004', 'NKE', 'Nike Inc', 'Consumer', 'narrow'),
  ('a1000000-0000-0000-0000-000000000005', 'XOM', 'Exxon Mobil', 'Energy', 'narrow')
on conflict (id) do nothing;

insert into fundamental_snapshots (stock_id, as_of_date, revenue_cagr_5y, revenue_growth_continuous, eps_cagr_5y, fcf_positive_5y, net_profit_margin_avg, roe_avg, roic_avg, debt_to_equity, passes_screen, passes_screen_source, passes_screen_confidence, passes_screen_review_status, data_source) values
  ('a1000000-0000-0000-0000-000000000001', '2024-12-31', 14.2, true, 18.5, true, 36.1, 38.4, 22.7, 0.35, true, 'manual', 0.95, 'confirmed', 'manual'),
  ('a1000000-0000-0000-0000-000000000002', '2024-12-31', 22.1, true, 28.3, true, 27.4, 45.2, 31.0, 0.20, true, 'manual', 0.95, 'confirmed', 'manual'),
  ('a1000000-0000-0000-0000-000000000003', '2024-12-31', 11.8, true, 15.2, true, 51.3, 42.1, 28.5, 0.15, true, 'manual', 0.95, 'confirmed', 'manual'),
  ('a1000000-0000-0000-0000-000000000004', '2024-12-31', 6.1, false, 8.2, true, 10.4, 34.2, 18.1, 0.88, false, 'manual', 0.90, 'confirmed', 'manual'),
  ('a1000000-0000-0000-0000-000000000005', '2024-12-31', 9.3, true, 7.1, true, 8.9, 18.3, 9.2, 0.22, false, 'manual', 0.85, 'confirmed', 'manual')
on conflict do nothing;

insert into rsi_readings (stock_id, timeframe, rsi_value, reading_at, source) values
  ('a1000000-0000-0000-0000-000000000001', '4h', 18.4, now() - interval '2 hours', 'manual'),
  ('a1000000-0000-0000-0000-000000000002', '4h', 22.1, now() - interval '6 hours', 'manual'),
  ('a1000000-0000-0000-0000-000000000003', '4h', 35.7, now() - interval '4 hours', 'manual')
on conflict do nothing;

insert into alert_events (stock_id, trigger_type, rsi_value, fundamental_passed, email_status, whatsapp_status) values
  ('a1000000-0000-0000-0000-000000000001', 'rsi_cross_below_20', 18.4, true, 'sent', 'sent'),
  ('a1000000-0000-0000-0000-000000000002', 'rsi_cross_below_20', 17.9, true, 'sent', 'pending')
on conflict do nothing;

insert into notification_settings (email_enabled, email_address, whatsapp_enabled, whatsapp_number) values
  (true, 'trader@example.com', true, '+60123456789')
on conflict do nothing;