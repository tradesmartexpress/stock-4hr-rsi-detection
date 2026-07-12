import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { PreferencesForm } from "./PreferencesForm";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: pref } = await supabase
    .from("notification_preferences")
    .select("alert_email, whatsapp_number")
    .eq("user_id", user.id)
    .maybeSingle();

  return (
    <main className="mx-auto max-w-3xl p-8">
      <h1 className="mb-1 text-2xl font-bold tracking-tight">Settings</h1>
      <p className="mb-6 text-sm text-neutral-500">
        Alert notification preferences for {user.email}.
      </p>
      <PreferencesForm
        initialEmail={pref?.alert_email ?? null}
        initialWhatsapp={pref?.whatsapp_number ?? null}
        accountEmail={user.email}
      />
    </main>
  );
}
