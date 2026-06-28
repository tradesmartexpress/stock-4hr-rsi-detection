# PRD — stock-4hr-rsi-detection

## Problem
A stock picker needs to act quickly when an oversold signal appears on a fundamentally strong company. Manually watching dozens of 4-hour charts is impractical and error-prone.

## Target User
Solo retail investor / trader who already has a fundamental conviction list and wants a timely technical entry alert.

## Core Objects
- **Stock** — ticker, name, sector, moat rating, active flag
- **Fundamental Snapshot** — the 7 quantitative criteria + composite pass/fail
- **RSI Reading** — 4-hour RSI value, timestamp, source (manual | auto)
- **Alert Event** — triggered when stock passes fundamentals AND RSI < 20
- **Notification Settings** — email address, WhatsApp number, toggles

## MVP Must-Haves
- [ ] Watchlist page listing stocks with per-criterion pass/fail badges
- [ ] Stock detail page showing all fundamental fields
- [ ] Manual RSI entry form for any stock
- [ ] Rule engine: fundamental pass + RSI < 20 → create alert row
- [ ] Alert log page with triggered events
- [ ] Full CRUD on stocks and fundamental data (no dead buttons)
- [ ] Demo data visible without login

## Non-Goals (v1)
- Automatic OHLCV fetch / RSI computation
- WhatsApp / email delivery
- Multi-user support
- Backtesting

## Success Criterion
User opens the app, sees MSFT on the watchlist with a green "Pass" badge, enters RSI = 18 on the 4-hour form, and immediately sees a new row appear in the Alert Log — all without logging in.
