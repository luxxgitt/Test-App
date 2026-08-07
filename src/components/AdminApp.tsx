"use client";

import { useMemo, useState } from "react";
import type { ParseProposal, DraftMission } from "@/lib/ai/schema";
import type { Mission } from "@/lib/types";
import { NaturalLanguageInput } from "@/components/NaturalLanguageInput";
import { ProposalCard } from "@/components/ProposalCard";
import { ManualMissionForm } from "@/components/ManualMissionForm";
import { MissionCalendar } from "@/components/MissionCalendar";
import { UpcomingMissionsList } from "@/components/UpcomingMissionsList";
import { ShareLinkPanel } from "@/components/ShareLinkPanel";
import { STATUS_ICONS } from "@/lib/types";
import { formatDateRange } from "@/lib/missions";
import { createClient } from "@/lib/supabase/client";

function missionToDraft(m: Mission): DraftMission {
  return {
    destination: m.destination,
    start_date: m.start_date,
    end_date: m.end_date,
    is_approximate: m.is_approximate,
    approx_label: m.approx_label,
    status: m.status,
    note: m.note,
  };
}

const todayISO = () => new Date().toISOString().slice(0, 10);

export function AdminApp({
  initialMissions,
  initialShareToken,
  userEmail,
}: {
  initialMissions: Mission[];
  initialShareToken: string | null;
  userEmail: string;
}) {
  const [missions, setMissions] = useState<Mission[]>(initialMissions);
  const [pending, setPending] = useState<{ proposal: ParseProposal; current: Mission | null } | null>(null);
  const [editing, setEditing] = useState<{ draft: DraftMission; missionId?: string } | null>(null);
  const [dayChoices, setDayChoices] = useState<Mission[] | null>(null);
  const [loadingParse, setLoadingParse] = useState(false);
  const [applying, setApplying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const upcoming = useMemo(() => {
    const today = todayISO();
    return missions
      .filter((m) => m.status !== "cancelled" && m.end_date >= today)
      .sort((a, b) => a.start_date.localeCompare(b.start_date));
  }, [missions]);

  function upsertLocal(mission: Mission) {
    setMissions((prev) => {
      const idx = prev.findIndex((m) => m.id === mission.id);
      if (idx === -1) return [...prev, mission];
      const copy = [...prev];
      copy[idx] = mission;
      return copy;
    });
  }

  async function handleNLSubmit(text: string) {
    setError(null);
    setLoadingParse(true);
    setDayChoices(null);
    try {
      const res = await fetch("/api/parse", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Une erreur est survenue.");
        return;
      }
      setPending({ proposal: data.proposal, current: data.current });
    } catch {
      setError("Impossible de contacter le serveur.");
    } finally {
      setLoadingParse(false);
    }
  }

  async function handleConfirmCreate(mission: DraftMission) {
    setApplying(true);
    setError(null);
    try {
      const res = await fetch("/api/missions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(mission),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Impossible d'enregistrer la mission.");
        return;
      }
      upsertLocal(data.mission);
      setPending(null);
      setEditing(null);
    } finally {
      setApplying(false);
    }
  }

  async function handleConfirmUpdate(missionId: string, changes: Partial<DraftMission>) {
    setApplying(true);
    setError(null);
    try {
      const res = await fetch(`/api/missions/${missionId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(changes),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Impossible de modifier la mission.");
        return;
      }
      upsertLocal(data.mission);
      setPending(null);
      setEditing(null);
    } finally {
      setApplying(false);
    }
  }

  function handlePickCandidate(missionId: string, changes: Partial<DraftMission>) {
    const current = missions.find((m) => m.id === missionId) ?? null;
    setPending({ proposal: { action: "update", mission_id: missionId, changes }, current });
  }

  function handleEditFromProposal(draft: DraftMission, missionId?: string) {
    setEditing({ draft, missionId });
    setPending(null);
  }

  function handleSelectExistingMission(mission: Mission) {
    setDayChoices(null);
    setEditing({ draft: missionToDraft(mission), missionId: mission.id });
  }

  function handleCalendarDaySelect(missionsOnDay: Mission[]) {
    if (missionsOnDay.length === 1) {
      handleSelectExistingMission(missionsOnDay[0]!);
    } else {
      setDayChoices(missionsOnDay);
    }
  }

  async function handleManualSave(draft: DraftMission) {
    if (editing?.missionId) {
      await handleConfirmUpdate(editing.missionId, draft);
    } else {
      await handleConfirmCreate(draft);
    }
  }

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    window.location.href = "/login";
  }

  return (
    <main className="mx-auto min-h-screen max-w-md px-4 pb-16 pt-6">
      <header className="mb-5 flex items-center justify-between">
        <h1 className="text-xl font-semibold tracking-tight">Missions</h1>
        <button onClick={handleLogout} className="text-xs text-neutral-400">
          {userEmail} · Déconnexion
        </button>
      </header>

      <div className="mb-4">
        <NaturalLanguageInput onSubmit={handleNLSubmit} loading={loadingParse} />
        {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
      </div>

      {pending && (
        <div className="mb-4">
          <ProposalCard
            proposal={pending.proposal}
            current={pending.current}
            applying={applying}
            onConfirmCreate={handleConfirmCreate}
            onConfirmUpdate={handleConfirmUpdate}
            onEdit={handleEditFromProposal}
            onPickCandidate={handlePickCandidate}
            onDismiss={() => setPending(null)}
          />
        </div>
      )}

      {editing && (
        <div className="mb-4">
          <ManualMissionForm
            initial={editing.draft}
            saving={applying}
            onSave={handleManualSave}
            onCancel={() => setEditing(null)}
          />
        </div>
      )}

      {dayChoices && (
        <div className="mb-4 space-y-2 rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm">
          <p className="text-sm font-medium text-neutral-700">Plusieurs missions ce jour-là :</p>
          {dayChoices.map((m) => (
            <button
              key={m.id}
              onClick={() => handleSelectExistingMission(m)}
              className="flex w-full items-center gap-2 rounded-xl border border-neutral-200 px-3 py-2.5 text-left text-sm"
            >
              <span aria-hidden>{STATUS_ICONS[m.status]}</span>
              <span className="font-medium">{m.destination}</span>
              <span className="text-neutral-500">{formatDateRange(m.start_date, m.end_date)}</span>
            </button>
          ))}
          <button
            onClick={() => setDayChoices(null)}
            className="w-full rounded-xl border border-neutral-200 py-2 text-sm text-neutral-500"
          >
            Fermer
          </button>
        </div>
      )}

      <div className="mb-6">
        <MissionCalendar missions={missions} onSelectDay={handleCalendarDaySelect} />
      </div>

      <section className="mb-6">
        <h2 className="mb-2 text-sm font-medium text-neutral-500">Prochaines missions</h2>
        <UpcomingMissionsList missions={upcoming} onSelect={handleSelectExistingMission} />
      </section>

      <ShareLinkPanel initialToken={initialShareToken} />
    </main>
  );
}
