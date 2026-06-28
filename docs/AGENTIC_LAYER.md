# Agentic Layer

## Risk Classification

| Action | Risk | Approval? |
|---|---|---|
| Compute RSI from OHLCV | Low | Auto |
| Evaluate fundamental screen | Low | Auto |
| Create alert_event row | Low | Auto |
| Draft notification message | Low | Auto (draft stored) |
| Send email via SendGrid | High | Auto after settings confirmed |
| Send WhatsApp via Twilio | High | Auto after settings confirmed |
| Delete stock / alert | High | User confirmation modal |
| Bulk delete / data wipe | Critical | Human-only, no agent |

## Named Tools (approved list)
- `evaluate_fundamental_screen(stock_id)` — reads snapshot, returns pass/fail
- `compute_rsi(ohlcv_array, period=14)` — pure function, no side effects
- `create_alert_event(stock_id, rsi_reading_id)` — writes to DB
- `send_email_alert(alert_event_id)` — SendGrid, logs status
- `send_whatsapp_alert(alert_event_id)` — Twilio, logs status

## Audit Log Fields (on alert_events)
`trigger_type`, `rsi_value`, `fundamental_passed`, `email_status`, `whatsapp_status`, `delivered_at`, `created_at`

## Flow
RSI Reading inserted → `evaluate_fundamental_screen` (auto) → if pass + RSI < 20 → `create_alert_event` (auto) → `send_email_alert` + `send_whatsapp_alert` (auto, Sprint 3)

## v1 vs Later
- **v1**: rule engine runs in Next.js server action on manual submission
- **Later**: Edge Function cron runs the full pipeline automatically every 4 hours
