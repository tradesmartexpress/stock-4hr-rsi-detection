# Data Model

## stocks
| Field | Type | Notes |
|-------|------|-------|
| id | uuid PK | |
| user_id | uuid nullable | owner, added at lock-down |
| ticker | text | e.g. MSFT |
| company_name | text | |
| sector | text | |
| moat_rating | text | 'none' / 'narrow' / 'wide' |
| moat_ai_value | text | AI suggestion |
| moat_ai_source | text | model/prompt version |
| moat_ai_confidence | numeric | 0–1 |
| moat_ai_review_status | text | 'unreviewed' / 'approved' / 'overridden' |
| rsi_alert_threshold | numeric | default 20 |
| fundamental_pass | boolean | computed by scoring engine |
| notes | text | |
| created_at | timestamptz | |

## fundamental_snapshots
| Field | Type | Notes |
|-------|------|-------|
| id | uuid PK | |
| stock_id | uuid FK → stocks | |
| snapshot_date | date | |
| revenue_cagr_5yr | numeric | % |
| revenue_growth_continuous | boolean | |
| eps_cagr_5yr | numeric | % |
| fcf_positive_5yr | boolean | |
| net_profit_margin_avg | numeric | % |
| roe_avg | numeric | % |
| roic_avg | numeric | % |
| debt_to_equity | numeric | |
| revenue_cagr_pass / eps_cagr_pass / fcf_pass / npm_pass / roe_pass / roic_pass / de_pass / moat_pass | boolean | per-criterion |
| overall_pass | boolean | all 8 must be true |
| data_source | text | 'manual' / 'api' |

## rsi_readings
| Field | Type | Notes |
|-------|------|-------|
| id | uuid PK | |
| stock_id | uuid FK → stocks | |
| reading_time | timestamptz | bar close time |
| rsi_value | numeric | |
| timeframe | text | '4h' |
| source | text | 'tradingview' / 'manual' |

## alert_events
| Field | Type | Notes |
|-------|------|-------|
| id | uuid PK | |
| stock_id | uuid FK → stocks | |
| rsi_reading_id | uuid FK → rsi_readings | |
| triggered_at | timestamptz | |
| rsi_value_at_trigger | numeric | |
| rsi_threshold | numeric | |
| alert_type | text | 'rsi_cross_below' |
| delivery_status | text | 'pending' / 'sent' / 'failed' |

## alert_deliveries
| Field | Type | Notes |
|-------|------|-------|
| id | uuid PK | |
| alert_event_id | uuid FK → alert_events | |
| channel | text | 'email' / 'whatsapp' |
| recipient | text | address or phone |
| status | text | 'pending' / 'sent' / 'failed' |
| sent_at | timestamptz | |
| error_message | text | |
| provider_message_id | text | |

## RLS
- All tables have RLS enabled
- v1: permissive read + write (demo-first)
- Lock-down sprint: replace with `auth.uid() = user_id` owner policies
