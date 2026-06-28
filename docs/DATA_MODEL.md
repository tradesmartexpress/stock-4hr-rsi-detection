# Data Model

## stocks
| Field | Type | Notes |
|---|---|---|
| id | uuid PK | |
| user_id | uuid nullable | owner, FK added at lock-down |
| ticker | text | e.g. MSFT |
| company_name | text | |
| sector | text | |
| revenue_cagr_5yr | numeric | % |
| revenue_growth_consecutive_years | integer | must be ≥ 5 to pass |
| eps_cagr_5yr | numeric | % |
| fcf_positive_years | integer | must be ≥ 5 |
| net_profit_margin_avg | numeric | % |
| roe_avg | numeric | % |
| roic_avg | numeric | % |
| debt_to_equity | numeric | |
| fundamental_pass | boolean | **generated/stored column** — all 8 rules |
| moat_rating | text | narrow / wide / none |
| moat_rating_source | text | **AI field** |
| moat_rating_confidence | numeric | **AI field** 0–1 |
| moat_rating_review_status | text | unreviewed / approved / overridden |
| notes | text | |

## rsi_readings
| Field | Type | Notes |
|---|---|---|
| id | uuid PK | |
| stock_id | uuid FK → stocks | |
| ticker | text | denormalised for fast queries |
| rsi_value | numeric | RSI-14 |
| candle_timestamp | timestamptz | open time of 4-hr candle |
| source | text | manual / cron-fmp |
| timeframe | text | default '4h' |

## alert_events
| Field | Type | Notes |
|---|---|---|
| id | uuid PK | |
| stock_id | uuid FK → stocks | |
| ticker | text | |
| rsi_value | numeric | value at trigger |
| triggered_at | timestamptz | |
| alert_type | text | rsi_cross_below_20 |
| status | text | pending / acknowledged |
| acknowledged_at | timestamptz | |

## alert_deliveries
| Field | Type | Notes |
|---|---|---|
| alert_event_id | uuid FK → alert_events | |
| channel | text | email / whatsapp |
| recipient | text | |
| status | text | pending / sent / failed |
| delivered_at | timestamptz | |
| error_message | text | |

## audit_logs
| Field | Type | Notes |
|---|---|---|
| action | text | e.g. alert_sent, rsi_logged |
| entity_type | text | |
| entity_id | uuid | |
| payload | jsonb | |
| actor | text | system / user_id |

**RLS:** All tables have permissive v1 policies (read + write open). Lock-down sprint replaces with `auth.uid() = user_id`.
