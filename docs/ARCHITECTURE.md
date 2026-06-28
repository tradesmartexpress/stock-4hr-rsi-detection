# Architecture

## Stack
- **Frontend:** Next.js 14 (App Router) on Vercel
- **Database:** Supabase (Postgres + RLS)
- **Cron jobs:** Vercel Cron (every 4 hours)
- **Email:** Resend
- **WhatsApp:** Twilio
- **Financial data (Sprint 3):** Financial Modeling Prep API

## Now vs Later
| Now (v1) | Later |
|---|---|
| Manual RSI entry | Auto-fetch 4-hr candles + compute RSI |
| Manual fundamental entry | API-synced fundamentals |
| Email alerts | WhatsApp delivery |
| Rule-based pass/fail | AI moat scoring |

## Key Action Flow — RSI Alert Trigger
1. **Capture:** Vercel cron fetches 4-hr OHLCV for each watched ticker
2. **Compute:** RSI-14 calculated server-side (pure math, no AI needed)
3. **Store:** `rsi_readings` row inserted with value, source, timestamp
4. **Evaluate:** Rule engine checks: RSI < 20 AND previous reading ≥ 20 (crossover)
5. **Trigger:** `alert_events` row created with ticker + RSI value
6. **Deliver:** Resend email + Twilio WhatsApp sent; `alert_deliveries` row logged
7. **Show:** Alert Events page reflects new row; user acknowledges

## Why It Runs Without AI
The fundamental pass/fail is a computed Postgres column using hard-coded numeric thresholds. RSI is a deterministic formula. AI only adds moat rating assistance — the core alert engine never calls an LLM.
