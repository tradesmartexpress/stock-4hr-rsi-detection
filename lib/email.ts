export interface EmailResult {
  status: "sent" | "failed";
  recipient: string;
  error: string | null;
}

/**
 * send_email_alert — Resend delivery for an RSI alert.
 *
 * Scoped to the single configured recipient (ALERT_RECIPIENT_EMAIL); it
 * cannot be redirected to an arbitrary address. If credentials aren't
 * configured yet it returns a `failed` result with an explanatory error
 * rather than throwing, so the alert engine can still log the attempt.
 */
export async function sendEmailAlert(params: {
  ticker: string;
  rsiValue: number;
  triggeredAt: string;
}): Promise<EmailResult> {
  const apiKey = process.env.RESEND_API_KEY;
  const recipient = process.env.ALERT_RECIPIENT_EMAIL;
  const from = process.env.ALERT_FROM_EMAIL ?? "alerts@resend.dev";

  if (!recipient) {
    return {
      status: "failed",
      recipient: "",
      error: "ALERT_RECIPIENT_EMAIL not configured",
    };
  }
  if (!apiKey) {
    return {
      status: "failed",
      recipient,
      error: "RESEND_API_KEY not configured",
    };
  }

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: recipient,
        subject: `RSI Alert: ${params.ticker} crossed below 20`,
        text:
          `${params.ticker} RSI (4h) crossed below 20.\n` +
          `RSI value: ${params.rsiValue}\n` +
          `Triggered at: ${params.triggeredAt}\n\n` +
          `This stock passes the fundamental screen.`,
      }),
    });

    if (!res.ok) {
      const body = await res.text();
      return {
        status: "failed",
        recipient,
        error: `Resend ${res.status}: ${body.slice(0, 300)}`,
      };
    }

    return { status: "sent", recipient, error: null };
  } catch (err) {
    return {
      status: "failed",
      recipient,
      error: err instanceof Error ? err.message : "Unknown send error",
    };
  }
}
