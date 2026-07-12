-- Sprint 4 — Lock it down: per-user RLS + notification preferences.
-- Replaces the permissive v1 policies (read+write open) with owner-scoped
-- policies keyed on auth.uid() = user_id. The cron/agent context uses the
-- service-role key, which bypasses RLS, so scheduled writes are unaffected.

-- ── notification_preferences ────────────────────────────────────────────────
create table if not exists notification_preferences (
  user_id uuid primary key references auth.users(id) on delete cascade,
  alert_email text,
  whatsapp_number text,
  updated_at timestamptz not null default now()
);

alter table notification_preferences enable row level security;
drop policy if exists "prefs_owner_all" on notification_preferences;
create policy "prefs_owner_all" on notification_preferences
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Helper to swap v1 permissive policies for owner-scoped ones.
-- (Written out per-table for clarity / auditability.)

-- ── stocks ──────────────────────────────────────────────────────────────────
drop policy if exists "stocks_v1_read" on stocks;
drop policy if exists "stocks_v1_write" on stocks;
create policy "stocks_owner_select" on stocks
  for select using (auth.uid() = user_id);
create policy "stocks_owner_insert" on stocks
  for insert with check (auth.uid() = user_id);
create policy "stocks_owner_update" on stocks
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "stocks_owner_delete" on stocks
  for delete using (auth.uid() = user_id);

-- ── rsi_readings ────────────────────────────────────────────────────────────
drop policy if exists "rsi_readings_v1_read" on rsi_readings;
drop policy if exists "rsi_readings_v1_write" on rsi_readings;
create policy "rsi_readings_owner_select" on rsi_readings
  for select using (auth.uid() = user_id);
create policy "rsi_readings_owner_insert" on rsi_readings
  for insert with check (auth.uid() = user_id);
create policy "rsi_readings_owner_update" on rsi_readings
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "rsi_readings_owner_delete" on rsi_readings
  for delete using (auth.uid() = user_id);

-- ── alert_events ────────────────────────────────────────────────────────────
drop policy if exists "alert_events_v1_read" on alert_events;
drop policy if exists "alert_events_v1_write" on alert_events;
create policy "alert_events_owner_select" on alert_events
  for select using (auth.uid() = user_id);
create policy "alert_events_owner_insert" on alert_events
  for insert with check (auth.uid() = user_id);
create policy "alert_events_owner_update" on alert_events
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "alert_events_owner_delete" on alert_events
  for delete using (auth.uid() = user_id);

-- ── alert_deliveries ────────────────────────────────────────────────────────
drop policy if exists "alert_deliveries_v1_read" on alert_deliveries;
drop policy if exists "alert_deliveries_v1_write" on alert_deliveries;
create policy "alert_deliveries_owner_select" on alert_deliveries
  for select using (auth.uid() = user_id);
create policy "alert_deliveries_owner_insert" on alert_deliveries
  for insert with check (auth.uid() = user_id);

-- ── audit_logs ──────────────────────────────────────────────────────────────
drop policy if exists "audit_logs_v1_read" on audit_logs;
drop policy if exists "audit_logs_v1_write" on audit_logs;
create policy "audit_logs_owner_select" on audit_logs
  for select using (auth.uid() = user_id);
create policy "audit_logs_owner_insert" on audit_logs
  for insert with check (auth.uid() = user_id);
