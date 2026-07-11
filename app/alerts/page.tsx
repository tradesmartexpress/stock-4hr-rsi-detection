import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import type { AlertEvent } from "@/lib/types";
import { AcknowledgeButton } from "./AcknowledgeButton";

export const dynamic = "force-dynamic";

function StatusBadge({ status }: { status: AlertEvent["status"] }) {
  if (status === "acknowledged") {
    return (
      <span className="inline-flex items-center rounded-full bg-neutral-100 px-2.5 py-0.5 text-xs font-medium text-neutral-600">
        Acknowledged
      </span>
    );
  }
  return (
    <span className="inline-flex items-center rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-medium text-amber-800">
      Pending
    </span>
  );
}

export default async function AlertsPage() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("alert_events")
    .select("*")
    .order("triggered_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  const alerts = (data ?? []) as AlertEvent[];

  return (
    <main className="mx-auto max-w-5xl p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">Alert Events</h1>
        <p className="text-sm text-neutral-500">
          RSI crossed below 20 on a fundamentally-passing stock.
        </p>
      </div>

      {alerts.length === 0 ? (
        <div className="rounded border border-dashed border-neutral-300 p-12 text-center">
          <p className="text-neutral-500">
            No alerts yet. Log RSI readings on a stock to trigger one.
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded border border-neutral-200">
          <table className="w-full text-left text-sm">
            <thead className="bg-neutral-50 text-neutral-600">
              <tr>
                <th className="px-4 py-2.5 font-medium">Ticker</th>
                <th className="px-4 py-2.5 font-medium">RSI</th>
                <th className="px-4 py-2.5 font-medium">Triggered at</th>
                <th className="px-4 py-2.5 font-medium">Status</th>
                <th className="px-4 py-2.5 font-medium"></th>
              </tr>
            </thead>
            <tbody>
              {alerts.map((alert) => (
                <tr key={alert.id} className="border-t border-neutral-200">
                  <td className="px-4 py-3 font-semibold">
                    <Link
                      href={`/stocks/${alert.ticker}`}
                      className="hover:underline"
                    >
                      {alert.ticker}
                    </Link>
                  </td>
                  <td className="px-4 py-3">{alert.rsi_value}</td>
                  <td className="px-4 py-3 text-neutral-500">
                    {new Date(alert.triggered_at).toLocaleString()}
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={alert.status} />
                  </td>
                  <td className="px-4 py-3">
                    {alert.status === "pending" ? (
                      <div className="flex justify-end">
                        <AcknowledgeButton id={alert.id} />
                      </div>
                    ) : (
                      <span className="block text-right text-xs text-neutral-400">
                        {alert.acknowledged_at &&
                          new Date(alert.acknowledged_at).toLocaleString()}
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}
