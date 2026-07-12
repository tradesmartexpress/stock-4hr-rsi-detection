# Sprint 3 — Auto-Fetch + Delivery: operational notes

## What's live
- **`/api/cron/fetch-rsi`** — for each watchlist stock, pulls 4-hour candles
  from FMP (`stable` API base), computes RSI-14 (Wilder), stores an
  `rsi_readings` row, and runs the crossover engine (prev ≥ 20, new < 20,
  gated on `fundamental_pass`, idempotent per candle). Reuses the exact same
  `lib/alert-engine.ts` as manual entry.
- **`/api/cron/fetch-fundamentals`** — built and verified, but **not** on the
  cron schedule. Fundamentals stay manual-entry for now (matches
  ARCHITECTURE.md "Now"); a single TTM call can't produce the 5-year growth
  CAGRs, so auto-sync is deferred. Trigger it manually if desired.
- **Email delivery** — `lib/email.ts` (`send_email_alert`, Resend). On every
  new alert it writes an `alert_deliveries` row (`sent`/`failed` + error).
  Degrades gracefully: if `RESEND_API_KEY` / `ALERT_RECIPIENT_EMAIL` aren't
  set, it logs a `failed` row with a clear reason instead of crashing.

## Required environment variables (Vercel → Project → Settings → Environment Variables)
| Var | Purpose | Status |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL | set |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon key | set |
| `SUPABASE_SERVICE_ROLE_KEY` | Service role — cron writes bypass RLS | set |
| `FMP_API_KEY` | Financial Modeling Prep (stable API) | **add in dashboard** |
| `CRON_SECRET` | Secures the cron route; Vercel sends it as `Authorization: Bearer` | optional but recommended |
| `RESEND_API_KEY` | Email delivery | pending user key |
| `ALERT_RECIPIENT_EMAIL` | Single alert recipient | pending user |
| `ALERT_FROM_EMAIL` | Verified Resend sender (defaults to `alerts@resend.dev`) | optional |

## Cron frequency
`vercel.json` schedules `fetch-rsi` **once daily** (`0 20 * * *`). The Vercel
**Hobby** plan caps crons at once per day. For true 4-hourly detection
(`0 */4 * * *`), upgrade to Vercel Pro and change the one `schedule` line.

## FMP plan note
The current FMP key returns HTTP 402 for some non-US-primary tickers (e.g.
ASML). The cron isolates and logs these per-ticker (audit_logs
`cron_fetch_rsi_error`) and continues the run.
