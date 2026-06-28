# PRD — Stock 4H RSI Alert Tool

## Problem
The builder manually monitors dozens of fundamentally strong stocks waiting for oversold technical entries. There is no automated way to be notified when a qualifying stock's 4-hour RSI drops below 20.

## Target User
Solo investor / builder — personal use only, not a SaaS product.

## Core Objects
- **Stock** — ticker, fundamentals, moat rating, RSI threshold
- **Fundamental Snapshot** — dated record of all 7 screener criteria per stock
- **RSI Reading** — 4-hour RSI value + timestamp per stock
- **Alert Event** — fired when RSI crosses below threshold on a fundamentally passing stock
- **Alert Delivery** — per-channel delivery record (email / WhatsApp) with status

## MVP Must-Haves
- [ ] Stock list with fundamental pass/fail badges
- [ ] Fundamental scoring engine: revenue CAGR >8%, EPS CAGR >10%, FCF positive 5yr, NPM avg >5%, ROE avg >15%, ROIC avg >10%, D/E <0.5, at least narrow moat
- [ ] RSI ingestion endpoint (4h, POST)
- [ ] Cross-below-20 detection → creates Alert Event (only for fundamentally passing stocks)
- [ ] Alerts page showing triggered events + delivery status
- [ ] Email + WhatsApp delivery on alert
- [ ] Viewable without login (demo seed data)

## Non-Goals (v1)
- Multi-user / team access
- Automated fundamental data pull from APIs
- Backtesting
- Charts or candlestick views

## Success Criteria
User adds MSFT with passing fundamentals → RSI ingest endpoint receives a reading of 18 (crossed below 20) → Alert Event created → Email and WhatsApp message delivered within 60 seconds → Alert appears on /alerts with status "sent".
