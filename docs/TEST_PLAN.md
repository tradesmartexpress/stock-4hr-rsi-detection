# Test Plan

## Success Scenario (manual walkthrough)
1. Open `/stocks` — 4 seeded stocks visible, fundamental pass badges shown
2. Click **Add Stock** → enter ticker `V`, fill all 8 fundamental fields above thresholds → Save
3. Confirm `V` appears in list with ✅ Pass badge
4. Click `V` → detail page → **Log RSI Reading** → enter 22.0, timestamp now-4h → Save
5. Log second reading: RSI 17.8, timestamp now → Save
6. Navigate to `/alerts` → Alert Event for `V` at RSI 17.8 appears with status `pending`
7. Click **Acknowledge** → status changes to `acknowledged`, timestamp recorded
8. (Sprint 3) Check inbox: email alert received within 60s of step 5
9. (Sprint 3) Check WhatsApp: message received for same event

## Empty / Error Cases
| Scenario | Expected behaviour |
|---|---|
| `/stocks` with no stocks in DB | Empty state message shown, Add Stock CTA |
| Add stock with missing required field | Inline validation error, no DB insert |
| RSI entry with no prior reading | No alert event (no crossover possible) |
| RSI 17 → 15 (already below 20) | No new alert — not a crossover |
| RSI 25 → 19 on fundamentally-failing stock | No alert event created |
| Twilio/Resend API error | `alert_deliveries` row with status=failed + error_message; no crash |
| FMP API timeout in cron | Log error, skip ticker, continue loop |
| Duplicate RSI crossover within 4 hrs | One alert event only (idempotency check on candle_timestamp) |

## Permissions (Sprint 4)
- User A cannot see User B's stocks at `/stocks`
- Direct URL `/stocks/[id]` for another user's stock returns 404
