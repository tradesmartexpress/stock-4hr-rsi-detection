# Intelligence Layer

## Messy Inputs
- User pastes a company description or Morningstar excerpt to rate moat
- Fundamental numbers entered manually (may need normalisation)

## Auto-Structure Schema (moat rating event)
```json
{
  "ticker": "ASML",
  "input_text": "ASML is the sole supplier of EUV lithography machines...",
  "moat_rating": "wide",
  "moat_rating_source": "gpt-4o",
  "moat_rating_confidence": 0.95,
  "moat_rating_review_status": "unreviewed"
}
```

## Events to Track
- `stock_added` — new ticker entered
- `rsi_logged` — new RSI reading stored
- `rsi_alert_triggered` — crossover detected
- `moat_ai_rated` — LLM moat suggestion generated
- `moat_reviewed` — human approved or overrode

## Scoring Rules (rule-based v1)
| Criterion | Threshold | Points |
|---|---|---|
| Revenue CAGR | > 8% | 1 |
| Revenue consecutive growth | 5 yrs | 1 |
| EPS CAGR | > 10% | 1 |
| FCF positive | 5 yrs | 1 |
| Net margin avg | > 5% | 1 |
| ROE avg | > 15% | 1 |
| ROIC avg | > 10% | 1 |
| D/E | < 0.5 | 1 |
| Moat | wide=2, narrow=1 | 1–2 |

Max = 10. Pass threshold = 8.

## What Gets Ranked
- Watchlist stocks sorted by composite fundamental score (descending)

## v1 vs Later
- **v1:** Rule-based score, manual moat entry
- **Later:** LLM moat rating with confidence; API-synced fundamentals auto-scored
