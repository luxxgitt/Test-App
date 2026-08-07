"use client";

import { useState } from "react";
import type { DraftMission } from "@/lib/ai/schema";
import { STATUS_ICONS, STATUS_LABELS, type MissionStatus } from "@/lib/types";

const STATUSES: MissionStatus[] = ["possible", "probable", "confirmed", "cancelled"];

export function ManualMissionForm({
  initial,
  saving,
  onSave,
  onCancel,
}: {
  initial: DraftMission;
  saving: boolean;
  onSave: (draft: DraftMission) => void;
  onCancel: () => void;
}) {
  const [draft, setDraft] = useState<DraftMission>(initial);

  function update<K extends keyof DraftMission>(key: K, value: DraftMission[K]) {
    setDraft((d) => ({ ...d, [key]: value }));
  }

  return (
    <div className="space-y-4 rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm">
      <div>
        <label className="mb-1 block text-xs font-medium text-neutral-500">Destination</label>
        <input
          type="text"
          value={draft.destination}
          onChange={(e) => update("destination", e.target.value)}
          className="w-full rounded-xl border border-neutral-200 px-3 py-2.5 text-base outline-none focus:border-neutral-900"
        />
      </div>

      <div className="flex gap-3">
        <div className="flex-1">
          <label className="mb-1 block text-xs font-medium text-neutral-500">Début</label>
          <input
            type="date"
            value={draft.start_date}
            onChange={(e) => update("start_date", e.target.value)}
            className="w-full rounded-xl border border-neutral-200 px-3 py-2.5 text-base outline-none focus:border-neutral-900"
          />
        </div>
        <div className="flex-1">
          <label className="mb-1 block text-xs font-medium text-neutral-500">Fin</label>
          <input
            type="date"
            value={draft.end_date}
            onChange={(e) => update("end_date", e.target.value)}
            className="w-full rounded-xl border border-neutral-200 px-3 py-2.5 text-base outline-none focus:border-neutral-900"
          />
        </div>
      </div>

      <label className="flex items-center gap-2 text-sm text-neutral-600">
        <input
          type="checkbox"
          checked={draft.is_approximate}
          onChange={(e) => update("is_approximate", e.target.checked)}
          className="h-4 w-4 rounded border-neutral-300"
        />
        Dates approximatives
      </label>

      {draft.is_approximate && (
        <div>
          <label className="mb-1 block text-xs font-medium text-neutral-500">
            Libellé affiché (ex: &laquo;&nbsp;Fin octobre&nbsp;&raquo;)
          </label>
          <input
            type="text"
            value={draft.approx_label ?? ""}
            onChange={(e) => update("approx_label", e.target.value || null)}
            className="w-full rounded-xl border border-neutral-200 px-3 py-2.5 text-base outline-none focus:border-neutral-900"
          />
        </div>
      )}

      <div>
        <label className="mb-1 block text-xs font-medium text-neutral-500">Statut</label>
        <div className="grid grid-cols-2 gap-2">
          {STATUSES.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => update("status", s)}
              className={`rounded-xl border px-3 py-2.5 text-sm transition ${
                draft.status === s
                  ? "border-neutral-900 bg-neutral-900 text-white"
                  : "border-neutral-200 bg-white text-neutral-700"
              }`}
            >
              {STATUS_ICONS[s]} {STATUS_LABELS[s]}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="mb-1 block text-xs font-medium text-neutral-500">Note (optionnel)</label>
        <textarea
          value={draft.note ?? ""}
          onChange={(e) => update("note", e.target.value || null)}
          rows={2}
          className="w-full resize-none rounded-xl border border-neutral-200 px-3 py-2.5 text-base outline-none focus:border-neutral-900"
        />
      </div>

      <div className="flex gap-2 pt-1">
        <button
          type="button"
          onClick={onCancel}
          disabled={saving}
          className="flex-1 rounded-xl border border-neutral-200 py-3 text-sm font-medium text-neutral-700 disabled:opacity-50"
        >
          Annuler
        </button>
        <button
          type="button"
          onClick={() => onSave(draft)}
          disabled={saving || !draft.destination.trim()}
          className="flex-1 rounded-xl bg-neutral-900 py-3 text-sm font-medium text-white disabled:opacity-50"
        >
          {saving ? "Enregistrement…" : "Enregistrer"}
        </button>
      </div>
    </div>
  );
}
