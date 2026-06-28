# Security

## Secret Handling
- `SENDGRID_API_KEY`, `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_WHATSAPP_FROM`, `SUPABASE_SERVICE_ROLE_KEY` — stored as Vercel environment variables only
- Never imported in any file under `app/` (client bundle); only used in `app/api/` server routes
- RSI ingest endpoint protected by a shared `INGEST_API_KEY` header checked server-side

## Permission Model (v1 → lock-down)
- **v1:** Supabase RLS permissive — all tables readable and writable anonymously (demo mode)
- **Lock-down sprint:** Replace with `auth.uid() = user_id` owner-scoped policies; API routes verify `supabase.auth.getUser()` before mutating data

## Approved Tools Rule
- Agents may only call the five named tools in AGENTIC_LAYER.md
- No `run_any`, `exec`, or raw SQL execution from frontend
- Every tool invocation writes to `alert_deliveries` or returns a structured result — no silent side effects

## Audit Principle
- Every notification sent → row in `alert_deliveries` with channel, recipient, status, timestamp, provider ID
- Every fundamental score computed → `overall_pass` + per-criterion fields stored on `fundamental_snapshots`
- Failed deliveries retain `error_message` for diagnosis
