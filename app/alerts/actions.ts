"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function acknowledgeAlert(id: string) {
  const supabase = await createClient();
  const acknowledgedAt = new Date().toISOString();

  const { error } = await supabase
    .from("alert_events")
    .update({ status: "acknowledged", acknowledged_at: acknowledgedAt })
    .eq("id", id);

  if (error) {
    throw new Error(error.message);
  }

  await supabase.from("audit_logs").insert({
    action: "alert_acknowledged",
    entity_type: "alert_event",
    entity_id: id,
    payload: { acknowledged_at: acknowledgedAt },
    actor: "user",
  });

  revalidatePath("/alerts");
}
