# Intelligence Layer

## Messy Input → Structured Data
User may paste raw annual report numbers. The system must normalise them:

```json
{
  "ticker": "MSFT",
  "raw_input": "revenue 2020-2024: 143B, 168B, 198B, 211B, 245B",
  "structured": {
    "revenue_cagr_5y": 14.2,
    "revenue_growth_continuous": true
  },
  "source": "user_paste",
  "confidence": 0.88,
  "review_status": "unreviewed"
}
```

## Rule-Based Scoring (v1 — no AI needed)
Each criterion is a boolean pass. All 8 must pass for `passes_screen = true`:

| Criterion | Rule |
|---|---|
| revenue_cagr_5y | > 8% |
| revenue_growth_continuous | = true |
| eps_cagr_5y | > 10% |
| fcf_positive_5y | = true |
| net_profit_margin_avg | > 5% |
| roe_avg | > 15% |
| roic_avg | > 10% |
| debt_to_equity | < 0.5 |
| moat_rating | ≠ none |

## Events to Track
- Fundamental snapshot created / updated
- RSI reading submitted
- Alert event fired
- Notification delivered / failed

## Later (AI layer)
- Auto-extract fundamental data from uploaded annual report PDF
- AI-generated moat commentary (stored with confidence + review_status)
- Anomaly detection: flag when auto-fetched fundamentals diverge from manual entry
