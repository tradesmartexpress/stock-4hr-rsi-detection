# Agentic Layer

## Risk Levels & Actions

### Low Risk — Auto-execute (no approval)
- Run fundamental scoring engine on snapshot save
- Detect RSI cross-below-threshold on new reading
- Tag alert_event with delivery_status = 'pending'
- Generate AI moat suggestion (stored as draft, review_status = 'unreviewed')

### Medium Risk — Light approval (human confirms)
- Update `fundamental_pass` on a stock (affects whether future RSI alerts fire)
- Accept AI moat suggestion → set `moat_rating` = AI value, review_status = 'approved'

### High Risk — Always approval before execution
- Send WhatsApp message (Twilio) — create alert_delivery row, queue for send, user can cancel within 30s
- Send email (SendGrid) — same approval window

### Critical — Human-only
- Delete a stock and all its history
- Change notification recipient phone / email

## Named Tools
- `score_fundamentals(stock_id)` — reads latest snapshot, writes pass/fail fields
- `detect_rsi_cross(stock_id, new_rsi)` — compares to prior reading, creates alert_event if crossed
- `send_email_alert(alert_event_id)` — calls SendGrid, logs to alert_deliveries
- `send_whatsapp_alert(alert_event_id)` — calls Twilio, logs to alert_deliveries
- `suggest_moat(stock_id, description)` — calls LLM, writes moat_ai_* fields

## Audit Log Fields (alert_deliveries)
`id, alert_event_id, channel, recipient, status, sent_at, error_message, provider_message_id`

## v1 vs Later
- **v1:** `detect_rsi_cross` + `send_email_alert` + `send_whatsapp_alert` are the active agentic tools
- **Later:** `suggest_moat` with human review UI; retry scheduler for failed deliveries
