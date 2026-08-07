import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { generateShareToken } from "@/lib/missions";

/** Returns the owner's current share token, if one has been generated yet. */
export async function GET() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const { data, error } = await supabase
    .from("share_links")
    .select("token")
    .eq("owner_id", user.id)
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ token: data?.token ?? null });
}

/**
 * Generates a fresh, cryptographically random token and overwrites the
 * owner's row, which immediately invalidates any previously shared link.
 */
export async function POST() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const token = generateShareToken();

  const { error } = await supabase
    .from("share_links")
    .upsert({ owner_id: user.id, token }, { onConflict: "owner_id" });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ token });
}
