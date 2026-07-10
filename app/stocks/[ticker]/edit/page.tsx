import Link from "next/link";
import { notFound } from "next/navigation";
import { getStockByTicker } from "../../queries";
import { updateStock } from "../../actions";
import { StockForm } from "../../StockForm";

export default async function EditStockPage({
  params,
}: {
  params: Promise<{ ticker: string }>;
}) {
  const { ticker } = await params;
  const stock = await getStockByTicker(ticker);

  if (!stock) {
    notFound();
  }

  const action = updateStock.bind(null, stock.id);

  return (
    <main className="mx-auto max-w-2xl p-8">
      <Link
        href={`/stocks/${stock.ticker}`}
        className="text-sm text-neutral-500 hover:underline"
      >
        ← Back to {stock.ticker}
      </Link>
      <h1 className="mb-6 mt-2 text-2xl font-bold tracking-tight">
        Edit {stock.ticker}
      </h1>
      <StockForm action={action} initialValues={stock} submitLabel="Save changes" />
    </main>
  );
}
