"use client";

import type { ParseProposal, DraftMission } from "@/lib/ai/schema";
import type { Mission } from "@/lib/types";
import { STATUS_ICONS, STATUS_LABELS } from "@/lib/types";
import { StatusBadge } from "@/components/StatusBadge";
import { formatDateRange, formatMissionDates } from "@/lib/missions";

export function ProposalCard({
  proposal,
  current,
  applying,
  onConfirmCreate,
  onConfirmUpdate,
  onEdit,
  onPickCandidate,
  onDismiss,
}: {
  proposal: ParseProposal;
  current: Mission | null;
  applying: boolean;
  onConfirmCreate: (mission: DraftMission) => void;
  onConfirmUpdate: (missionId: string, changes: Partial<DraftMission>) => void;
  onEdit: (draft: DraftMission, missionId?: string) => void;
  onPickCandidate: (missionId: string, changes: Partial<DraftMission>) => void;
  onDismiss: () => void;
}) {
  if (proposal.action === "unrecognized") {
    return (
      <div className="space-y-3 rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm">
        <p className="text-sm text-neutral-600">{proposal.message}</p>
        <button
          onClick={onDismiss}
          className="w-full rounded-xl border border-neutral-200 py-2.5 text-sm font-medium text-neutral-700"
        >
          Fermer
        </button>
      </div>
    );
  }

  if (proposal.action === "clarify") {
    return (
      <div className="space-y-3 rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm">
        <p className="text-sm font-medium text-neutral-800">{proposal.question}</p>
        <div className="space-y-2">
          {proposal.candidates.map((c) => (
            <button
              key={c.mission_id}
              disabled={applying}
              onClick={() => onPickCandidate(c.mission_id, proposal.changes)}
              className="flex w-full items-center justify-between rounded-xl border border-neutral-200 px-3 py-2.5 text-left text-sm transition active:bg-neutral-50 disabled:opacity-50"
            >
              <span>
                <span className="font-medium">{c.destination}</span>{" "}
                <span className="text-neutral-500">{formatDateRange(c.start_date, c.end_date)}</span>
              </span>
              <StatusBadge status={c.status} className="text-xs text-neutral-500" />
            </button>
          ))}
        </div>
        <button
          onClick={onDismiss}
          disabled={applying}
          className="w-full rounded-xl border border-neutral-200 py-2.5 text-sm font-medium text-neutral-700 disabled:opacity-50"
        >
          Annuler
        </button>
      </div>
    );
  }

  if (proposal.action === "create") {
    const m = proposal.mission;
    return (
      <div className="space-y-3 rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm">
        <div>
          <p className="text-lg font-semibold">{m.destination}</p>
          <p className="text-neutral-500">
            {formatMissionDates(m)}
            {m.is_approximate && <span className="ml-1 text-xs">(approximatif)</span>}
          </p>
          <p className="mt-1">
            <StatusBadge status={m.status} />
          </p>
          {m.note && <p className="mt-1 text-sm text-neutral-500">{m.note}</p>}
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => onEdit(m)}
            disabled={applying}
            className="flex-1 rounded-xl border border-neutral-200 py-2.5 text-sm font-medium text-neutral-700 disabled:opacity-50"
          >
            Modifier
          </button>
          <button
            onClick={() => onConfirmCreate(m)}
            disabled={applying}
            className="flex-1 rounded-xl bg-neutral-900 py-2.5 text-sm font-medium text-white disabled:opacity-50"
          >
            {applying ? "…" : "Confirmer"}
          </button>
        </div>
      </div>
    );
  }

  // action === "update"
  if (!current) {
    return (
      <div className="space-y-3 rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm">
        <p className="text-sm text-neutral-600">Mission introuvable — elle a peut-être déjà été modifiée.</p>
        <button
          onClick={onDismiss}
          className="w-full rounded-xl border border-neutral-200 py-2.5 text-sm font-medium text-neutral-700"
        >
          Fermer
        </button>
      </div>
    );
  }

  const { changes, mission_id } = proposal;
  const datesChange = changes.start_date || changes.end_date || changes.is_approximate !== undefined;
  const statusChange = changes.status && changes.status !== current.status;
  const merged: DraftMission = {
    destination: changes.destination ?? current.destination,
    start_date: changes.start_date ?? current.start_date,
    end_date: changes.end_date ?? current.end_date,
    is_approximate: changes.is_approximate ?? current.is_approximate,
    approx_label: changes.approx_label !== undefined ? changes.approx_label : current.approx_label,
    status: changes.status ?? current.status,
    note: changes.note !== undefined ? changes.note : current.note,
  };

  return (
    <div className="space-y-3 rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm">
      <div>
        <p className="text-lg font-semibold">{merged.destination}</p>

        {datesChange ? (
          <p className="text-neutral-500">
            <span className="line-through opacity-60">{formatMissionDates(current)}</span>
            {" → "}
            <span className="font-medium text-neutral-900">{formatMissionDates(merged)}</span>
          </p>
        ) : (
          <p className="text-neutral-500">{formatMissionDates(current)}</p>
        )}

        {statusChange ? (
          <p className="mt-1 flex items-center gap-1.5">
            <span>
              {STATUS_ICONS[current.status]} {STATUS_LABELS[current.status]}
            </span>
            <span className="text-neutral-400">→</span>
            <span className="font-medium">
              {STATUS_ICONS[merged.status]} {STATUS_LABELS[merged.status]}
            </span>
          </p>
        ) : (
          <p className="mt-1">
            <StatusBadge status={current.status} />
          </p>
        )}

        {changes.note !== undefined && changes.note && (
          <p className="mt-1 text-sm text-neutral-500">{changes.note}</p>
        )}
      </div>
      <div className="flex gap-2">
        <button
          onClick={() => onEdit(merged, mission_id)}
          disabled={applying}
          className="flex-1 rounded-xl border border-neutral-200 py-2.5 text-sm font-medium text-neutral-700 disabled:opacity-50"
        >
          Modifier
        </button>
        <button
          onClick={() => onConfirmUpdate(mission_id, changes)}
          disabled={applying}
          className="flex-1 rounded-xl bg-neutral-900 py-2.5 text-sm font-medium text-white disabled:opacity-50"
        >
          {applying ? "…" : "Confirmer"}
        </button>
      </div>
    </div>
  );
}
