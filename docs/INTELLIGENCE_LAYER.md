# Intelligence Layer

## Messy Inputs
- Builder enters raw financial figures (revenue for 5 years, EPS per year, FCF, margins, ratios)
- Builder writes a free-text moat description ("strong brand, high switching costs")

## Auto-Structuring
On fundamental snapshot save, the scoring engine immediately evaluates:
```json
{
  "revenue_cagr_pass": true,       // cagr > 8%
  "eps_cagr_pass": true,           // cagr > 10%
  "fcf_pass": true,                // positive all 5 years
  "npm_pass": true,                // avg > 5%
  "roe_pass": true,                // avg > 15%
  "roic_pass": true,               // avg > 10%
  "de_pass": true,                 // D/E < 0.5
  "moat_pass": true,               // rating = 'narrow' or 'wide'
  "overall_pass": true             // all 8 true
}
```

## Events to Track
- Fundamental snapshot saved → scoring engine runs
- RSI reading ingested → cross-detection runs
- Alert event created → notification sent
- Moat AI suggestion generated → review_status = 'unreviewed'

## Scoring Rules (rule-based, v1)
| Criterion | Threshold | Field |
|-----------|-----------|-------|
| Revenue CAGR | > 8% | revenue_cagr_pass |
| EPS CAGR | > 10% | eps_cagr_pass |
| FCF positive | all 5 yr | fcf_pass |
| Net Profit Margin avg | > 5% | npm_pass |
| ROE avg | > 15% | roe_pass |
| ROIC avg | > 10% | roic_pass |
| Debt/Equity | < 0.5 | de_pass |
| Moat | narrow or wide | moat_pass |

## What Gets Ranked
- Stocks sorted by number of passing criteria (8/8 first)
- Alert events sorted by recency

## v1 vs Later
- **v1:** All scoring is rule-based; moat is manually set
- **Later:** LLM reads company description → suggests moat rating → stored as `moat_ai_value` + `source` + `confidence` + `review_status`; human approves before `moat_rating` is updated
