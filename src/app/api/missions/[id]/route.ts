import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { draftMissionSchema } from "@/lib/ai/schema";

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const parsed = draftMissionSchema.partial().safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.message }, { status: 400 });
  }
  if (Object.keys(parsed.data).length === 0) {
    return NextResponse.json({ error: "no changes provided" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("missions")
    .update(parsed.data)
    .eq("id", params.id)
    .eq("owner_id", user.id)
    .select("*")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ mission: data });
}
