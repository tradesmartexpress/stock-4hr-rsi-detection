"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export interface PrefsState {
  error: string | null;
  saved: boolean;
}

export async function savePreferences(
  _prev: PrefsState,
  formData: FormData,
): Promise<PrefsState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { error: "You must be signed in.", saved: false };
  }

  const alertEmailRaw = formData.get("alert_email");
  const whatsappRaw = formData.get("whatsapp_number");

  const alert_email =
    typeof alertEmailRaw === "string" && alertEmailRaw.trim() !== ""
      ? alertEmailRaw.trim()
      : null;
  const whatsapp_number =
    typeof whatsappRaw === "string" && whatsappRaw.trim() !== ""
      ? whatsappRaw.trim()
      : null;

  const { error } = await supabase.from("notification_preferences").upsert(
    {
      user_id: user.id,
      alert_email,
      whatsapp_number,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id" },
  );

  if (error) {
    return { error: error.message, saved: false };
  }

  revalidatePath("/settings");
  return { error: null, saved: true };
}
