import { createClient } from "@/lib/supabase/server";
import type { AuditLog } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function AuditPage() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("audit_logs")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(200);

  if (error) {
    throw new Error(error.message);
  }

  const logs = (data ?? []) as AuditLog[];

  return (
    <main className="mx-auto max-w-5xl p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">Audit Log</h1>
        <p className="text-sm text-neutral-500">
          Every meaningful state change — RSI logged, alerts fired, moat rated.
        </p>
      </div>

      {logs.length === 0 ? (
        <div className="rounded border border-dashed border-neutral-300 p-12 text-center">
          <p className="text-neutral-500">No audit entries yet.</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded border border-neutral-200">
          <table className="w-full text-left text-sm">
            <thead className="bg-neutral-50 text-neutral-600">
              <tr>
                <th className="px-4 py-2.5 font-medium">When</th>
                <th className="px-4 py-2.5 font-medium">Action</th>
                <th className="px-4 py-2.5 font-medium">Entity</th>
                <th className="px-4 py-2.5 font-medium">Actor</th>
                <th className="px-4 py-2.5 font-medium">Details</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr key={log.id} className="border-t border-neutral-200 align-top">
                  <td className="whitespace-nowrap px-4 py-2.5 text-neutral-500">
                    {new Date(log.created_at).toLocaleString()}
                  </td>
                  <td className="px-4 py-2.5 font-medium">{log.action}</td>
                  <td className="px-4 py-2.5 text-neutral-500">
                    {log.entity_type}
                  </td>
                  <td className="px-4 py-2.5 text-neutral-500">
                    {log.actor ?? "—"}
                  </td>
                  <td className="px-4 py-2.5">
                    {log.payload ? (
                      <code className="block max-w-md overflow-x-auto whitespace-pre-wrap break-words text-xs text-neutral-600">
                        {JSON.stringify(log.payload)}
                      </code>
                    ) : (
                      <span className="text-neutral-400">—</span>
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
