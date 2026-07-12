"use client";

import { useActionState } from "react";
import { savePreferences, type PrefsState } from "./actions";

export function PreferencesForm({
  initialEmail,
  initialWhatsapp,
  accountEmail,
}: {
  initialEmail: string | null;
  initialWhatsapp: string | null;
  accountEmail: string | undefined;
}) {
  const [state, formAction, isPending] = useActionState<PrefsState, FormData>(
    savePreferences,
    { error: null, saved: false },
  );

  return (
    <form action={formAction} className="flex max-w-md flex-col gap-4">
      {state.error && (
        <p className="rounded bg-red-50 px-3 py-2 text-sm text-red-700">
          {state.error}
        </p>
      )}
      {state.saved && (
        <p className="rounded bg-green-50 px-3 py-2 text-sm text-green-700">
          Preferences saved.
        </p>
      )}

      <label className="flex flex-col gap-1 text-sm">
        <span className="text-neutral-600">Alert email</span>
        <input
          type="email"
          name="alert_email"
          defaultValue={initialEmail ?? ""}
          placeholder={accountEmail ?? "you@example.com"}
          className="rounded border border-neutral-300 px-3 py-2"
        />
        <span className="text-xs text-neutral-400">
          Where RSI alerts are sent. Leave blank to use the system default.
        </span>
      </label>

      <label className="flex flex-col gap-1 text-sm">
        <span className="text-neutral-600">WhatsApp number (optional)</span>
        <input
          type="tel"
          name="whatsapp_number"
          defaultValue={initialWhatsapp ?? ""}
          placeholder="+6591234567"
          className="rounded border border-neutral-300 px-3 py-2"
        />
        <span className="text-xs text-neutral-400">
          Reserved for WhatsApp delivery (a later sprint).
        </span>
      </label>

      <button
        type="submit"
        disabled={isPending}
        className="w-fit rounded bg-neutral-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
      >
        {isPending ? "Saving…" : "Save preferences"}
      </button>
    </form>
  );
}
