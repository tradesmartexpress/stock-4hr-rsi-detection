"use client";

import { useTransition } from "react";
import { deleteStock } from "./actions";

export function DeleteStockButton({
  id,
  ticker,
}: {
  id: string;
  ticker: string;
}) {
  const [isPending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={isPending}
      onClick={() => {
        if (window.confirm(`Delete ${ticker} from the watchlist?`)) {
          startTransition(() => {
            deleteStock(id);
          });
        }
      }}
      className="rounded border border-red-200 px-3 py-1.5 text-sm text-red-700 hover:bg-red-50 disabled:opacity-50"
    >
      {isPending ? "Deleting…" : "Delete"}
    </button>
  );
}
