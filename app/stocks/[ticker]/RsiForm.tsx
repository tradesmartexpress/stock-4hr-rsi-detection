"use client";

import { useActionState } from "react";
import { logRsiReading, type RsiFormState } from "./actions";

function toLocalDatetimeValue(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export function RsiForm({ stockId, ticker }: { stockId: string; ticker: string }) {
  const action = logRsiReading.bind(null, stockId, ticker);
  const [state, formAction, isPending] = useActionState<RsiFormState, FormData>(
    action,
    { error: null },
  );

  return (
    <form action={formAction} className="flex flex-wrap items-end gap-3">
      {state.error && (
        <p className="w-full rounded bg-red-50 px-3 py-2 text-sm text-red-700">
          {state.error}
        </p>
      )}
      {state.alertCreated && (
        <p className="w-full rounded bg-amber-50 px-3 py-2 text-sm text-amber-800">
          RSI crossed below 20 — alert event created. Check /alerts.
        </p>
      )}

      <label className="flex flex-col gap-1 text-sm">
        <span className="text-neutral-600">RSI value</span>
        <input
          type="number"
          step="0.1"
          name="rsi_value"
          required
          className="w-28 rounded border border-neutral-300 px-2 py-1.5"
        />
      </label>

      <label className="flex flex-col gap-1 text-sm">
        <span className="text-neutral-600">Candle timestamp</span>
        <input
          type="datetime-local"
          name="candle_timestamp"
          required
          defaultValue={toLocalDatetimeValue(new Date())}
          className="rounded border border-neutral-300 px-2 py-1.5"
        />
      </label>

      <button
        type="submit"
        disabled={isPending}
        className="rounded bg-neutral-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
      >
        {isPending ? "Logging…" : "Log RSI Reading"}
      </button>
    </form>
  );
}
