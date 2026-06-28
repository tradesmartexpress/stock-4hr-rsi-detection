# Test Plan

## v1 Success Scenario (manual)
1. Open `/stocks` — confirm 5 seeded stocks visible, MSFT/AAPL/V show all-green badges, NKE/SBUX show red failures
2. Click MSFT → detail page shows 8 criteria with pass/fail icons and numeric values
3. Click "Add Stock" → enter ticker=GOOGL, fill all fundamental fields meeting all thresholds → save → GOOGL appears with `overall_pass = true`
4. `POST /api/rsi-ingest` with `{ "ticker": "MSFT", "rsi": 18.5, "timestamp": "<now>" }` and header `x-api-key: <INGEST_API_KEY>` → 200 OK
5. Open `/alerts` → new alert event for MSFT visible with RSI 18.5, status 'sent' (or 'pending' before delivery)
6. Check email inbox → alert email received for MSFT
7. Check WhatsApp → message received for MSFT
8. `POST /api/rsi-ingest` for NKE with rsi=15 → 200 OK but NO alert_event created (fundamental_pass = false)

## Empty / Error Cases
| Scenario | Expected |
|----------|----------|
| `/stocks` with no stocks in DB | Empty state: "Add your first stock" prompt with Add button |
| Add stock form submitted with missing required field | Inline validation error, no DB write |
| POST to `/api/rsi-ingest` with wrong API key | 401 Unauthorized, no row written |
| POST with unknown ticker | 404, message "Ticker not found in watchlist" |
| SendGrid delivery fails | alert_delivery row with status='failed' + error_message; alert_event still visible on /alerts |
| RSI reading for stock with `fundamental_pass=false` | Reading stored in rsi_readings, no alert_event created |
| RSI=18 posted but previous reading was already 17 (no cross, already below) | No new alert_event (cross already happened) |

## Permissions (post lock-down sprint)
- User A cannot see User B's stocks or alerts (RLS blocks)
- Unauthenticated GET /stocks → redirect to /login
- Ingest endpoint requires API key regardless of auth state
