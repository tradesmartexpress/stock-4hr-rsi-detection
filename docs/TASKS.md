# Tasks & Sprints

## Sprint 1 — DB + Stock Watchlist CRUD (demo-visible)
**Goal:** Stocks table live; watchlist renders without login; add/edit/delete works.

- [ ] Run migration SQL (all tables + seed data)
- [ ] `/stocks` page: list all stocks, fundamental pass/fail badge, score
- [ ] Add stock form: all 8 fundamental fields + moat + notes
- [ ] Edit stock inline or on detail page
- [ ] Delete stock with confirmation dialog
- [ ] Empty state: "Add your first stock to the watchlist"
- [ ] Loading + error states on all data fetches

**DoD:** Add a new ticker, fill fundamentals, see pass badge. Edit it. Delete it. Seed stocks visible on cold load.

---

## Sprint 2 — RSI Engine + Alert Events (core engine) ✅ v1 functional milestone
**Goal:** RSI crossover detection works end-to-end; alerts logged in DB.

- [ ] `/stocks/[ticker]` detail page with RSI reading history chart
- [ ] Manual RSI entry form: value + candle timestamp
- [ ] Server action: on RSI insert, run crossover rule (prev ≥ 20, new < 20)
- [ ] On crossover: insert `alert_events` row
- [ ] `/alerts` page: list alert events, ticker, RSI, triggered_at, status
- [ ] Acknowledge button → sets status + acknowledged_at, persists to DB
- [ ] Audit log write on every alert event created

**DoD:** Enter RSI 22 then 18.5 for a passing stock → Alert Event appears on /alerts → Acknowledge → status updates.

---

## Sprint 3 — Auto-Fetch + Delivery
**Goal:** Cron fetches RSI automatically; email + WhatsApp sent on trigger.

- [ ] Vercel cron route `/api/cron/fetch-rsi` (every 4 hrs): fetch candles, compute RSI-14, store readings
- [ ] Vercel cron route `/api/cron/fetch-fundamentals`: FMP API → update stocks fundamentals
- [ ] `send_email_alert` tool: Resend email on alert event
- [ ] `send_whatsapp_alert` tool: Twilio WhatsApp on alert event
- [ ] `alert_deliveries` row written per send attempt (sent/failed + error)
- [ ] Delivery status visible on `/alerts` detail
- [ ] All API keys in env vars only; no client exposure

**DoD:** Cron runs, RSI crosses 20, email arrives in inbox, WhatsApp received, delivery row shows `sent`.

---

## Sprint 4 — Lock It Down (auth + RLS)
**Goal:** Per-user data isolation; no cross-user data leakage.

- [ ] Supabase Auth: email/password sign-up and login pages
- [ ] Attach `user_id` on all inserts post-login
- [ ] Replace v1 permissive RLS with `auth.uid() = user_id` policies on all tables
- [ ] Alert notification preferences page (email + WhatsApp number per user)
- [ ] Redirect unauthenticated users to login (demo mode retired)

**DoD:** Two test users each see only their own stocks and alerts.

---

## Sprint 5 — Intelligence Layer
**Goal:** AI moat rating + ranked watchlist dashboard.

- [ ] "Rate Moat with AI" button: calls `generate_moat_rating` tool, stores draft
- [ ] Review UI: approve or override AI moat rating (updates review_status)
- [ ] Ranked watchlist: sorted by composite fundamental score
- [ ] Audit log viewer page

**DoD:** AI suggests moat, human approves, score updates, watchlist reorders.

---

## Gantt (sprint → feature)
```
Sprint 1  |████| DB + Stock CRUD
Sprint 2  |████| RSI engine + Alert events   ← v1 functional
Sprint 3  |████| Cron fetch + Email/WhatsApp
Sprint 4  |████| Auth + RLS lock-down
Sprint 5  |████| AI moat + ranked dashboard
```
