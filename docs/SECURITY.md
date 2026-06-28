# Security

## Secret Handling
- Supabase service role key, SendGrid API key, Twilio credentials → `.env.local` only
- Never imported into any client component or exposed in API responses
- Vercel environment variables used in production (server-side only)

## Permission Model
- **v1 (demo)**: permissive RLS — all tables readable and writable by anyone
- **Lock-down sprint**: replace with `auth.uid() = user_id` policies; anon users get read-only on seed data only
- Agent actions inherit the calling user's Supabase session — no elevated service-role calls from the frontend

## Approved Tools Rule
- Only the five named tools in AGENTIC_LAYER.md may perform external I/O
- No `eval`, no `run_any`, no dynamic `fetch` to arbitrary URLs from agent code
- Every tool call is logged with input params, output, and timestamp

## Audit Principle
- Every alert creation and every notification dispatch writes a status field back to `alert_events`
- Failed deliveries are flagged (email_status = 'failed') and visible in the alert log
- No meaningful action is silent — if it touches external systems, it leaves a DB record
