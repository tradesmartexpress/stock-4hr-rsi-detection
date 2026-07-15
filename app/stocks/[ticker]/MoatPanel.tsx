"use client";

import { useActionState, useTransition } from "react";
import {
  rateMoatWithAI,
  approveMoat,
  overrideMoat,
  type MoatActionState,
} from "./moat-actions";
import type { Stock } from "@/lib/types";

function ReviewBadge({ status }: { status: string | null }) {
  const map: Record<string, string> = {
    approved: "bg-green-100 text-green-800",
    overridden: "bg-blue-100 text-blue-800",
    unreviewed: "bg-amber-100 text-amber-800",
    reviewed: "bg-green-100 text-green-800",
  };
  const cls = map[status ?? ""] ?? "bg-neutral-100 text-neutral-600";
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${cls}`}
    >
      {status ?? "—"}
    </span>
  );
}

export function MoatPanel({ stock }: { stock: Stock }) {
  const action = rateMoatWithAI.bind(null, stock.id, stock.ticker);
  const [state, formAction, isPending] = useActionState<MoatActionState, FormData>(
    action,
    { error: null, message: null },
  );
  const [isReviewing, startReview] = useTransition();

  const hasDraft = stock.moat_rating != null;
  const isUnreviewed = stock.moat_rating_review_status === "unreviewed";

  return (
    <div className="rounded border border-neutral-200 p-4">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-lg font-semibold tracking-tight">Moat Rating</h2>
        {hasDraft && (
          <ReviewBadge status={stock.moat_rating_review_status} />
        )}
      </div>

      {hasDraft ? (
        <div className="mb-4 flex flex-wrap items-center gap-x-6 gap-y-1 text-sm">
          <span className="capitalize">
            <span className="text-neutral-500">Rating:</span>{" "}
            <span className="font-medium">{stock.moat_rating}</span>
          </span>
          <span>
            <span className="text-neutral-500">Source:</span>{" "}
            {stock.moat_rating_source ?? "—"}
          </span>
          {stock.moat_rating_confidence != null && (
            <span>
              <span className="text-neutral-500">Confidence:</span>{" "}
              {Math.round(stock.moat_rating_confidence * 100)}%
            </span>
          )}
        </div>
      ) : (
        <p className="mb-4 text-sm text-neutral-500">
          No moat rating yet. Generate one with AI, then review it.
        </p>
      )}

      {/* Review actions for an unreviewed AI draft */}
      {isUnreviewed && (
        <div className="mb-4 flex flex-wrap gap-2">
          <button
            type="button"
            disabled={isReviewing}
            onClick={() => startReview(() => approveMoat(stock.id, stock.ticker))}
            className="rounded bg-neutral-900 px-3 py-1.5 text-sm font-medium text-white disabled:opacity-50"
          >
            Approve
          </button>
          {(["wide", "narrow", "none"] as const).map((r) => (
            <button
              key={r}
              type="button"
              disabled={isReviewing}
              onClick={() =>
                startReview(() => overrideMoat(stock.id, stock.ticker, r))
              }
              className="rounded border border-neutral-300 px-3 py-1.5 text-sm capitalize hover:bg-neutral-50 disabled:opacity-50"
            >
              Override → {r}
            </button>
          ))}
        </div>
      )}

      <form action={formAction} className="flex flex-col gap-2">
        {state.error && (
          <p className="rounded bg-red-50 px-3 py-2 text-sm text-red-700">
            {state.error}
          </p>
        )}
        {state.message && (
          <p className="rounded bg-green-50 px-3 py-2 text-sm text-green-700">
            {state.message}
          </p>
        )}
        <textarea
          name="input_text"
          rows={2}
          placeholder="Optional: paste a company description or analyst excerpt for the AI to consider…"
          className="rounded border border-neutral-300 px-2 py-1.5 text-sm"
        />
        <button
          type="submit"
          disabled={isPending}
          className="w-fit rounded border border-neutral-300 px-4 py-2 text-sm font-medium hover:bg-neutral-50 disabled:opacity-50"
        >
          {isPending ? "Rating…" : "✨ Rate Moat with AI"}
        </button>
      </form>
    </div>
  );
}
