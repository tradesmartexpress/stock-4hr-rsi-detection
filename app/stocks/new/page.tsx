import Link from "next/link";
import { createStock } from "../actions";
import { StockForm } from "../StockForm";

export default function NewStockPage() {
  return (
    <main className="mx-auto max-w-2xl p-8">
      <Link href="/stocks" className="text-sm text-neutral-500 hover:underline">
        ← Back to watchlist
      </Link>
      <h1 className="mb-6 mt-2 text-2xl font-bold tracking-tight">
        Add Stock
      </h1>
      <StockForm action={createStock} submitLabel="Add to watchlist" />
    </main>
  );
}
