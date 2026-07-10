"use client";

export default function StocksError({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  return (
    <main className="mx-auto max-w-5xl p-8">
      <div className="rounded border border-red-200 bg-red-50 p-6">
        <p className="font-medium text-red-800">Couldn&apos;t load the watchlist.</p>
        <p className="mt-1 text-sm text-red-700">{error.message}</p>
        <button
          onClick={reset}
          className="mt-4 rounded border border-red-300 px-3 py-1.5 text-sm text-red-800 hover:bg-red-100"
        >
          Try again
        </button>
      </div>
    </main>
  );
}
