# Architecture

## Stack
- **Frontend**: Next.js 14 (App Router) on Vercel
- **Database**: Supabase (Postgres + RLS)
- **Notifications** (Sprint 3): SendGrid (email), Twilio (WhatsApp)
- **Scheduled jobs** (Sprint 4): Supabase Edge Functions (cron)

## Now vs Later
| Now | Later |
|---|---|
| Manual RSI entry | Auto OHLCV fetch + RSI compute |
| Rule engine in Next.js server action | Edge Function cron every 4 hrs |
| Alert log in DB | Email + WhatsApp push delivery |
| Seed demo data, no auth | Auth + per-user RLS isolation |

## Key Action Flow — "User logs RSI, alert fires"
1. User submits RSI value on stock detail page
2. Server action writes `rsi_readings` row
3. Server action reads latest `fundamental_snapshot` for that stock
4. If `passes_screen = true` AND `rsi_value < 20` → insert `alert_events` row
5. UI refreshes; alert appears in `/alerts` log
6. (Sprint 3) Supabase webhook triggers Edge Function → SendGrid + Twilio

## Layer Plan
1. **Data layer** — tables, seed data, RLS (Sprint 1)
2. **App logic** — CRUD, rule engine, alert creation (Sprint 2)
3. **Delivery** — notification integrations (Sprint 3)
4. **Smart layer** — auto RSI polling, fundamental data fetch (Sprint 4)

## Core Without AI
The fundamental pass/fail rules and RSI threshold are hard-coded numeric comparisons. The app works entirely without any AI or external API.
