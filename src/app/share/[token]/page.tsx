import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { MissionCalendar } from "@/components/MissionCalendar";
import { UpcomingMissionsList } from "@/components/UpcomingMissionsList";
import type { SharedMission } from "@/lib/types";

export const metadata: Metadata = {
  title: "Déplacements",
  robots: { index: false, follow: false },
};

const todayISO = () => new Date().toISOString().slice(0, 10);

export default async function SharePage({ params }: { params: { token: string } }) {
  const supabase = createClient();
  const { data } = await supabase.rpc("get_shared_missions", { p_token: params.token });
  const missions: SharedMission[] = data ?? [];

  const today = todayISO();
  const upcoming = missions
    .filter((m) => m.end_date >= today)
    .sort((a, b) => a.start_date.localeCompare(b.start_date));

  return (
    <main className="mx-auto min-h-screen max-w-md px-4 pb-16 pt-6">
      <header className="mb-5">
        <h1 className="text-xl font-semibold tracking-tight">Déplacements</h1>
        <p className="text-xs text-neutral-400">Lecture seule</p>
      </header>

      <div className="mb-6">
        <MissionCalendar missions={missions} />
      </div>

      <section>
        <h2 className="mb-2 text-sm font-medium text-neutral-500">Prochaines missions</h2>
        <UpcomingMissionsList missions={upcoming} />
      </section>
    </main>
  );
}
