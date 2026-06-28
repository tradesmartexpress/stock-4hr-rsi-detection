# Data Model

## stocks
| Field | Type | Notes |
|---|---|---|
| id | uuid PK | gen_random_uuid() |
| user_id | uuid | nullable until auth sprint |
| ticker | text | e.g. "MSFT" |
| company_name | text | |
| sector | text | |
| moat_rating | text | none / narrow / wide |
| is_active | boolean | soft delete |
| created_at | timestamptz | |

## fundamental_snapshots
| Field | Type | Notes |
|---|---|---|
| id | uuid PK | |
| stock_id | uuid FK → stocks | |
| as_of_date | date | fiscal year end |
| revenue_cagr_5y | numeric | % — rule: > 8 |
| revenue_growth_continuous | boolean | rule: true |
| eps_cagr_5y | numeric | % — rule: > 10 |
| fcf_positive_5y | boolean | rule: true |
| net_profit_margin_avg | numeric | % — rule: > 5 |
| roe_avg | numeric | % — rule: > 15 |
| roic_avg | numeric | % — rule: > 10 |
| debt_to_equity | numeric | rule: < 0.5 |
| **passes_screen** | boolean | AI/rule field |
| passes_screen_source | text | "rule_engine" \| "manual" |
| passes_screen_confidence | numeric | 0–1 |
| passes_screen_review_status | text | unreviewed / confirmed / rejected |
| data_source | text | |

## rsi_readings
| Field | Type | Notes |
|---|---|---|
| id | uuid PK | |
| stock_id | uuid FK → stocks | |
| timeframe | text | default "4h" |
| rsi_value | numeric | 0–100 |
| reading_at | timestamptz | |
| source | text | manual \| auto |

## alert_events
| Field | Type | Notes |
|---|---|---|
| id | uuid PK | |
| stock_id | uuid FK → stocks | |
| rsi_reading_id | uuid FK → rsi_readings | nullable |
| trigger_type | text | "rsi_cross_below_20" |
| rsi_value | numeric | snapshot at trigger |
| fundamental_passed | boolean | snapshot at trigger |
| email_status | text | pending / sent / failed |
| whatsapp_status | text | pending / sent / failed |
| delivered_at | timestamptz | |

## notification_settings
| Field | Type | Notes |
|---|---|---|
| id | uuid PK | |
| user_id | uuid | nullable until auth sprint |
| email_enabled | boolean | |
| email_address | text | |
| whatsapp_enabled | boolean | |
| whatsapp_number | text | E.164 format |

**RLS**: v1 permissive (read + write for all). Auth sprint replaces with `auth.uid() = user_id`.
