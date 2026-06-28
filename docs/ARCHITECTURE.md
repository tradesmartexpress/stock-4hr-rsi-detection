# Architecture

## Stack
- **Frontend:** Next.js 14 (App Router) on Vercel
- **Database:** Supabase (Postgres + RLS)
- **Notifications:** SendGrid (email), Twilio/Vonage (WhatsApp)
- **RSI Ingest:** POST `/api/rsi-ingest` — called by an external scheduler (TradingView webhook or cron)

## Now vs Later
| Now | Later |
|-----|-------|
| Manual fundamental entry | Pull from Financial Modeling Prep API |
| Rule-based fundamental scoring | AI moat rating suggestion |
| POST endpoint for RSI | Streaming WebSocket feed |
| Email + WhatsApp alerts | Slack / Telegram |

## Key Action Flow — RSI Alert Fires
1. External source POSTs `{ ticker, rsi, timestamp }` to `/api/rsi-ingest`
2. Server looks up stock by ticker, verifies `fundamental_pass = true`
3. Fetches previous RSI reading; detects cross-below-threshold
4. Inserts `alert_event` row (status: pending)
5. Calls SendGrid + Twilio; inserts `alert_delivery` rows with result
6. Updates `alert_event.delivery_status`
7. `/alerts` page reflects new event in real time (Supabase Realtime or polling)

## Layer Plan
1. **Data first** — tables, RLS, seed data
2. **App logic** — scoring engine, ingest endpoint, CRUD screens
3. **Smart features** — AI moat suggestion, delivery retry, backtest

## Core Without AI
Fundamental scoring is pure rule-based comparisons. RSI detection is a numeric threshold check. The app is fully functional with AI switched off.
