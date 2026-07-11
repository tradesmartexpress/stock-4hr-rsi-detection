"use client";

import { useTransition } from "react";
import { acknowledgeAlert } from "./actions";

export function AcknowledgeButton({ id }: { id: string }) {
  const [isPending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={isPending}
      onClick={() => startTransition(() => acknowledgeAlert(id))}
      className="rounded bg-neutral-900 px-3 py-1.5 text-sm font-medium text-white disabled:opacity-50"
    >
      {isPending ? "Acknowledging…" : "Acknowledge"}
    </button>
  );
}
