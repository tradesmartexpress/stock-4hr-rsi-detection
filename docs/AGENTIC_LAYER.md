# Agentic Layer

## Risk Classification

### Low Risk — Auto (no approval)
- Compute RSI-14 from candle data → store `rsi_readings` row
- Evaluate RSI crossover rule → create `alert_events` row
- Score fundamental fields → update `fundamental_pass`
- Generate AI moat rating draft (stored as `unreviewed`)

### Medium Risk — Light Approval
- Update `stocks` fundamental fields from API sync (show diff, user confirms)

### High Risk — Always Approval ⚠️
- Send email alert (Resend) — user must have configured recipient
- Send WhatsApp message (Twilio) — user must have configured number
- Both: logged to `alert_deliveries` with status + timestamp

### Critical — Human Only 🔒
- Delete a stock from watchlist (requires explicit UI confirmation)
- Change alert recipient email or WhatsApp number

## Named Tools (no raw send_any / run_any)
| Tool | Action |
|---|---|
| `send_email_alert` | Resend — RSI alert only |
| `send_whatsapp_alert` | Twilio — RSI alert only |
| `fetch_rsi_candles` | FMP API — read only |
| `fetch_fundamentals` | FMP API — read only |
| `generate_moat_rating` | LLM call — returns draft only |

## Audit Log Fields
`action, entity_type, entity_id, payload (JSON), actor, created_at`

## v1 vs Later
- **v1:** email delivery auto; WhatsApp after Twilio creds set
- **Later:** agent auto-snoozes duplicate alerts within 24 hrs
