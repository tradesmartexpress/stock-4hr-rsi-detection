# Security

## Secret Handling
- API keys (FMP, Twilio, Resend) stored as Vercel environment variables only
- Never referenced in client components or exposed via API routes that return to the browser
- Supabase service-role key used only in server-side cron routes

## Permission Model (phases)
| Phase | Model |
|---|---|
| v1 demo | Permissive RLS — all reads/writes open (no login needed) |
| Lock-down sprint | Supabase Auth; RLS `auth.uid() = user_id`; stocks/readings/alerts scoped to owner |

## Approved Tools Rule
Agent may only call the five named tools in AGENTIC_LAYER.md. No dynamic tool construction. No `eval`, no `run_any`, no `send_any`.

## Audit Principle
Every meaningful state change (alert fired, delivery attempted, moat rating generated, fundamental updated) writes an `audit_logs` row before the action completes. Failures are logged with `error_message`.

## Agent Permission Inheritance
The cron/agent context runs with the Supabase service role for data writes. Alert delivery tools are scoped to the single configured recipient — they cannot be redirected to arbitrary addresses.
