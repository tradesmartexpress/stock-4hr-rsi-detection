# Tasks

## Sprint 1 — DB, seed data & fundamental screener UI
**Goal**: App is viewable without login; stocks and fundamentals are readable and editable.

- [ ] Apply migration SQL to Supabase (stocks, fundamental_snapshots, rsi_readings, alert_events, notification_settings)
- [ ] Seed 5 realistic demo stocks with full fundamental snapshots
- [ ] `/stocks` page: table of stocks with moat badge + overall pass/fail chip
- [ ] `/stocks/[id]` detail page: all 9 fundamental criteria displayed with pass/fail icons
- [ ] Add stock form (ticker, name, sector, moat rating)
- [ ] Edit / delete stock (confirmation modal for delete)
- [ ] Loading skeletons on all data-fetching pages
- [ ] Empty state when watchlist is empty
- [ ] Error boundary for failed DB calls

**DoD**: Opening `/stocks` shows 5 demo stocks; clicking one shows all fundamental fields; adding a new stock persists and appears in the list.

---

## Sprint 2 — Core alert engine ✅ v1 functional milestone
**Goal**: Entering an RSI value triggers the rule engine and creates a visible alert.

- [ ] RSI entry form on stock detail page (rsi_value input, submit button)
- [ ] Server action: write `rsi_readings` row
- [ ] Rule engine server action: `evaluate_fundamental_screen` + RSI < 20 check → insert `alert_events` row
- [ ] `/alerts` page: list all alert events (stock ticker, RSI value, timestamp, fundamental pass badge)
- [ ] Stock detail shows latest RSI reading and whether an alert was fired
- [ ] Edit fundamental snapshot inline (all 9 fields)
- [ ] Toast notification on alert creation ("Alert fired for MSFT — RSI 18.4")
- [ ] Handle: RSI submitted for non-passing stock → no alert, show informational message

**DoD**: Enter RSI = 18 for MSFT (passes screen) → alert row appears in `/alerts`. Enter RSI = 18 for XOM (fails screen) → no alert row, message shown.

---

## Sprint 3 — Notification delivery
**Goal**: Alert events send real email and WhatsApp messages.

- [ ] `/settings` page: email toggle + address field, WhatsApp toggle + number field, save to `notification_settings`
- [ ] Supabase Edge Function `notify-alert`: triggered by `alert_events` insert via webhook
- [ ] SendGrid integration: format and send email; write `email_status` back
- [ ] Twilio integration: send WhatsApp message; write `whatsapp_status` back
- [ ] Failed delivery shows 'failed' badge in alert log
- [ ] All secrets in Vercel env vars only

**DoD**: Alert fires → email arrives in inbox + WhatsApp message received within 60 seconds.

---

## Sprint 4 — Auto RSI polling & fundamental data fetch
**Goal**: App monitors stocks automatically without manual RSI entry.

- [ ] Integrate Twelve Data (or Polygon) API for 4-hr OHLCV
- [ ] Edge Function `poll-rsi` (cron every 4 hrs): fetch OHLCV, compute RSI-14, write `rsi_readings`
- [ ] Auto-evaluate rule engine after each RSI write
- [ ] Integrate FMP API: on stock creation, auto-fetch and populate `fundamental_snapshot`
- [ ] Manual entry still available as override
- [ ] Dashboard widget: "Last polled X minutes ago" per stock

**DoD**: New stock added → fundamentals auto-populated; 4-hr cron fires → RSI updated → alert fires if conditions met.

---

## Sprint 5 — Lock it down
**Goal**: Per-user data isolation; app safe for real portfolio data.

- [ ] Enable Supabase Auth (email + magic link)
- [ ] Login / signup pages (`/login`)
- [ ] Replace permissive RLS policies with `auth.uid() = user_id` owner-scoped policies
- [ ] Migrate demo rows to a seed user account
- [ ] Confirm no cross-user data leaks in QA
- [ ] Redirect unauthenticated users to `/login` (except public landing page)

**DoD**: Two test accounts cannot see each other's watchlists or alerts.

---

## Gantt
```
Week 1  |  Sprint 1 — DB + screener UI
Week 2  |  Sprint 2 — Rule engine + alert log      ← v1 functional
Week 3  |  Sprint 3 — Email + WhatsApp delivery
Week 4  |  Sprint 4 — Auto polling + data fetch
Week 5  |  Sprint 5 — Auth + lock down
```
