# Test Plan

## v1 Success Scenario (manual steps)

### Happy path — alert fires
1. Open `/stocks` — confirm 5 demo stocks visible, MSFT shows green "Pass" badge
2. Click MSFT → detail page shows all 9 criteria with green/red icons
3. On detail page, enter RSI value `18.4` → click "Submit RSI"
4. Toast appears: "Alert fired for MSFT — RSI 18.4 on 4h chart"
5. Navigate to `/alerts` — new row shows MSFT, 18.4, timestamp, "Fundamentals: Pass"
6. Return to MSFT detail — "Latest RSI: 18.4 | Status: Alert Fired" displayed

### No alert — stock fails fundamental screen
1. Click XOM (fails screen — EPS CAGR < 10%, ROIC < 10%)
2. Enter RSI value `15.0` → submit
3. No alert row in `/alerts` for this submission
4. Informational message shown: "XOM does not meet fundamental criteria — no alert sent"

### No alert — RSI above threshold
1. Click MSFT (passes screen)
2. Enter RSI value `35.0` → submit
3. RSI reading saved but no alert_event created
4. Message shown: "RSI 35.0 is above the 20 threshold — no alert"

## Empty State Tests
- Delete all stocks → `/stocks` shows empty state illustration and "Add your first stock" CTA
- `/alerts` with no events → "No alerts triggered yet" message

## Error Cases
- Submit RSI with non-numeric value → inline validation error, no DB write
- Supabase offline → error boundary shows "Unable to load data. Please try again."
- Duplicate ticker add → show error "MSFT is already in your watchlist"

## CRUD Verification
- Add stock → appears immediately in list
- Edit fundamental snapshot → updated values reflect on detail page
- Delete stock → removed from list, associated alerts remain in log with "[Deleted]" label
