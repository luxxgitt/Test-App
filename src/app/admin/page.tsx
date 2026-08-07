import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AdminApp } from "@/components/AdminApp";
import type { Mission } from "@/lib/types";

export default async function AdminPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const [{ data: missions }, { data: shareLink }] = await Promise.all([
    supabase
      .from("missions")
      .select("*")
      .eq("owner_id", user.id)
      .order("start_date", { ascending: true }),
    supabase.from("share_links").select("token").eq("owner_id", user.id).maybeSingle(),
  ]);

  return (
    <AdminApp
      initialMissions={(missions ?? []) as Mission[]}
      initialShareToken={shareLink?.token ?? null}
      userEmail={user.email ?? ""}
    />
  );
}
