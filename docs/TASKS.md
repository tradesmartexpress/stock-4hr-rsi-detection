# Tasks & Sprints

## Sprint 1 — Database, seed data & fundamental screener
**Goal:** App renders with real data, no login required. Fundamental scoring works end-to-end.

- [ ] Apply migration SQL to Supabase (all 5 tables + seed rows)
- [ ] `/stocks` page: table of stocks with pass/fail badges per criterion
- [ ] Stock detail page: all 8 fundamental fields shown with pass/fail icons
- [ ] "Add Stock" form → saves to `stocks` + `fundamental_snapshots`, triggers scoring engine
- [ ] `score_fundamentals(stock_id)` server action: evaluates all 8 rules, writes booleans
- [ ] Edit / delete stock (with confirmation)
- [ ] Empty state UI; loading skeleton; error toast
- [ ] Demo seed data visible without login

**Definition of Done:** Visit `/stocks` — see 5 seeded stocks with correct pass/fail. Add a new stock — it scores and appears in the list. Delete a stock — it's gone from DB.

---

## Sprint 2 — RSI ingestion & alert detection (core engine) ✅ v1 functional milestone
**Goal:** The full alert pipeline works: ingest → detect → event created → visible on /alerts.

- [ ] `POST /api/rsi-ingest` endpoint: validates `INGEST_API_KEY` header, stores RSI reading
- [ ] `detect_rsi_cross(stock_id, new_rsi)`: compare to previous reading, create `alert_event` if crossed below threshold AND `fundamental_pass = true`
- [ ] `/alerts` page: list of alert events, stock name, RSI value, triggered time, delivery status
- [ ] Alert detail modal: full fundamental summary + RSI value context
- [ ] Seed RSI readings + alert events for MSFT and AAPL demo rows
- [ ] Test: POST RSI 18 for MSFT → alert_event row created → appears on /alerts

**Definition of Done:** End-to-end success scenario works. NKE (failing fundamentals) does NOT generate an alert even if RSI < 20.

---

## Sprint 3 — Notification delivery
**Goal:** Email and WhatsApp sent within 60s of alert event creation.

- [ ] `send_email_alert(alert_event_id)` — SendGrid integration, log to `alert_deliveries`
- [ ] `send_whatsapp_alert(alert_event_id)` — Twilio integration, log to `alert_deliveries`
- [ ] Delivery called automatically after `alert_event` insert (server-side)
- [ ] `/alerts` shows per-channel delivery status badges
- [ ] Retry once on failure; log `error_message`
- [ ] All keys in env vars only; zero secrets in client bundle

**Definition of Done:** Trigger RSI cross via POST → email and WhatsApp received → alert_deliveries rows show status 'sent'.

---

## Sprint 4 — Watchlist management & configurability
**Goal:** Full CRUD; configurable thresholds; snapshot history.

- [ ] RSI alert threshold editable per stock (default 20)
- [ ] Fundamental snapshot history list on stock detail page
- [ ] Re-score button: recomputes `overall_pass` from latest snapshot
- [ ] Notification recipient settings page (email address, WhatsApp number)
- [ ] All buttons persist to DB; no dead UI

**Definition of Done:** Change MSFT threshold to 25 → next ingest at 24 fires alert. History shows two snapshots.

---

## Sprint 5 — Lock it down (auth + RLS)
**Goal:** Per-user data isolation. Safe for real use.

- [ ] Supabase Auth: email/password login + signup page
- [ ] `user_id` stamped on all inserts
- [ ] Replace v1 RLS policies with `auth.uid() = user_id` owner-scoped policies
- [ ] API routes verify authenticated user before mutating
- [ ] Demo seed rows assigned to a demo user account
- [ ] Redirect unauthenticated users to /login

**Definition of Done:** Two users each see only their own stocks and alerts.

---

## Sprint 6 — Intelligence & polish
**Goal:** AI moat suggestion with human review; dashboard summary.

- [ ] `suggest_moat(stock_id, description)` — LLM call, writes `moat_ai_*` fields
- [ ] Moat review UI: approve or override AI suggestion
- [ ] RSI sparkline (last 20 readings) on stock detail
- [ ] Dashboard: passing stocks count, alerts fired this week, delivery success rate

**Definition of Done:** AI suggests moat for a stock → user approves → `moat_rating` updated → stock rescores.

---

## Gantt
```
Sprint 1  [DB + screener]          Week 1
Sprint 2  [RSI engine] ← v1 done  Week 2
Sprint 3  [Notifications]          Week 3
Sprint 4  [CRUD + config]          Week 4
Sprint 5  [Auth + RLS]             Week 5
Sprint 6  [AI + polish]            Week 6
```
