# PRD — Stock 4HR RSI Alert Tool

## Problem
A stock picker needs to combine rigorous fundamental screening with a precise technical entry signal. Today this requires manually cross-referencing spreadsheets and watching charts — alerts get missed.

## Target User
Sole operator / personal investor. Not a SaaS product.

## Core Objects
- **Stock** — watchlist entry with all fundamental metrics + moat rating
- **RSI Reading** — 4-hour RSI snapshot per ticker (manual or auto-fetched)
- **Alert Event** — fired when RSI crosses below 20 on a fundamentally-passing stock
- **Alert Delivery** — log of each email/WhatsApp send attempt
- **Audit Log** — record of every system action

## MVP Must-Haves
- [ ] Add/edit/delete stocks with all 8 fundamental fields
- [ ] Fundamental pass/fail computed automatically per stock
- [ ] Log 4-hour RSI readings per ticker
- [ ] Rule engine: RSI crossing below 20 creates an Alert Event
- [ ] Alert Events list with acknowledge action
- [ ] Email delivery on trigger (Resend)
- [ ] WhatsApp delivery on trigger (Twilio)
- [ ] All screens viewable without login (demo mode)

## Non-Goals (v1)
- Multi-user / team sharing
- Backtesting
- Auto-fetch fundamental data (v1 is manual entry)
- Portfolio tracking / P&L

## Success Scenario
User adds ASML to watchlist, fills in fundamentals (all pass). Scheduler fetches the 4-hr candle, computes RSI = 19.3, stores the reading. Rule engine detects cross below 20, creates an Alert Event, sends an email and WhatsApp message to the user within 60 seconds. User opens the app, sees the alert, clicks Acknowledge.
