import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getNLProvider, AIProviderError } from "@/lib/ai/provider";
import type { ExistingMissionRef } from "@/lib/ai/prompt";

export async function POST(request: Request) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const text = typeof body?.text === "string" ? body.text.trim() : "";
  if (!text) {
    return NextResponse.json({ error: "text is required" }, { status: 400 });
  }

  const { data: existing, error } = await supabase
    .from("missions")
    .select("id, destination, start_date, end_date, status")
    .eq("owner_id", user.id)
    .neq("status", "cancelled")
    .order("start_date", { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const existingMissions: ExistingMissionRef[] = existing ?? [];
  const today = new Date().toISOString().slice(0, 10);

  try {
    const provider = getNLProvider();
    const proposal = await provider.parseMissionText(text, { today, existingMissions });

    let current = null;
    if (proposal.action === "update") {
      const { data: currentMission } = await supabase
        .from("missions")
        .select("*")
        .eq("id", proposal.mission_id)
        .eq("owner_id", user.id)
        .single();
      current = currentMission ?? null;
    }

    return NextResponse.json({ proposal, current });
  } catch (err) {
    if (err instanceof AIProviderError) {
      return NextResponse.json({ error: err.message }, { status: 502 });
    }
    console.error("parse error", err);
    return NextResponse.json({ error: "Unexpected error while parsing." }, { status: 500 });
  }
}
